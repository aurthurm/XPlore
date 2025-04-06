import React from 'react';
import { Category } from '@shared/schema';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  isLoading: boolean;
  className?: string;
}

function FilterSidebar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  isLoading,
  className
}: FilterSidebarProps) {
  // Map category icon names to Lucide icon components
  const getCategoryIcon = (iconName: string) => {
    // This is a simple implementation
    // You can expand this with a more comprehensive icon mapping
    const iconMap: Record<string, string> = {
      bed: "🏨", // Accommodation
      restaurant: "🍽️", // Dining
      camera: "🏛️", // Attractions
      shopping: "🛍️", // Shopping
      bus: "🚌", // Transportation
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
                  className="cursor-pointer"
                  onClick={() => onCategoryChange(category.id)}
                >
                  <span className="mr-1">{getCategoryIcon(category.icon)}</span>
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Additional filters can be added here */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onCategoryChange(null)}
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { FilterSidebar }; 
export default FilterSidebar;