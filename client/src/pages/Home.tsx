import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Business } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

// Layout components
import Footer from "@/components/layout/Footer";

// Page components
import HeroSection from "@/components/HeroSection";
import CategoryNavigation from "@/components/CategoryNavigation";
import BusinessCard from "@/components/BusinessCard";
import FilterSidebar from "@/components/FilterSidebar";
import FilterDrawer from "@/components/FilterDrawer";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import BusinessOwnerCTA from "@/components/BusinessOwnerCTA";
import ImportDataSection from "@/components/ImportDataSection";
import DownloadSection from "@/components/DownloadSection";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Filter, MapPin, Loader2 } from "lucide-react";

const Home = () => {
  const [location, navigate] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build API URL with filters from URL params
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return `/api/businesses?${params.toString()}`;
  }, [location]);

  // Fetch businesses
  const { 
    data: businesses = [], 
    isLoading, 
    error,
    isFetching 
  } = useQuery<Business[]>({
    queryKey: [buildApiUrl()],
    refetchOnWindowFocus: false,
  });

  // Handle category change from CategoryNavigation
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setActiveCategoryId(categoryId);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    navigate('/');
    setActiveCategoryId(null);
    // Invalidate and refetch businesses
    queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
  }, [navigate, queryClient]);

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

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    let count = 0;
    
    if (params.has('categoryId')) count++;
    if (params.has('keyword')) count++;
    if (params.has('priceLevel')) count++;
    if (params.has('rating')) count++;
    if (params.has('amenities')) count++;
    
    return count;
  }, [location]);

  return (
    <>
      <HeroSection />
      
      <CategoryNavigation onCategoryChange={handleCategoryChange} />
      
      <main className="container mx-auto px-4 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Filters (visible only on desktop) */}
          <div className="lg:col-span-1 order-2 lg:order-1 hidden lg:block">
            <FilterSidebar 
              categories={[]}
              selectedCategory={activeCategoryId}
              onCategoryChange={handleCategoryChange}
              isLoading={false}
            />
          </div>
          
          {/* Main Content Area */}
          <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'} order-1 lg:order-2`}>
            {/* Filter Drawer for Mobile */}
            <FilterDrawer 
              isOpen={isFilterDrawerOpen} 
              onClose={() => setIsFilterDrawerOpen(false)} 
            />
            
            {/* Floating Filter Button (mobile only) */}
            {isMobile && (
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                aria-label="Open filters"
              >
                <Filter className="h-5 w-5 mr-2" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-white text-primary-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </button>
            )}
            
            {/* Active Filters (desktop) */}
            {activeFiltersCount > 0 && !isMobile && (
              <div className="mb-4 flex items-center">
                <span className="text-sm text-slate-600 mr-2">Active filters:</span>
                <Badge variant="outline" className="mr-2">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear all
                </Button>
              </div>
            )}
            
            {/* Listing Results */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <h2 className="font-medium text-xl mr-3">
                    Places
                  </h2>
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
              
              {/* Listing Cards Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-200 h-48 w-full"></div>
                      <div className="p-4">
                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="flex space-x-2 mb-4">
                          <div className="h-6 bg-slate-200 rounded w-16"></div>
                          <div className="h-6 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : businesses?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {sortedBusinesses.map(business => (
                    <BusinessCard 
                      key={business.id} 
                      business={business} 
                      isHighlighted={selectedBusinessId === business.id}
                      onClick={() => setSelectedBusinessId(business.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
              
              {/* Load More - only show if we have results and more to load */}
              {businesses && businesses.length > 9 ? (
                <div className="text-center">
                  <Button variant="outline" className="px-8">
                    Load More
                    <i className="fas fa-chevron-down ml-2"></i>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      
      <FeaturedDestinations />
      
      <BusinessOwnerCTA />
      
      <ImportDataSection />
      
      <DownloadSection />
      
      <Footer />
    </>
  );
};

export default Home;
