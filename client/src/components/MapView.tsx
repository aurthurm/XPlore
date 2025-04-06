import { useEffect, useRef, useState } from "react";
import { Business } from "@/types";
import { Button } from "@/components/ui/button";
import { loadGoogleMapsScript } from "@/lib/utils";

interface MapViewProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  setSelectedBusiness?: (business: Business | null) => void;
}

interface MarkerInfo {
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
  businessId: number;
}

const MapView = ({ 
  businesses, 
  selectedBusiness, 
  setSelectedBusiness 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Clean up markers when component unmounts or businesses change
  const clearMarkers = () => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(({ marker, infoWindow }) => {
        if (marker) {
          if (typeof google !== 'undefined' && google.maps) {
            google.maps.event.clearInstanceListeners(marker);
          }
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    }
  };

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        // Load Google Maps script
        await loadGoogleMapsScript();
        
        if (typeof google === 'undefined' || !google.maps) {
          console.error("Google Maps API not loaded");
          setMapError(true);
          return;
        }

        // Create map instance
        const mapOptions = {
          center: { lat: -19.0154, lng: 29.1549 }, // Zimbabwe center
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, mapOptions);
          mapInstanceRef.current = map;
          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(true);
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      clearMarkers();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when businesses change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded || businesses.length === 0 || typeof google === 'undefined') return;

    try {
      // Clear existing markers
      clearMarkers();
      
      // Create bounds to fit all markers
      const bounds = new google.maps.LatLngBounds();
      
      // Create new markers
      const newMarkers: MarkerInfo[] = [];
      
      businesses.forEach(business => {
        if (!business.latitude || !business.longitude) return;
        
        const position = { lat: business.latitude, lng: business.longitude };
        bounds.extend(position);
        
        // Create the marker
        const marker = new google.maps.Marker({
          position,
          map,
          title: business.name,
          animation: selectedBusiness?.id === business.id 
            ? google.maps.Animation.BOUNCE 
            : undefined
        });
        
        // Create info window with business info
        const infoContent = `
          <div class="p-3">
            <h3 class="font-medium text-base">${business.name}</h3>
            ${business.address ? `<p class="text-sm mt-1">${business.address}</p>` : ''}
            ${business.rating ? `
              <div class="flex items-center mt-2">
                <span class="text-amber-500 mr-1">★</span>
                <span class="text-sm">${business.rating}</span>
              </div>
            ` : ''}
          </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });
        
        // Add click listener
        marker.addListener('click', () => {
          // Close any open info windows
          newMarkers.forEach(m => {
            try {
              m.infoWindow.close();
            } catch (e) {
              console.error("Error closing info window:", e);
            }
          });
          
          // Open this info window
          infoWindow.open({
            map,
            anchor: marker
          });
          
          // Update selected business
          if (setSelectedBusiness) {
            setSelectedBusiness(business);
          }
        });
        
        newMarkers.push({ marker, infoWindow, businessId: business.id });
      });
      
      // Store markers reference
      markersRef.current = newMarkers;
      
      // Fit bounds if we have markers
      if (newMarkers.length > 0) {
        map.fitBounds(bounds);
        
        // Add a slight zoom-out for better context
        google.maps.event.addListener(map, 'idle', function() {
          const currentZoom = map.getZoom();
          if (currentZoom !== undefined && currentZoom > 15) {
            map.setZoom(15);
          }
        });
      }
    } catch (error) {
      console.error("Error adding markers:", error);
      setMapError(true);
    }
  }, [businesses, isMapLoaded, selectedBusiness, setSelectedBusiness]);

  // Handle selected business change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded || !selectedBusiness || typeof google === 'undefined') return;
    
    // Find the marker for this business
    const markerInfo = markersRef.current.find(m => m.businessId === selectedBusiness.id);
    
    if (markerInfo) {
      // Center the map on this business
      map.panTo({ lat: selectedBusiness.latitude, lng: selectedBusiness.longitude });
      map.setZoom(15);
      
      // Open the info window
      markersRef.current.forEach(m => {
        try {
          m.infoWindow.close();
          
          // Update animation
          if (m.businessId === selectedBusiness.id) {
            m.marker.setAnimation(google.maps.Animation.BOUNCE);
          } else {
            m.marker.setAnimation(null);
          }
        } catch (e) {
          console.error("Error updating marker:", e);
        }
      });
      
      // Open this info window
      try {
        markerInfo.infoWindow.open({
          map,
          anchor: markerInfo.marker
        });
      } catch (e) {
        console.error("Error opening info window:", e);
      }
    }
  }, [selectedBusiness, isMapLoaded]);

  // Handle expand/collapse
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Trigger resize event after expansion to fix map display
    setTimeout(() => {
      if (mapInstanceRef.current && typeof google !== 'undefined') {
        try {
          // Force map to resize to fit container
          google.maps.event.addDomListener(window, 'resize', function() {
            mapInstanceRef.current?.setCenter(mapInstanceRef.current.getCenter()!);
          });
          
          // Trigger the resize event
          window.dispatchEvent(new Event('resize'));
        } catch (e) {
          console.error("Error resizing map:", e);
        }
      }
    }, 100);
  };

  // Handle refresh map (recenter)
  const handleRefresh = () => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded || businesses.length === 0) return;
    
    try {
      const bounds = new google.maps.LatLngBounds();
      businesses.forEach(business => {
        if (business.latitude && business.longitude) {
          bounds.extend({ lat: business.latitude, lng: business.longitude });
        }
      });
      map.fitBounds(bounds);
    } catch (error) {
      console.error("Error refreshing map:", error);
    }
  };

  // Check if Google Maps failed to load
  useEffect(() => {
    if (isMapLoaded && (typeof google === 'undefined' || !google.maps)) {
      setMapError(true);
    }
  }, [isMapLoaded]);

  // If map error, show error message
  if (mapError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Map unavailable</h3>
        <p className="text-red-700 mt-1">
          Google Maps couldn't be loaded. This may be due to API key restrictions or 
          network issues. You can still browse businesses in the list view.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-xl">Map View</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpand}
            className="flex items-center text-sm py-1.5 px-3"
          >
            <span className="mr-2">{isExpanded ? '−' : '+'}</span>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center text-sm py-1.5 px-3"
          >
            <span className="mr-2">↻</span>
            Refresh
          </Button>
        </div>
      </div>
      
      <div className={`map-container border rounded-lg ${isExpanded ? 'h-[70vh]' : 'h-[600px]'}`}>
        <div ref={mapRef} className="h-full w-full">
          {!businesses.length && (
            <div className="h-full w-full flex items-center justify-center bg-slate-100">
              <div className="text-center p-8">
                <div className="text-5xl text-slate-400 mb-4">🗺️</div>
                <p className="text-slate-600">No businesses to display on the map</p>
                <p className="text-sm text-slate-500 mt-2">Try different search criteria</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button 
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100"
            onClick={() => {
              const map = mapInstanceRef.current;
              if (map && isMapLoaded) {
                const currentZoom = map.getZoom() || 8;
                map.setZoom(currentZoom + 1);
              }
            }}
          >
            <span className="text-slate-700 text-lg">+</span>
          </button>
          <button 
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100"
            onClick={() => {
              const map = mapInstanceRef.current;
              if (map && isMapLoaded) {
                const currentZoom = map.getZoom() || 8;
                map.setZoom(currentZoom - 1);
              }
            }}
          >
            <span className="text-slate-700 text-lg">−</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
