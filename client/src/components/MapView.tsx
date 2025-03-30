import { useEffect, useRef, useState } from "react";
import { Business } from "@/types";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  businesses: Business[];
  selectedBusinessId?: number;
  onSelectBusiness?: (businessId: number) => void;
}

const MapView = ({ businesses, selectedBusinessId, onSelectBusiness }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Function to safely clean up markers
  const cleanupMarkers = () => {
    if (!window.google || !google.maps) return;

    const currentMarkers = markersRef.current;
    
    if (currentMarkers.length) {
      // Clear all markers from the map
      currentMarkers.forEach(marker => {
        try {
          // Remove listeners first
          google.maps.event.clearInstanceListeners(marker);
          // Then remove from map
          marker.setMap(null);
        } catch (e) {
          console.error("Error clearing marker:", e);
        }
      });
      
      // Reset markers array
      markersRef.current = [];
    }
  };

  // Initialize map only once
  useEffect(() => {
    // Skip if div not ready or map already initialized
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        console.log("Google Maps API not loaded yet");
        return;
      }
      
      try {
        // Get Zimbabwe center coordinates
        const zimbabweCenter = { lat: -19.0154, lng: 29.1549 };

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: zimbabweCenter,
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = mapInstance;
        setIsMapReady(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      console.log("Google Maps not available");
    }

    // Cleanup when component unmounts
    return () => {
      try {
        cleanupMarkers();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      } catch (e) {
        console.error("Error in map cleanup:", e);
      }
    };
  }, []); // Empty dependency array as we only want to run this once

  // Update markers when businesses change or map becomes ready
  useEffect(() => {
    const map = mapInstanceRef.current;
    
    if (!map || !isMapReady || !businesses.length || !window.google || !google.maps) {
      return;
    }
    
    try {
      // Clean up existing markers first
      cleanupMarkers();
      
      // Create new markers
      const newMarkers = businesses.map(business => {
        // Create marker
        const marker = new google.maps.Marker({
          position: { lat: business.latitude, lng: business.longitude },
          map,
          title: business.name,
          animation: selectedBusinessId === business.id ? google.maps.Animation.BOUNCE : undefined,
        });
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-medium">${business.name}</h3>
              <p class="text-sm">${business.address || ''}</p>
              ${business.rating ? `
                <div class="flex items-center mt-1">
                  <span class="text-amber-500 mr-1">
                    <i class="fas fa-star text-xs"></i>
                  </span>
                  <span class="text-sm">${business.rating}</span>
                </div>
              ` : ''}
            </div>
          `,
        });
        
        // Add click listener
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onSelectBusiness) onSelectBusiness(business.id);
        });
        
        return marker;
      });
      
      // Save new markers to ref
      markersRef.current = newMarkers;
      
      // Auto-center map to fit all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          bounds.extend(marker.getPosition()!);
        });
        map.fitBounds(bounds);
        
        // Zoom out slightly to give some context
        const listener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          google.maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error("Error updating markers:", error);
    }
  }, [isMapReady, businesses, selectedBusinessId, onSelectBusiness]);

  // Center on selected business
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady || !selectedBusinessId) return;
    
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
    if (selectedBusiness) {
      map.panTo({ lat: selectedBusiness.latitude, lng: selectedBusiness.longitude });
      map.setZoom(15);
    }
  }, [isMapReady, selectedBusinessId, businesses]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRefresh = () => {
    const map = mapInstanceRef.current;
    const currentMarkers = markersRef.current;
    
    if (!map || !isMapReady || !currentMarkers.length) return;
    
    try {
      const bounds = new google.maps.LatLngBounds();
      currentMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
    } catch (error) {
      console.error("Error refreshing map:", error);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-xl">Map View</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpand}
            className="flex items-center text-sm py-1.5 px-3"
          >
            <i className={`fas fa-${isExpanded ? 'compress-alt' : 'expand-alt'} mr-2`}></i>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="text-sm py-1.5 px-3"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </Button>
        </div>
      </div>
      
      <div className={`map-container ${isExpanded ? 'h-[70vh]' : ''}`}>
        <div ref={mapRef} className="h-full w-full">
          {!businesses.length && (
            <div className="h-full w-full flex items-center justify-center bg-slate-200">
              <div className="text-center">
                <i className="fas fa-map-marked-alt text-5xl text-slate-400 mb-4"></i>
                <p className="text-slate-600">No businesses to display on the map</p>
                <p className="text-sm text-slate-500">Try different search criteria</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button 
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            onClick={() => {
              const map = mapInstanceRef.current;
              if (map && isMapReady) map.setZoom((map.getZoom() || 8) + 1);
            }}
          >
            <i className="fas fa-plus text-slate-700"></i>
          </button>
          <button 
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            onClick={() => {
              const map = mapInstanceRef.current;
              if (map && isMapReady) map.setZoom((map.getZoom() || 8) - 1);
            }}
          >
            <i className="fas fa-minus text-slate-700"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
