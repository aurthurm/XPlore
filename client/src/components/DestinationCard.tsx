import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Star, Heart, Cloud, Sun, CloudRain, MapPin, BookmarkPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DestinationCardProps {
  business: Business;
  onClick?: () => void;
  isHighlighted?: boolean;
  index?: number;
}

const DestinationCard = ({ business, onClick, isHighlighted }: DestinationCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const { toast } = useToast();
  
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
  
  // Format price level to show price with appropriate unit based on category
  const formatPrice = (price: number | undefined) => {
    if (!price) return "Price on request";
    return `$${price.toLocaleString()}`;
  };
  
  // Get price unit based on category
  const getPriceUnit = () => {
    const categoryId = business.categoryId;
    
    switch (categoryId) {
      case 1: // Accommodation
        return "/ night";
      case 2: // Dining
        return "/ meal";
      case 3: // Attractions
        return "/ person";
      case 4: // Shopping
        return "";
      case 5: // Transportation
        return "/ day";
      case 6: // Tours
        return "/ tour";
      default:
        return "";
    }
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

  // Handle saving to favorites
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card onClick from firing
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      description: isSaved ? `${name} has been removed from your favorites` : `${name} has been added to your favorites`,
      duration: 3000,
    });
  };

  // Handle adding to itinerary
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card onClick from firing
    setIsPinned(!isPinned);
    toast({
      title: isPinned ? "Removed from itinerary" : "Added to itinerary wishlist",
      description: isPinned 
        ? `${name} has been removed from your itinerary planning` 
        : `${name} has been added to your itinerary wishlist. Go to your itinerary to plan your visit!`,
      duration: 3000,
    });
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
      
      {/* Card footer with price and action buttons */}
      <div className="p-3 bg-white flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">{formatPrice(priceLevel)}</span>
          <span className="text-xs text-slate-500 ml-1">{getPriceUnit()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Pin/Itinerary Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handlePinClick}
                  className="flex items-center justify-center"
                  aria-label={isPinned ? "Remove from itinerary" : "Add to itinerary"}
                >
                  {isPinned ? (
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPinned ? "Remove from itinerary" : "Add to itinerary"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Favorite/Heart Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleSaveClick}
                  aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      isSaved ? "text-red-500 fill-red-500" : "text-slate-300 hover:text-red-500"
                    }`} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? "Remove from favorites" : "Save to favorites"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export default DestinationCard;