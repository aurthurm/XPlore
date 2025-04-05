import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Itinerary, ItineraryDay, ItineraryItem, Business } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, MapPin, Clock, Home } from 'lucide-react';
import { format } from 'date-fns';
import FallbackMapView from '@/components/FallbackMapView';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Check if Google Maps API key is available
const hasGoogleMapsApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function ItineraryMap() {
  const { id } = useParams<{ id: string }>();
  const itineraryId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [locations, setLocations] = useState<{ lat: number; lng: number; title: string; id: number; type: string }[]>([]);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Query for itinerary details
  const { data: itinerary, isLoading: itineraryLoading, error: itineraryError } = useQuery<Itinerary>({
    queryKey: ['/api/itineraries', itineraryId],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/${itineraryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch itinerary details');
      }
      return response.json();
    }
  });
  
  // Query for itinerary days
  const { data: days, isLoading: daysLoading, error: daysError } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itineraries', itineraryId, 'days'],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/${itineraryId}/days`);
      if (!response.ok) {
        throw new Error('Failed to fetch itinerary days');
      }
      return response.json();
    },
    enabled: !!itineraryId
  });
  
  // Dynamic queries for each day's items
  const dayItemsQueries = days?.map(day => {
    return useQuery<ItineraryItem[]>({
      queryKey: ['/api/itinerary-days', day.id, 'items'],
      queryFn: async () => {
        const response = await fetch(`/api/itinerary-days/${day.id}/items`);
        if (!response.ok) {
          throw new Error(`Failed to fetch items for day ${day.dayNumber}`);
        }
        return response.json();
      },
      enabled: !!day.id
    });
  }) || [];
  
  // Collect all businesses to query for coordinates
  const allItems = dayItemsQueries.flatMap(query => query.data || []);
  const businessIds = allItems
    .filter(item => item.businessId)
    .map(item => item.businessId as number);
  
  // Query businesses for their coordinates
  const businessesQuery = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      
      const response = await fetch(`/api/businesses`);
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      return response.json();
    },
    enabled: businessIds.length > 0
  });
  
  // Initialize Google Maps when dependencies are available
  useEffect(() => {
    if (!hasGoogleMapsApiKey || !mapContainerRef.current || locations.length === 0) return;
    
    // Initialize map if it doesn't exist
    if (!mapRef.current && window.google) {
      const newMap = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: locations[0].lat, lng: locations[0].lng },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapRef.current = newMap;
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Create markers for all locations
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach(location => {
      const position = { lat: location.lat, lng: location.lng };
      bounds.extend(position);
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: location.title,
        animation: window.google.maps.Animation.DROP,
      });
      
      marker.addListener('click', () => {
        // Find which day and item this location belongs to
        days?.forEach((day, dayIndex) => {
          const items = dayItemsQueries[dayIndex]?.data || [];
          const item = items.find(item => 
            (item.businessId && item.businessId === location.id) || 
            (item.id === location.id)
          );
          
          if (item) {
            setSelectedDayId(day.id);
            setSelectedItemId(item.id);
          }
        });
      });
      
      markersRef.current.push(marker);
    });
    
    // Fit bounds to include all markers
    if (markersRef.current.length > 0) {
      mapRef.current?.fitBounds(bounds);
      
      // Adjust zoom level if too zoomed in
      const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
        if (mapRef.current && mapRef.current.getZoom() > 16) {
          mapRef.current.setZoom(16);
        }
      });
    }
  }, [locations, hasGoogleMapsApiKey]);
  
  // Process items to get locations for the map
  useEffect(() => {
    const newLocations: { lat: number; lng: number; title: string; id: number; type: string }[] = [];
    
    // Add businesses from items
    const businesses = businessesQuery.data || [];
    
    allItems.forEach(item => {
      if (item.businessId) {
        const business = businesses.find(b => b.id === item.businessId);
        if (business) {
          newLocations.push({
            lat: business.latitude,
            lng: business.longitude,
            title: business.name,
            id: business.id,
            type: 'business',
          });
        }
      } else if (item.location && item.customDetails) {
        // For custom items with coordinates
        try {
          const details = item.customDetails as any;
          if (details && details.coordinates) {
            newLocations.push({
              lat: details.coordinates.lat,
              lng: details.coordinates.lng,
              title: item.title,
              id: item.id,
              type: 'custom',
            });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    setLocations(newLocations);
  }, [allItems, businessesQuery.data]);
  
  // Handle day selection
  const handleDayClick = (dayId: number) => {
    setSelectedDayId(prev => prev === dayId ? null : dayId);
    setSelectedItemId(null);
  };
  
  // Handle item selection
  const handleItemClick = (itemId: number) => {
    setSelectedItemId(prev => prev === itemId ? null : itemId);
    
    // Find the selected item and center map on it
    if (hasGoogleMapsApiKey && mapRef.current) {
      days?.forEach((day, dayIndex) => {
        const items = dayItemsQueries[dayIndex]?.data || [];
        const item = items.find(item => item.id === itemId);
        
        if (item && item.businessId) {
          const business = businessesQuery.data?.find(b => b.id === item.businessId);
          if (business) {
            mapRef.current?.panTo({ lat: business.latitude, lng: business.longitude });
            mapRef.current?.setZoom(15);
          }
        }
      });
    }
  };
  
  // Format days for display
  const formattedDays = days?.map((day, index) => {
    const dayDate = new Date(day.date);
    const items = dayItemsQueries[index]?.data || [];
    const isLoading = dayItemsQueries[index]?.isLoading || false;
    const hasError = dayItemsQueries[index]?.error || false;
    const isSelected = selectedDayId === day.id;
    
    return {
      ...day,
      formattedDate: format(dayDate, 'EEE, MMM d'),
      items,
      isLoading,
      hasError,
      isSelected
    };
  }).sort((a, b) => a.dayNumber - b.dayNumber) || [];

  // Loading state
  if (itineraryLoading || daysLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (itineraryError || daysError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 text-red-500">
          <p>Error loading itinerary details. Please try again.</p>
          <Button onClick={() => navigate('/itineraries')} className="mt-4">
            Back to Itineraries
          </Button>
        </div>
      </div>
    );
  }
  
  if (!itinerary) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8">
          <p>Itinerary not found.</p>
          <Button onClick={() => navigate('/itineraries')} className="mt-4">
            Back to Itineraries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 h-full">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/itinerary/${itineraryId}`}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/itineraries">
                <Home className="h-4 w-4 mr-1" /> Itineraries
              </Link>
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{itinerary.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow h-full">
          {/* Sidebar with days and items */}
          <div className="md:col-span-1 overflow-y-auto">
            <div className="space-y-2 p-1 h-full">
              {formattedDays.length === 0 ? (
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No days added to this itinerary yet.</p>
                  <Button size="sm" className="mt-2" asChild>
                    <Link to={`/itinerary/${itineraryId}`}>Add Days</Link>
                  </Button>
                </div>
              ) : (
                formattedDays.map(day => (
                  <Card 
                    key={day.id} 
                    className={`cursor-pointer transition-all ${day.isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleDayClick(day.id)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm">
                        Day {day.dayNumber}: {day.formattedDate}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {day.isLoading ? (
                        <div className="py-2 flex justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      ) : day.hasError ? (
                        <p className="text-xs text-red-500">Error loading items</p>
                      ) : day.items.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No activities planned</p>
                      ) : (
                        <div className="space-y-2">
                          {day.items.map(item => (
                            <div 
                              key={item.id}
                              className={`p-2 rounded-md text-xs transition-all cursor-pointer ${
                                selectedItemId === item.id 
                                  ? 'bg-primary/20 border border-primary/30' 
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item.id);
                              }}
                            >
                              <div className="font-medium">{item.title}</div>
                              {item.startTime && (
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{item.startTime.substring(0, 5)}</span>
                                </div>
                              )}
                              {item.location && (
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{item.location}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
          
          {/* Map */}
          <div className="md:col-span-2 h-full min-h-[450px] rounded-lg overflow-hidden border">
            {hasGoogleMapsApiKey ? (
              <div ref={mapContainerRef} className="w-full h-full">
                {locations.length === 0 && (
                  <div className="flex justify-center items-center h-full bg-muted/10">
                    <div className="text-center p-4">
                      <MapPin className="h-10 w-10 mx-auto mb-2 text-muted" />
                      <p className="text-muted-foreground">
                        No map locations found in this itinerary.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <FallbackMapView
                businesses={[]} // We don't use this directly in this view
                selectedBusinessId={
                  selectedItemId 
                    ? allItems.find(i => i.id === selectedItemId)?.businessId || undefined
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}