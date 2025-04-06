import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Category, Business } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CategoryNavigationProps {
  onCategoryChange?: (categoryId: number | null) => void;
}

const CategoryNavigation = ({ onCategoryChange }: CategoryNavigationProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Get categories from API
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get business count for each category
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  // Parse search params to set initial selected category
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    
    if (categoryId) {
      const id = parseInt(categoryId);
      setSelectedCategoryId(id);
    } else {
      setSelectedCategoryId(null);
    }
  }, [location]);

  // Notify parent component when category changes
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategoryId);
    }
  }, [selectedCategoryId, onCategoryChange]);

  const handleCategoryClick = (categoryId: number | null) => {
    // If clicking the same category again, deselect it
    const newCategoryId = selectedCategoryId === categoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    
    // Update URL with selected category
    const params = new URLSearchParams(window.location.search);
    
    if (newCategoryId === null) {
      params.delete('categoryId');
    } else {
      params.set('categoryId', newCategoryId.toString());
    }
    
    navigate(`/?${params.toString()}`);
    
    // Invalidate the businesses query to refetch with the new category filter
    queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
  };

  const getIconForCategory = (icon: string) => {
    switch (icon) {
      case 'bed': return 'fas fa-bed';
      case 'utensils': return 'fas fa-utensils';
      case 'camera': return 'fas fa-camera';
      case 'shopping-bag': return 'fas fa-shopping-bag';
      case 'car': return 'fas fa-car';
      case 'map': return 'fas fa-map';
      default: return 'fas fa-circle';
    }
  };

  // Count businesses in each category
  const getCategoryCount = (categoryId: number) => {
    if (!businesses || !Array.isArray(businesses)) return 0;
    return businesses.filter((business: any) => business.categoryId === categoryId).length;
  };

  if (isLoading) {
    return (
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 -mb-px scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center whitespace-nowrap px-4 py-2 animate-pulse bg-slate-200 rounded-md mr-2 h-8 w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-3 -mb-px scrollbar-hide">
          <div className="relative mr-2">
            <Button 
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap rounded-full"
              onClick={() => handleCategoryClick(null)}
            >
              All Places
            </Button>
            <Badge variant={selectedCategoryId === null ? "secondary" : "outline"} 
              className={`absolute -top-2 -right-2 z-10 min-w-5 h-5 flex items-center justify-center 
                ${selectedCategoryId === null ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {Array.isArray(businesses) ? businesses.length : 0}
            </Badge>
          </div>
          
          {categories?.map((category) => (
            <div key={category.id} className="relative mr-2">
              <Button 
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap rounded-full"
                onClick={() => handleCategoryClick(category.id)}
              >
                <i className={`${getIconForCategory(category.icon)} mr-2`}></i>
                {category.name}
              </Button>
              <Badge variant={selectedCategoryId === category.id ? "secondary" : "outline"} 
                className={`absolute -top-2 -right-2 z-10 min-w-5 h-5 flex items-center justify-center 
                  ${selectedCategoryId === category.id ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {getCategoryCount(category.id)}
              </Badge>
            </div>
          ))}
          
          {/* Clear filters button - shown only when any filter is active */}
          {window.location.search && (
            <Button 
              variant="outline"
              size="sm"
              className="whitespace-nowrap mr-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setSelectedCategoryId(null);
                navigate('/');
                queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
              }}
            >
              <i className="fas fa-times mr-2"></i>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
