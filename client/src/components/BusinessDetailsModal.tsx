import { useState, useEffect } from 'react';
import { Business, Category } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Globe, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { getPriceLevelSymbol } from '@/lib/utils';
import DestinationCard from '@/components/DestinationCard';

type BusinessDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  businessId: number | null;
};

// Type augmentation for Business to include optional fields
interface BusinessWithExtras extends Business {
  imageUrl?: string;
  businessHours?: string;
  priceRange?: string;
}

export default function BusinessDetailsModal({ 
  isOpen, 
  onClose, 
  businessId 
}: BusinessDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch the selected business
  const { data: business, isLoading: isBusinessLoading } = useQuery<Business>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: isOpen && businessId !== null,
  });
  
  // Fetch all businesses for recommendations
  const { data: allBusinesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
    enabled: isOpen && businessId !== null,
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });
  
  // Get related businesses (top 5 in categories of interest)
  const relatedBusinesses = allBusinesses.filter(b => 
    // Same category, but not the same business
    b.id !== businessId && b.categoryId === business?.categoryId
  ).slice(0, 5);
  
  // Get recommended businesses (top 5 from other categories of interest)
  const recommendedCategories = business?.categoryId 
    ? getCategoriesOfInterest(business.categoryId)
    : [];
  
  const recommendations = allBusinesses.filter(b => 
    b.id !== businessId && 
    recommendedCategories.includes(b.categoryId)
  ).slice(0, 5);
  
  // Reset tab to 'details' when business changes
  useEffect(() => {
    setActiveTab('details');
  }, [businessId]);
  
  // Get category name from ID
  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };
  
  // Get categories of interest based on current category
  function getCategoriesOfInterest(categoryId: number): number[] {
    // Based on the current category, suggest other relevant categories
    // 1: Accommodation, 2: Dining, 3: Attractions, 4: Shopping, 5: Transportation, 6: Tours
    switch (categoryId) {
      case 1: // Accommodation
        return [2, 3, 6]; // Dining, Attractions, Tours
      case 2: // Dining
        return [1, 3, 4]; // Accommodation, Attractions, Shopping
      case 3: // Attractions
        return [1, 2, 6]; // Accommodation, Dining, Tours
      case 4: // Shopping
        return [2, 5]; // Dining, Transportation
      case 5: // Transportation
        return [1, 3, 6]; // Accommodation, Attractions, Tours
      case 6: // Tours
        return [1, 2, 3]; // Accommodation, Dining, Attractions
      default:
        return [];
    }
  }
  
  // Get image URL from business
  const getBusinessImage = (business?: Business): string => {
    if (!business) return 'https://placehold.co/800x400?text=No+Image';
    if (business.images && business.images.length > 0) return business.images[0];
    return 'https://placehold.co/800x400?text=No+Image';
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isBusinessLoading || !business ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl font-bold">{business.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{getCategoryName(business.categoryId)}</Badge>
                    {business.rating && (
                      <div className="flex items-center text-yellow-500">
                        {Array.from({ length: Math.round(business.rating) }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="ml-1 text-sm text-slate-600">{business.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {business.priceLevel && (
                      <div className="text-slate-600">
                        {getPriceLevelSymbol(business.priceLevel)}
                      </div>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                  {business.website && (
                    <Button size="sm" asChild>
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="mb-4 overflow-hidden rounded-lg">
              <img 
                src={getBusinessImage(business)} 
                alt={business.name} 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">About</h3>
                    <p className="text-slate-600 mb-4">{business.description}</p>
                    
                    {business.amenities && business.amenities.length > 0 && (
                      <>
                        <h3 className="text-lg font-medium mb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {business.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="md:col-span-1">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Business Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {business.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1 text-slate-500" />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <a 
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              {new URL(business.website).hostname}
                            </a>
                          </div>
                        )}
                        {/* Price level shown as $ symbols */}
                        {business.priceLevel && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-500" />
                            <span>{getPriceLevelSymbol(business.priceLevel)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {business.latitude && business.longitude && (
                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          View on Map
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="related" className="mt-4">
                <h3 className="text-lg font-medium mb-2">Similar {getCategoryName(business.categoryId)} Options</h3>
                {relatedBusinesses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    {relatedBusinesses.map(related => (
                      <div key={related.id} className="scale-90 origin-top-left"> 
                        <DestinationCard 
                          business={related}
                          onClick={() => {
                            // Close current modal and open new one with this business
                            onClose();
                            setTimeout(() => {
                              // Open new modal after a short delay
                              window.dispatchEvent(new CustomEvent('openBusinessDetails', { 
                                detail: { businessId: related.id } 
                              }));
                            }, 100);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No similar businesses found.</p>
                )}
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-4">
                <h3 className="text-lg font-medium mb-2">Recommended for You</h3>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map(recommendation => (
                      <div key={recommendation.id} className="scale-90 origin-top-left">
                        <DestinationCard 
                          business={recommendation}
                          onClick={() => {
                            // Close current modal and open new one with this business
                            onClose();
                            setTimeout(() => {
                              // Open new modal after a short delay
                              window.dispatchEvent(new CustomEvent('openBusinessDetails', { 
                                detail: { businessId: recommendation.id } 
                              }));
                            }, 100);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No recommendations available.</p>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="default" size="sm" className="gap-2" asChild>
                <a href={`/itinerary/add/${business.id}`}>
                  Add to Itinerary
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}