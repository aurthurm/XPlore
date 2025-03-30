import { useState } from "react";
import { Business } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FallbackMapViewProps {
  businesses: Business[];
  selectedBusinessId?: number;
  onSelectBusiness?: (businessId: number) => void;
}

const FallbackMapView = ({ businesses, selectedBusinessId, onSelectBusiness }: FallbackMapViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
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
        </div>
      </div>
      
      <div className={`map-container ${isExpanded ? 'h-[70vh]' : ''}`}>
        {businesses.length > 0 ? (
          <div className="h-full w-full p-4 bg-slate-100 overflow-auto">
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Map view requires a valid Google Maps API key. Displaying business locations as a list instead.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businesses.map(business => (
                <Card 
                  key={business.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedBusinessId === business.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => onSelectBusiness && onSelectBusiness(business.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-3">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div>
                        <h3 className="font-medium">{business.name}</h3>
                        <p className="text-sm text-slate-600">
                          {business.address}, {business.city}, Zimbabwe
                        </p>
                        <div className="flex mt-2">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            Lat: {business.latitude.toFixed(4)}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ml-2">
                            Lng: {business.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-200">
            <div className="text-center">
              <i className="fas fa-map-marked-alt text-5xl text-slate-400 mb-4"></i>
              <p className="text-slate-600">No businesses to display on the map</p>
              <p className="text-sm text-slate-500">Try different search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackMapView;