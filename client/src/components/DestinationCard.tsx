import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Star, Heart, Cloud, Sun, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business } from "@/types";

interface DestinationCardProps {
  business: Business;
  onClick?: () => void;
  isHighlighted?: boolean;
  index?: number;
}

const DestinationCard = ({ business, onClick, isHighlighted }: DestinationCardProps) => {
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
    return `$${price.toLocaleString()}`;
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

  // Get random weather (in a real app, this would fetch from a weather API)
  const getWeather = () => {
    // For demo purposes, generate random weather
    const weathers = ["sunny", "cloudy", "rainy"];
    const weatherType = weathers[Math.floor(Math.random() * weathers.length)];
    
    const getIcon = () => {
      switch (weatherType) {
        case "sunny": return <Sun className="h-3.5 w-3.5 mr-1 text-yellow-500" />;
        case "cloudy": return <Cloud className="h-3.5 w-3.5 mr-1 text-gray-500" />;
        case "rainy": return <CloudRain className="h-3.5 w-3.5 mr-1 text-blue-500" />;
        default: return <Sun className="h-3.5 w-3.5 mr-1 text-yellow-500" />;
      }
    };
    
    const getTemp = () => {
      // Random temperature between 18-32°C
      return Math.floor(Math.random() * 14) + 18;
    };
    
    return (
      <div className="flex items-center">
        {getIcon()}
        <span>{getTemp()}°C</span>
      </div>
    );
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
        {/* Top row with ratings, price, wifi, and weather */}
        <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-md text-slate-900 text-sm px-2 py-1 flex items-center">
            <Star className="h-3.5 w-3.5 mr-1 text-yellow-400 fill-yellow-400" />
            <span>{rating || "N/A"}</span>
          </div>
          
          <div className="flex space-x-1">
            {/* Weather indicator */}
            <div className="bg-white/70 backdrop-blur-sm rounded-md text-slate-900 text-sm px-2 py-1">
              {getWeather()}
            </div>
            
            {/* WiFi indicator */}
            {hasWifi && (
              <div className="bg-white/70 backdrop-blur-sm rounded-md text-slate-900 text-sm px-2 py-1 flex items-center">
                <Wifi className="h-3.5 w-3.5 mr-1 text-blue-500" />
                <span>10 Mbps</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Image */}
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={getImageUrl()} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Destination name and location overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-sm text-white/80">{getLocation()}</p>
        </div>
      </div>
      
      {/* Card footer with price and heart button */}
      <div className="p-3 bg-white flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">{formatPrice(priceLevel)}</span>
          <span className="text-xs text-slate-500 ml-1">/ night</span>
        </div>
        
        <Heart className="h-5 w-5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" />
      </div>
    </Card>
  );
};

export default DestinationCard;