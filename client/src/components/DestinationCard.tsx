import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business } from "@/types";

interface DestinationCardProps {
  business: Business;
  onClick?: () => void;
  isHighlighted?: boolean;
  index?: number;
}

const DestinationCard = ({ business, onClick, isHighlighted, index }: DestinationCardProps) => {
  const {
    id,
    name,
    description,
    address,
    city,
    rating,
    priceLevel,
    amenities = [],
    images = []
  } = business;

  // Convert amenities to boolean values
  const hasWifi = Array.isArray(amenities) && amenities.includes("wifi");
  
  // Format price level to show price per night/month
  const formatPrice = (price: number | undefined) => {
    if (!price) return "Price on request";
    return `$${price.toLocaleString()} / mo`;
  };

  // Get location display text
  const getLocation = () => {
    if (city) return city;
    if (address && address.includes(",")) {
      return address.split(",").pop()?.trim() || "";
    }
    return "";
  };

  // Get image URL
  const getImageUrl = () => {
    if (images && images.length > 0) {
      return images[0];
    }
    return "https://source.unsplash.com/random/800x600/?destination";
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden border border-slate-200 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer",
        isHighlighted && "ring-2 ring-primary"
      )}
    >
      <div className="relative">
        {/* Top row with numbers and amenities */}
        <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-md text-slate-900 text-sm px-2 py-1">
            {index || id}
          </div>
          
          {/* WiFi indicator */}
          {hasWifi && (
            <div className="bg-white/70 backdrop-blur-sm rounded-md text-slate-900 text-sm px-2 py-1 flex items-center">
              <Wifi className="h-3.5 w-3.5 mr-1" />
              <span>10 Mbps</span>
            </div>
          )}
        </div>
        
        {/* Image */}
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={getImageUrl()} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Destination name and country overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-sm text-white/80">{getLocation()}</p>
        </div>
      </div>
      
      {/* Card footer with price and ratings */}
      <div className="p-3 bg-white flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">{formatPrice(priceLevel)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating || "N/A"}</span>
          </div>
          
          <Heart className="h-5 w-5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" />
        </div>
      </div>
    </Card>
  );
};

export default DestinationCard;