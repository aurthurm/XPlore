import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Business, Category } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

// Layout components
import Footer from "@/components/layout/Footer";

// Page components
import CategoryNavigation from "@/components/CategoryNavigation";
import DestinationCard from "@/components/DestinationCard";
import SidebarContent from "@/components/SidebarContent";
import BusinessOwnerCTA from "@/components/BusinessOwnerCTA";
import ImportDataSection from "@/components/ImportDataSection";
import DownloadSection from "@/components/DownloadSection";
import FilterSidebar from "@/components/FilterSidebar";
import FilterDrawer from "@/components/FilterDrawer";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Loader2, 
  ChevronDown, 
  Search, 
  Filter,
  SlidersHorizontal,
  X
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const ITEMS_PER_PAGE = 8;

const Home = () => {
  const [location, navigate] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the category ID from URL params
  const getCategoryIdFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    return categoryId ? parseInt(categoryId, 10) : null;
  }, [location]);

  const selectedCategory = getCategoryIdFromUrl();

  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    refetchOnWindowFocus: false
  });

  // Build API URL with filters from URL params
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Add amenities filter if any are selected
    if (selectedAmenities.length > 0) {
      params.set('amenities', JSON.stringify(selectedAmenities));
    }
    
    // Add province filter if any are selected
    if (selectedProvinces.length > 0) {
      params.set('provinces', JSON.stringify(selectedProvinces));
    }
    
    return `/api/businesses?${params.toString()}`;
  }, [location, selectedAmenities, selectedProvinces]);

  // Fetch businesses
  const { 
    data: businesses = [], 
    isLoading, 
    error,
    isFetching 
  } = useQuery<any[]>({
    queryKey: [buildApiUrl()],
    refetchOnWindowFocus: false,
  });

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    const params = new URLSearchParams(window.location.search);
    
    if (categoryId) {
      params.set('categoryId', categoryId.toString());
    } else {
      params.delete('categoryId');
    }
    
    navigate(`/?${params.toString()}`);
    setCurrentPage(1); // Reset page when changing categories
  }, [navigate]);

  // Handle amenity change
  const handleAmenityChange = useCallback((amenity: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenity)) {
        return prev.filter(a => a !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
    setCurrentPage(1); // Reset page when changing filters
  }, []);

  // Handle province change
  const handleProvinceChange = useCallback((province: string) => {
    setSelectedProvinces(prev => {
      if (prev.includes(province)) {
        return prev.filter(p => p !== province);
      } else {
        return [...prev, province];
      }
    });
    setCurrentPage(1); // Reset page when changing filters
  }, []);

  // Handle search input
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    
    if (searchQuery) {
      params.set('keyword', searchQuery);
    } else {
      params.delete('keyword');
    }
    
    navigate(`/?${params.toString()}`);
    setCurrentPage(1);
  }, [searchQuery, navigate]);

  // Toggle filter sidebar
  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

  // Load more results
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load businesses. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Sort businesses based on selected option
  const sortedBusinesses = useMemo(() => {
    if (!businesses) return [];
    
    let sorted = [...businesses];
    
    switch (sortBy) {
      case "rating-high":
        sorted = sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "price-low":
        sorted = sorted.sort((a, b) => (a.priceLevel || 0) - (b.priceLevel || 0));
        break;
      case "price-high":
        sorted = sorted.sort((a, b) => (b.priceLevel || 0) - (a.priceLevel || 0));
        break;
      // Default is relevance, which is the API default order
      default:
        break;
    }
    
    return sorted;
  }, [businesses, sortBy]);

  // Paginate results
  const paginatedBusinesses = useMemo(() => {
    return sortedBusinesses.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [sortedBusinesses, currentPage]);

  // Determine if there are more results to load
  const hasMoreResults = sortedBusinesses.length > paginatedBusinesses.length;

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    return selectedAmenities.length + selectedProvinces.length;
  }, [selectedAmenities, selectedProvinces]);

  return (
    <>
      <CategoryNavigation onCategoryChange={handleCategoryChange} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative max-w-screen-2xl">
        {/* Search Bar - visible below headers */}
        <div className="mb-6 max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text"
                placeholder="Search destinations, activities, or attractions..."
                className="w-full py-2.5 pl-10 pr-4 border border-slate-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-l-none">Search</Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
          {/* Filter Sidebar - Only on desktop */}
          {!isMobile && isFilterOpen && (
            <div className="hidden lg:block lg:col-span-1">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                selectedAmenities={selectedAmenities}
                onAmenityChange={handleAmenityChange}
                selectedProvinces={selectedProvinces}
                onProvinceChange={handleProvinceChange}
                isLoading={isLoadingCategories}
              />
            </div>
          )}
          
          {/* Main Content Area - Destinations */}
          <div className="lg:col-span-4">
            {/* Listing Results Header */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center">
                {/* Filter Button instead of "Popular Destinations" title */}
                {isMobile ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mr-3 flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge 
                            variant="default" 
                            className="h-5 w-5 flex items-center justify-center p-0 rounded-full"
                          >
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                      <SheetHeader className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <SheetTitle>Filters</SheetTitle>
                          <SheetClose asChild>
                            <Button size="icon" variant="ghost">
                              <X className="h-4 w-4" />
                            </Button>
                          </SheetClose>
                        </div>
                      </SheetHeader>
                      <div className="overflow-y-auto p-4" style={{ height: "calc(100vh - 80px)" }}>
                        <FilterSidebar 
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onCategoryChange={handleCategoryChange}
                          selectedAmenities={selectedAmenities}
                          onAmenityChange={handleAmenityChange}
                          selectedProvinces={selectedProvinces}
                          onProvinceChange={handleProvinceChange}
                          isLoading={isLoadingCategories}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Button 
                    variant={isFilterOpen ? "default" : "outline"} 
                    size="sm"
                    className="mr-3 flex items-center gap-2"
                    onClick={toggleFilter}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {isFilterOpen ? "Hide Filters" : "Show Filters"}
                    {activeFiltersCount > 0 && !isFilterOpen && (
                      <Badge 
                        variant="default" 
                        className="h-5 w-5 flex items-center justify-center p-0 rounded-full"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                )}
                
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <Badge variant="outline" className="bg-slate-100">
                    {businesses?.length || 0}
                  </Badge>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm text-slate-600 mr-2">Sort by:</span>
                <select 
                  className="border border-slate-300 rounded-md text-sm py-1.5 px-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort businesses"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating-high">Rating: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Destination Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8 px-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-200 h-48 w-full"></div>
                    <div className="p-4">
                      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-1"></div>
                      <div className="flex justify-between mt-2">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8 px-2">
                {paginatedBusinesses.map((business) => (
                  <DestinationCard 
                    key={business.id} 
                    business={business} 
                    isHighlighted={selectedBusinessId === business.id}
                    onClick={() => setSelectedBusinessId(business.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 mx-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">No destinations found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigate('/');
                    setSearchQuery("");
                    setSelectedAmenities([]);
                    setSelectedProvinces([]);
                    queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
            
            {/* Load More Button */}
            {hasMoreResults && (
              <div className="text-center mb-6">
                <Button 
                  variant="outline" 
                  onClick={loadMore} 
                  className="px-8"
                >
                  Load More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Right Sidebar - News, Events, and Ads - Only shown when filter sidebar is not open */}
          {(!isFilterOpen || isMobile) && (
            <div className="lg:col-span-1">
              <SidebarContent />
            </div>
          )}
        </div>
      </main>
      
      <BusinessOwnerCTA />
      
      <ImportDataSection />
      
      <DownloadSection />
      
      <Footer />
    </>
  );
};

export default Home;
