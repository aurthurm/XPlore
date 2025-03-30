import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Business } from "@/types";

// Layout components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Page components
import HeroSection from "@/components/HeroSection";
import CategoryNavigation from "@/components/CategoryNavigation";
import MapView from "@/components/MapView";
import BusinessCard from "@/components/BusinessCard";
import FilterSidebar from "@/components/FilterSidebar";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import BusinessOwnerCTA from "@/components/BusinessOwnerCTA";
import ImportDataSection from "@/components/ImportDataSection";
import DownloadSection from "@/components/DownloadSection";

// UI components
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [location] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>("relevance");
  const { toast } = useToast();

  // Build API URL with filters from URL params
  const buildApiUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return `/api/businesses?${params.toString()}`;
  };

  // Fetch businesses
  const { data: businesses, isLoading, error } = useQuery<Business[]>({
    queryKey: [buildApiUrl()],
  });

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
  const sortedBusinesses = () => {
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
  };

  return (
    <>
      <Header />
      
      <HeroSection />
      
      <CategoryNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FilterSidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Map View */}
            <MapView 
              businesses={businesses || []} 
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={setSelectedBusinessId}
            />
            
            {/* Listing Results */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-xl">
                  {isLoading ? "Loading..." : `Places (${businesses?.length || 0})`}
                </h2>
                <div className="flex items-center">
                  <span className="text-sm text-slate-600 mr-2">Sort by:</span>
                  <select 
                    className="border border-slate-300 rounded-md text-sm py-1.5 px-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  {sortedBusinesses().map(business => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl text-slate-300 mb-4">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
              
              {/* Load More - only show if we have results */}
              {businesses?.length ? (
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
