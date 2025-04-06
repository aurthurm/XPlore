import { useState } from "react";
import { Link } from "wouter";
import { Business } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface BusinessCardProps {
  business: Business;
  isHighlighted?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const BusinessCard = ({ business, isHighlighted = false, onClick, compact = false }: BusinessCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Helper function to display price level
  const getPriceLevel = (level?: number) => {
    if (!level) return 'N/A';
    
    const symbols = [];
    for (let i = 0; i < level; i++) {
      symbols.push('$');
    }
    return symbols.join('');
  };

  // Get business label to display
  const getBusinessLabel = () => {
    if (business.tags?.includes('UNESCO Site')) {
      return <span className="tag bg-accent-500 text-white">UNESCO Site</span>;
    }
    if (business.tags?.includes('Top Rated')) {
      return <span className="tag bg-secondary-500 text-white">Top Rated</span>;
    }
    if (business.tags?.includes('Premium')) {
      return <span className="tag bg-white text-slate-700">Premium</span>;
    }
    if (business.tags?.includes('Local Cuisine')) {
      return <span className="tag bg-accent-500 text-white">Local Cuisine</span>;
    }
    return null;
  };

  return (
    <div onClick={onClick}>
      {compact ? (
        // Compact view for sidebar 
        <div className="flex items-center gap-3">
          <img 
            src={business.images?.[0] || 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
            alt={business.name} 
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{business.name}</h3>
            <p className="text-xs text-slate-600">
              {business.city}, Zimbabwe
            </p>
            {business.rating && (
              <div className="flex items-center mt-1">
                <span className="font-semibold text-xs mr-1">{business.rating.toFixed(1)}</span>
                <i className="fas fa-star text-amber-400 text-xs"></i>
                <span className="text-xs text-slate-600 ml-2">
                  {getPriceLevel(business.priceLevel)}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Full view
        <Card 
          className={`overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${
            isHighlighted ? 'ring-2 ring-primary-500 shadow-lg' : ''
          }`}
        >
          <div className="relative">
            <img 
              src={business.images?.[0] || 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
              alt={business.name} 
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2">
              <button 
                className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                onClick={toggleFavorite}
              >
                <i className={`${isFavorite ? 'fas text-red-500' : 'far'} fa-heart text-slate-600`}></i>
              </button>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-2">
              {getBusinessLabel()}
              {isHighlighted && (
                <span className="tag bg-primary-500 text-white">Selected</span>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{business.name}</h3>
                <p className="text-sm text-slate-600">
                  <i className="fas fa-map-marker-alt text-primary-600 mr-1"></i>
                  {business.city}, Zimbabwe
                </p>
              </div>
              {business.rating && (
                <div className="flex items-center bg-primary-50 text-primary-700 px-2 py-1 rounded">
                  <span className="font-semibold mr-1">{business.rating.toFixed(1)}</span>
                  <i className="fas fa-star text-xs"></i>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {business.tags?.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag bg-slate-100 text-slate-700">{tag}</span>
              ))}
            </div>
            
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="font-semibold">{getPriceLevel(business.priceLevel)}</span>
                <span className="text-sm text-slate-600 ml-1">
                  {business.categoryId === 1 ? 'per night' : 
                   business.categoryId === 2 ? 'average price' : 
                   business.categoryId === 3 ? 'entrance fee' : ''}
                </span>
              </div>
              <Link href={`/business/${business.id}`} className="text-primary-600 text-sm font-medium hover:underline">
                View Details
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessCard;
