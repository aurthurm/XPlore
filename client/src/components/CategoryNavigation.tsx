import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";

const CategoryNavigation = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [location, navigate] = useLocation();
  
  // Get categories from API
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Parse search params to set initial selected category
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    if (categoryId) {
      setSelectedCategoryId(parseInt(categoryId));
    }
  }, [location]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    
    // Update URL with selected category
    const params = new URLSearchParams(window.location.search);
    
    if (categoryId === null) {
      params.delete('categoryId');
    } else {
      params.set('categoryId', categoryId.toString());
    }
    
    navigate(`/?${params.toString()}`);
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

  if (isLoading) {
    return (
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 -mb-px scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="whitespace-nowrap px-4 py-2 animate-pulse bg-slate-200 rounded-md mr-2 h-8 w-20"></div>
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
          <button 
            className={`whitespace-nowrap px-4 py-2 border-b-2 font-medium ${
              selectedCategoryId === null 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>
          
          {categories?.map((category) => (
            <button 
              key={category.id}
              className={`whitespace-nowrap px-4 py-2 border-b-2 font-medium ${
                selectedCategoryId === category.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <i className={`${getIconForCategory(category.icon)} mr-2`}></i>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
