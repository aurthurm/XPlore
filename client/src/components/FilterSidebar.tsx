import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const FilterSidebar = () => {
  const [priceLevel, setPriceLevel] = useState<number[]>([]);
  const [accessibility, setAccessibility] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [location, navigate] = useLocation();

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Parse price level
    const priceLevelParam = params.getAll('priceLevel');
    if (priceLevelParam.length) {
      setPriceLevel(priceLevelParam.map(p => parseInt(p)));
    }
    
    // Parse accessibility
    const accessibilityParam = params.getAll('accessibility');
    if (accessibilityParam.length) {
      setAccessibility(accessibilityParam);
    }
    
    // Parse amenities
    const amenitiesParam = params.getAll('amenities');
    if (amenitiesParam.length) {
      setAmenities(amenitiesParam);
    }
    
    // Parse rating
    const ratingParam = params.get('rating');
    if (ratingParam) {
      setRating(parseInt(ratingParam));
    }
  }, []);

  const handlePriceLevel = (level: number) => {
    setPriceLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(p => p !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleAccessibility = (value: string) => {
    setAccessibility(prev => {
      if (prev.includes(value)) {
        return prev.filter(a => a !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleAmenities = (value: string) => {
    setAmenities(prev => {
      if (prev.includes(value)) {
        return prev.filter(a => a !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleRating = (value: number) => {
    setRating(prev => prev === value ? null : value);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Reset filters
    params.delete('priceLevel');
    params.delete('accessibility');
    params.delete('amenities');
    params.delete('rating');
    
    // Apply price level filter
    priceLevel.forEach(p => {
      params.append('priceLevel', p.toString());
    });
    
    // Apply accessibility filter
    accessibility.forEach(a => {
      params.append('accessibility', a);
    });
    
    // Apply amenities filter
    amenities.forEach(a => {
      params.append('amenities', a);
    });
    
    // Apply rating filter
    if (rating !== null) {
      params.set('rating', rating.toString());
    }
    
    navigate(`/?${params.toString()}`);
  };

  const resetFilters = () => {
    setPriceLevel([]);
    setAccessibility([]);
    setAmenities([]);
    setRating(null);
    
    const params = new URLSearchParams(window.location.search);
    params.delete('priceLevel');
    params.delete('accessibility');
    params.delete('amenities');
    params.delete('rating');
    
    navigate(`/?${params.toString()}`);
  };

  return (
    <Card className="sticky top-32">
      <CardContent className="p-4">
        <h2 className="font-medium text-lg mb-4">Filters</h2>
        
        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-slate-700 mb-2">Price Range</h3>
          <div className="flex space-x-2">
            <Button 
              variant={priceLevel.includes(1) ? "default" : "outline"} 
              size="sm"
              onClick={() => handlePriceLevel(1)}
            >
              $
            </Button>
            <Button 
              variant={priceLevel.includes(2) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePriceLevel(2)}
            >
              $$
            </Button>
            <Button 
              variant={priceLevel.includes(3) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePriceLevel(3)}
            >
              $$$
            </Button>
            <Button 
              variant={priceLevel.includes(4) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePriceLevel(4)}
            >
              $$$$
            </Button>
          </div>
        </div>
        
        {/* Accessibility Filter */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-slate-700 mb-2">Accessibility</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="wheelchair" 
                checked={accessibility.includes('Wheelchair Accessible')}
                onCheckedChange={() => handleAccessibility('Wheelchair Accessible')}
              />
              <Label htmlFor="wheelchair" className="ml-2 text-sm">Wheelchair Accessible</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="pet" 
                checked={accessibility.includes('Pet Friendly')}
                onCheckedChange={() => handleAccessibility('Pet Friendly')}
              />
              <Label htmlFor="pet" className="ml-2 text-sm">Pet Friendly</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="family" 
                checked={accessibility.includes('Family Friendly')}
                onCheckedChange={() => handleAccessibility('Family Friendly')}
              />
              <Label htmlFor="family" className="ml-2 text-sm">Family Friendly</Label>
            </div>
          </div>
        </div>
        
        {/* Amenities Filter */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-slate-700 mb-2">Amenities</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="wifi" 
                checked={amenities.includes('WiFi')}
                onCheckedChange={() => handleAmenities('WiFi')}
              />
              <Label htmlFor="wifi" className="ml-2 text-sm">Free Wi-Fi</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="parking" 
                checked={amenities.includes('Parking')}
                onCheckedChange={() => handleAmenities('Parking')}
              />
              <Label htmlFor="parking" className="ml-2 text-sm">Parking Available</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="ac" 
                checked={amenities.includes('Air Conditioning')}
                onCheckedChange={() => handleAmenities('Air Conditioning')}
              />
              <Label htmlFor="ac" className="ml-2 text-sm">Air Conditioning</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="pool" 
                checked={amenities.includes('Pool')}
                onCheckedChange={() => handleAmenities('Pool')}
              />
              <Label htmlFor="pool" className="ml-2 text-sm">Swimming Pool</Label>
            </div>
          </div>
          <button className="text-sm text-primary-600 font-medium mt-2">Show more</button>
        </div>
        
        {/* Rating Filter */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-slate-700 mb-2">Rating</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="rating5" 
                checked={rating === 5}
                onCheckedChange={() => handleRating(5)}
              />
              <Label htmlFor="rating5" className="ml-2 text-sm flex items-center">
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="rating4" 
                checked={rating === 4}
                onCheckedChange={() => handleRating(4)}
              />
              <Label htmlFor="rating4" className="ml-2 text-sm flex items-center">
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="far fa-star text-slate-300"></i>
                <span className="ml-1">& up</span>
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="rating3" 
                checked={rating === 3}
                onCheckedChange={() => handleRating(3)}
              />
              <Label htmlFor="rating3" className="ml-2 text-sm flex items-center">
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="fas fa-star text-accent-500"></i>
                <i className="far fa-star text-slate-300"></i>
                <i className="far fa-star text-slate-300"></i>
                <span className="ml-1">& up</span>
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
          <Button variant="outline" onClick={resetFilters}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
