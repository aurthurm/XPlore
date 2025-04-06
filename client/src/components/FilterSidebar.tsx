import React, { useState, useEffect } from 'react';
import { Category } from '@shared/schema';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  selectedAmenities?: string[];
  onAmenityChange?: (amenity: string) => void;
  selectedProvinces?: string[];
  onProvinceChange?: (province: string) => void;
  isLoading: boolean;
  className?: string;
}

const zimbabweProvinces = [
  "Harare",
  "Bulawayo",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands"
];

// Category-specific amenities
const categoryAmenities: Record<number, string[]> = {
  // Accommodation (ID: 1)
  1: [
    "WiFi",
    "Pool",
    "Air Conditioning",
    "Restaurant",
    "Bar",
    "Breakfast",
    "Room Service",
    "Gym",
    "Conference Room",
    "Pet Friendly",
    "Parking",
    "Laundry"
  ],
  // Dining (ID: 2)
  2: [
    "WiFi",
    "Outdoor Seating",
    "Bar",
    "Private Dining",
    "Live Music",
    "Vegan Options",
    "Gluten-Free Options",
    "Family-Friendly",
    "Alcohol Served",
    "Reservations",
    "Takeaway"
  ],
  // Attractions (ID: 3)
  3: [
    "Guided Tours",
    "Souvenir Shop",
    "Parking",
    "Accessibility",
    "Photography Allowed",
    "Restrooms",
    "Family-Friendly",
    "Interactive Exhibits"
  ],
  // Shopping (ID: 4)
  4: [
    "WiFi",
    "Parking",
    "Air Conditioning",
    "Restrooms",
    "Wheelchair Accessible",
    "ATM",
    "Duty-Free",
    "Tax Refund"
  ],
  // Transportation (ID: 5)
  5: [
    "Airport Pickup",
    "WiFi",
    "Air Conditioning",
    "Child Seats",
    "Wheelchair Accessible",
    "24/7 Service",
    "Premium Vehicles",
    "Licensed Driver",
    "No Boeing",
    "No 737 MAX",
    "Very safe airline",
    "No lost luggage",
    "Big fleet",
    "Premium airline",
    "Low cost airline",
    "Has WiFi",
    "Has free WiFi",
    "No fatal accidents",
    "Low accident rate",
    "Certified US/EU",
    "Allows pets in cabin",
    "No pets in cabin",
    "Eco-friendly"
  ],
  // Tours (ID: 6)
  6: [
    "Local Guide",
    "Refreshments",
    "Souvenir",
    "Small Groups",
    "Private Options",
    "Wheelchair Accessible",
    "Photography Allowed",
    "Restrooms",
    "Family-Friendly"
  ]
};

// Default amenities for when no category is selected
const defaultAmenities = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Restrooms",
  "Wheelchair Accessible",
  "Family-Friendly"
];

function FilterSidebar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  selectedAmenities = [],
  onAmenityChange = () => {},
  selectedProvinces = [],
  onProvinceChange = () => {},
  isLoading,
  className
}: FilterSidebarProps) {
  const [amenities, setAmenities] = useState<string[]>(defaultAmenities);

  // When selected category changes, update amenities list
  useEffect(() => {
    if (selectedCategory === null) {
      setAmenities(defaultAmenities);
    } else if (categoryAmenities[selectedCategory]) {
      setAmenities(categoryAmenities[selectedCategory]);
    }
  }, [selectedCategory]);

  // Map category icon names to Lucide icon components
  const getCategoryIcon = (iconName: string) => {
    // This is a simple implementation
    // You can expand this with a more comprehensive icon mapping
    const iconMap: Record<string, string> = {
      bed: "🏨", // Accommodation
      utensils: "🍽️", // Dining
      camera: "🏛️", // Attractions
      "shopping-bag": "🛍️", // Shopping
      car: "🚌", // Transportation
      map: "🧭", // Tours
    };
    
    return iconMap[iconName] || "📍";
  };

  return (
    <Card className={cn("bg-background", className)}>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4">Filters</h3>
        
        {/* Categories filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Categories</h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories found</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onCategoryChange(null)}
              >
                All
              </Badge>
              
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer relative"
                  onClick={() => onCategoryChange(category.id)}
                >
                  <span className="mr-1">{getCategoryIcon(category.icon)}</span>
                  {category.name}
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {categoryAmenities[category.id]?.length || 0}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />
        
        {/* Amenities filter with two columns */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox 
                  id={`amenity-${amenity}`} 
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => onAmenityChange(amenity)}
                />
                <Label 
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm cursor-pointer flex-grow"
                >
                  <span className="mr-1">
                    {amenity.includes("WiFi") ? "📶" : 
                     amenity.includes("Pool") ? "🏊" : 
                     amenity.includes("Air") ? "❄️" : 
                     amenity.includes("Restaurant") ? "🍴" : 
                     amenity.includes("Bar") ? "🍸" : 
                     amenity.includes("Breakfast") ? "🍳" : 
                     amenity.includes("Parking") ? "🅿️" : 
                     amenity.includes("Room Service") ? "🛎️" : 
                     amenity.includes("Gym") ? "🏋️" : 
                     amenity.includes("Friendly") ? "👪" : 
                     amenity.includes("Outdoor") ? "🌳" : 
                     amenity.includes("Vegan") ? "🥗" : 
                     amenity.includes("Souvenir") ? "🛍️" : 
                     amenity.includes("Tours") ? "🧭" : 
                     amenity.includes("Restrooms") ? "🚻" : 
                     amenity.includes("Wheelchair") ? "♿" : 
                     amenity.includes("Airport") ? "✈️" : 
                     amenity.includes("Boeing") ? "❌" : 
                     amenity.includes("MAX") ? "❌" : 
                     amenity.includes("safe") ? "🛡️" : 
                     amenity.includes("premium") || amenity.includes("Premium") ? "⭐" : 
                     amenity.includes("pets") ? "🐶" : 
                     amenity.includes("Eco") ? "♻️" : 
                     ""}
                  </span>
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Zimbabwe Provinces filter */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Provinces</h4>
          <div className="grid grid-cols-2 gap-2">
            {zimbabweProvinces.map((province) => (
              <div key={province} className="flex items-center space-x-2">
                <Checkbox 
                  id={`province-${province}`} 
                  checked={selectedProvinces.includes(province)}
                  onCheckedChange={() => onProvinceChange(province)}
                />
                <Label 
                  htmlFor={`province-${province}`}
                  className="text-sm cursor-pointer"
                >
                  {province}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Reset filters button */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              onCategoryChange(null);
              // Reset other filters
              selectedAmenities.forEach(amenity => onAmenityChange(amenity));
              selectedProvinces.forEach(province => onProvinceChange(province));
            }}
          >
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { FilterSidebar }; 
export default FilterSidebar;