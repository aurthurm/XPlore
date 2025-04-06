import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Business } from "@/types";
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

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ChevronDown, Search } from "lucide-react";

const ITEMS_PER_PAGE = 8;

const Home = () => {
  const [location, navigate] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Empty function for category navigation
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    // Actual filtering is handled by the CategoryNavigation component directly
    // This is just a placeholder to satisfy the component props
    setCurrentPage(1); // Reset page when changing categories
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

  return (
    <>
      <CategoryNavigation onCategoryChange={handleCategoryChange} />
      
      <main className="container mx-auto px-4 py-8 relative">
        {/* Search Bar - visible below headers */}
        <div className="mb-8">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Main Content Area - Destinations */}
          <div className="lg:col-span-2 xl:col-span-3">
            {/* Listing Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="font-medium text-xl mr-3">
                  Popular Destinations
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
            
            {/* Destination Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-200 h-48 w-full"></div>
                    <div className="p-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {paginatedBusinesses.map((business, index) => (
                  <DestinationCard 
                    key={business.id} 
                    business={business} 
                    isHighlighted={selectedBusinessId === business.id}
                    onClick={() => setSelectedBusinessId(business.id)}
                    index={index + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
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
                    queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
            
            {/* Load More Button */}
            {hasMoreResults && (
              <div className="text-center mb-8">
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
          
          {/* Right Sidebar - News, Events, and Ads */}
          <div className="lg:col-span-1 xl:col-span-1">
            <SidebarContent />
          </div>
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
