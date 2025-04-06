import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { loadGoogleMapsScript } from "@/lib/utils";
import FilterSidebar from "@/components/FilterSidebar";
import BusinessCard from "@/components/BusinessCard";
import { Business as BusinessSchema, Category } from "@shared/schema";
import { Business } from "@/types";

// Fallback component displayed when map is loading or unavailable
const FallbackMapView = () => (
  <div className="w-full h-[400px] bg-muted flex items-center justify-center rounded-lg">
    <div className="text-center">
      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">Map Loading</h3>
      <p className="text-sm text-muted-foreground">
        The interactive map is currently loading or unavailable
      </p>
    </div>
  </div>
);

// Component to render Google Map with business markers
const MapView = ({ 
  businesses,
  selectedBusiness,
  setSelectedBusiness 
}: { 
  businesses: Business[];
  selectedBusiness: Business | null;
  setSelectedBusiness: (business: Business | null) => void;
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
  // Center of Zimbabwe (approximate)
  const defaultCenter = { lat: -19.0154, lng: 29.1549 };
  
  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapLoaded(true))
      .catch(error => console.error("Failed to load Google Maps:", error));
  }, []);
  
  // Initialize map when script is loaded
  useEffect(() => {
    if (!mapLoaded || !document.getElementById('map')) return;
    
    const newMap = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: defaultCenter,
      zoom: 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });
    
    setMap(newMap);
  }, [mapLoaded]);
  
  // Add markers when map and businesses are available
  useEffect(() => {
    if (!map || !businesses.length) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    
    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();
    
    // Add markers for each business
    businesses.forEach(business => {
      if (!business.latitude || !business.longitude) return;
      
      const position = { 
        lat: business.latitude, 
        lng: business.longitude 
      };
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: business.name,
        animation: business.id === selectedBusiness?.id ? 
          google.maps.Animation.BOUNCE : undefined
      });
      
      marker.addListener('click', () => {
        setSelectedBusiness(business);
      });
      
      newMarkers.push(marker);
      bounds.extend(position);
    });
    
    setMarkers(newMarkers);
    
    // Adjust map to fit all markers if there are any
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // If only one marker, zoom out a bit
      if (newMarkers.length === 1) {
        const zoomListener = google.maps.event.addListener(map, 'idle', () => {
          map.setZoom(Math.min(14, map.getZoom() || 14));
          google.maps.event.removeListener(zoomListener);
        });
      }
    }
  }, [map, businesses, selectedBusiness]);
  
  if (!mapLoaded) {
    return <FallbackMapView />;
  }
  
  return (
    <div id="map" className="w-full h-[600px] rounded-lg border"></div>
  );
};

// Main Explore component
export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Helper function to convert schema business type to frontend business type
  const transformBusiness = (b: BusinessSchema): Business => ({
    id: b.id,
    name: b.name,
    description: b.description || undefined,
    address: b.address || undefined,
    city: b.city || undefined,
    latitude: b.latitude,
    longitude: b.longitude,
    categoryId: b.categoryId,
    ownerId: b.ownerId || undefined,
    claimed: b.claimed || false,
    rating: b.rating || undefined,
    priceLevel: b.priceLevel || undefined,
    website: b.website || undefined,
    phone: b.phone || undefined,
    images: b.images || undefined,
    tags: b.tags || undefined,
    amenities: b.amenities || undefined,
    createdAt: new Date(),
    googlePlaceId: b.googlePlaceId || undefined,
  });

  // Fetch all businesses
  const { 
    data: schemaBusinesses = [], 
    isLoading: isLoadingBusinesses 
  } = useQuery<BusinessSchema[]>({
    queryKey: ['/api/businesses', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory ? 
        `/api/businesses?categoryId=${selectedCategory}` : 
        '/api/businesses';
      const res = await fetch(url);
      return res.json();
    }
  });
  
  // Transform businesses to frontend type
  const businesses = useMemo<Business[]>(() => 
    schemaBusinesses.map(transformBusiness), 
    [schemaBusinesses]
  );
  
  // Fetch all categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Handle category selection
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };
  
  // Different layout for mobile and desktop
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Explore Zimbabwe</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Map Section - Increased width */}
        <div className="w-full md:w-3/4 order-2 md:order-1">
          {/* Category filter badges shown inline with reset button */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => handleCategoryChange(null)}
            >
              All Categories
            </Badge>
            
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Badge>
            ))}
            
            {selectedCategory !== null && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto whitespace-nowrap"
                onClick={() => handleCategoryChange(null)}
              >
                Reset Filters
              </Button>
            )}
          </div>
          
          {isLoadingBusinesses ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MapView 
              businesses={businesses} 
              selectedBusiness={selectedBusiness}
              setSelectedBusiness={setSelectedBusiness}
            />
          )}
          
          {/* Mobile Filter Button */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <FilterSidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  isLoading={isLoadingCategories}
                  className="pt-6"
                />
              </SheetContent>
            </Sheet>
          )}
          
          {/* Selected Business Detail Card */}
          {selectedBusiness && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <BusinessCard business={selectedBusiness} />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => setSelectedBusiness(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar - Desktop Only, reduced width */}
        {!isMobile && (
          <div className="w-full md:w-1/4 order-1 md:order-2">
            <FilterSidebar 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={isLoadingCategories}
            />
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Featured Businesses</h3>
              <div className="space-y-4">
                {isLoadingBusinesses ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-32 bg-muted animate-pulse"></div>
                    </Card>
                  ))
                ) : businesses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No businesses found for the selected filters
                  </p>
                ) : (
                  businesses.slice(0, 3).map(business => (
                    <Card 
                      key={business.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <CardContent className="p-4">
                        <BusinessCard business={business} compact />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}