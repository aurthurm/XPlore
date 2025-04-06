import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Star, Heart, Cloud, Sun, CloudRain, MapPin, BookmarkPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
          <span className="text-xs text-slate-500 ml-1">/ night</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Pin/Itinerary Button */}
          <button 
            onClick={handlePinClick}
            className="group relative flex items-center justify-center"
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
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isPinned ? "Remove from itinerary" : "Add to itinerary"}
            </span>
          </button>
          
          {/* Favorite/Heart Button */}
          <button 
            onClick={handleSaveClick}
            className="group relative"
            aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isSaved ? "text-red-500 fill-red-500" : "text-slate-300 hover:text-red-500"
              }`} 
            />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isSaved ? "Remove from favorites" : "Save to favorites"}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DestinationCard;