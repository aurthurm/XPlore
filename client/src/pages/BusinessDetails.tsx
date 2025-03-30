import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Business, Category } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BusinessDetails = () => {
  const [, params] = useRoute<{ id: string }>("/business/:id");
  const { toast } = useToast();
  const businessId = params?.id ? parseInt(params.id) : undefined;

  // Fetch business details
  const { data: business, isLoading: isLoadingBusiness, error } = useQuery<Business>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: !!businessId,
  });

  // Fetch categories to display category name
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load business details. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId || !categories) return 'Unknown';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
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

  if (isLoadingBusiness) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-80 bg-slate-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
              <div>
                <div className="h-40 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!business) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
          <p className="mb-6">The business you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-primary-600 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/?categoryId=${business.categoryId}`} className="text-primary-600 hover:underline">
              {getCategoryName(business.categoryId)}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">{business.name}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-primary-600 mr-2"></i>
              <span>{business.address}, {business.city}, Zimbabwe</span>
            </div>
            {business.rating && (
              <div className="flex items-center">
                <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded">
                  <span className="font-semibold mr-1">{business.rating.toFixed(1)}</span>
                  <i className="fas fa-star text-xs"></i>
                </div>
              </div>
            )}
            <div>
              <span className="tag bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">
                {getPriceLevel(business.priceLevel)}
              </span>
            </div>
            {business.claimed && (
              <div className="flex items-center text-primary-600">
                <i className="fas fa-check-circle mr-1"></i>
                <span className="text-sm">Claimed</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2">
            {/* Image gallery */}
            <div className="mb-8">
              <div className="rounded-lg overflow-hidden h-80 bg-slate-200">
                {business.images && business.images.length > 0 ? (
                  <img 
                    src={business.images[0]} 
                    alt={business.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <i className="fas fa-image text-5xl"></i>
                  </div>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About {business.name}</h2>
                    <p className="text-slate-600">
                      {business.description || "No description available."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                      {business.amenities?.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <i className="fas fa-check text-primary-600 mr-2 text-sm"></i>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.tags?.map((tag, index) => (
                        <span key={index} className="tag bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="text-center py-8">
                  <div className="text-4xl text-slate-300 mb-4">
                    <i className="fas fa-comments"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
                  <p className="text-slate-500 mb-6">Be the first to review this business!</p>
                  <Button>Write a Review</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="photos">
                {business.images && business.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {business.images.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden h-40">
                        <img 
                          src={image} 
                          alt={`${business.name} - Image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl text-slate-300 mb-4">
                      <i className="fas fa-camera"></i>
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Photos Available</h3>
                    <p className="text-slate-500">This business doesn't have any photos yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact & Location</h3>
                
                {/* Mini Map */}
                <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                  <MapView 
                    businesses={[business]} 
                    selectedBusinessId={business.id}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <i className="fas fa-map-marker-alt text-primary-600 mt-1 mr-3"></i>
                    <div>
                      <p>{business.address}</p>
                      <p>{business.city}, Zimbabwe</p>
                    </div>
                  </div>
                  
                  {business.phone && (
                    <div className="flex items-center">
                      <i className="fas fa-phone-alt text-primary-600 mr-3"></i>
                      <p>{business.phone}</p>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center">
                      <i className="fas fa-globe text-primary-600 mr-3"></i>
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button className="w-full">
                    <i className="fas fa-directions mr-2"></i>
                    Get Directions
                  </Button>
                  
                  {!business.claimed && (
                    <Link href={`/claim/${business.id}`}>
                      <Button variant="outline" className="w-full">
                        <i className="fas fa-user-tie mr-2"></i>
                        Claim This Business
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default BusinessDetails;
