import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Itinerary, ItineraryDay, ItineraryItem, Business } from '@shared/schema';
import { Plus, Calendar, ListChecks, Trash2, Edit, X, ChevronRight, Map, Heart, HeartOff } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';

type ItineraryDrawerProps = {
  children?: React.ReactNode;
};

export default function ItineraryDrawer({ children }: ItineraryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("itineraries");
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [activeItineraryId, setActiveItineraryId] = useState<number | null>(null);

  // Form states
  const [newItineraryTitle, setNewItineraryTitle] = useState('');
  const [newItineraryDescription, setNewItineraryDescription] = useState('');
  const [newItineraryStartDate, setNewItineraryStartDate] = useState<Date | undefined>(undefined);
  const [newItineraryEndDate, setNewItineraryEndDate] = useState<Date | undefined>(undefined);

  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  // Fetch itineraries
  const { data: itineraries = [], isLoading: isLoadingItineraries } = useQuery<Itinerary[]>({
    queryKey: ['/api/itineraries/user', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/itineraries/user/${user?.id}`);
      return await res.json();
    }
  });

  // Fetch wishlist (in a real app, this would be a different API endpoint)
  // For now, let's just simulate some wishlist items
  const { data: wishlistItems = [], isLoading: isLoadingWishlist } = useQuery<Business[]>({
    queryKey: ['/api/wishlist', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // In a real implementation, we would fetch actual wishlist items
      // For now, let's return some businesses as placeholders
      const res = await apiRequest('GET', '/api/businesses');
      const businesses = await res.json();
      return businesses.slice(0, 3); // Just take the first 3 as "wishlist items"
    }
  });

  // Create itinerary mutation
  const createItineraryMutation = useMutation({
    mutationFn: async (newItinerary: {
      title: string;
      description: string;
      startDate?: string;
      endDate?: string;
      userId: number;
    }) => {
      const res = await apiRequest('POST', '/api/itineraries', newItinerary);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/user', user?.id] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Itinerary created",
        description: "Your new itinerary has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update itinerary mutation
  const updateItineraryMutation = useMutation({
    mutationFn: async ({
      id,
      itinerary
    }: {
      id: number;
      itinerary: Partial<Itinerary>;
    }) => {
      const res = await apiRequest('PATCH', `/api/itineraries/${id}`, itinerary);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/user', user?.id] });
      setIsEditModalOpen(false);
      toast({
        title: "Itinerary updated",
        description: "Your itinerary has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/itineraries/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/user', user?.id] });
      if (activeItineraryId === id) {
        setActiveItineraryId(null);
      }
      toast({
        title: "Itinerary deleted",
        description: "Your itinerary has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add to wishlist mutation (simulated)
  const toggleWishlistMutation = useMutation({
    mutationFn: async (businessId: number) => {
      // In a real implementation, we would call an API endpoint
      // For now, let's just simulate the action
      await new Promise(resolve => setTimeout(resolve, 300));
      return businessId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist', user?.id] });
      toast({
        title: "Wishlist updated",
        description: "Your wishlist has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update wishlist",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reset form
  const resetForm = () => {
    setNewItineraryTitle('');
    setNewItineraryDescription('');
    setNewItineraryStartDate(undefined);
    setNewItineraryEndDate(undefined);
  };

  // Handle create itinerary
  const handleCreateItinerary = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an itinerary.",
        variant: "destructive",
      });
      return;
    }

    if (!newItineraryTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your itinerary.",
        variant: "destructive",
      });
      return;
    }

    createItineraryMutation.mutate({
      title: newItineraryTitle,
      description: newItineraryDescription,
      startDate: newItineraryStartDate ? newItineraryStartDate.toISOString() : undefined,
      endDate: newItineraryEndDate ? newItineraryEndDate.toISOString() : undefined,
      userId: user.id,
    });
  };

  // Handle edit itinerary
  const handleEditItinerary = (itinerary: Itinerary) => {
    setCurrentItinerary(itinerary);
    setNewItineraryTitle(itinerary.title);
    setNewItineraryDescription(itinerary.description || '');
    setNewItineraryStartDate(itinerary.startDate ? new Date(itinerary.startDate) : undefined);
    setNewItineraryEndDate(itinerary.endDate ? new Date(itinerary.endDate) : undefined);
    setIsEditModalOpen(true);
  };

  // Handle update itinerary
  const handleUpdateItinerary = () => {
    if (!currentItinerary) return;

    if (!newItineraryTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your itinerary.",
        variant: "destructive",
      });
      return;
    }

    updateItineraryMutation.mutate({
      id: currentItinerary.id,
      itinerary: {
        title: newItineraryTitle,
        description: newItineraryDescription,
        startDate: newItineraryStartDate ? newItineraryStartDate.toISOString() : undefined,
        endDate: newItineraryEndDate ? newItineraryEndDate.toISOString() : undefined,
      }
    });
  };

  // Handle delete itinerary
  const handleDeleteItinerary = (id: number) => {
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      deleteItineraryMutation.mutate(id);
    }
  };

  // Open specific itinerary details in a new page
  const openItineraryDetails = (id: number) => {
    setLocation(`/itinerary/${id}`);
    setIsOpen(false);
  };

  // Toggle between active and wishlist
  const handleToggleWishlist = (businessId: number) => {
    toggleWishlistMutation.mutate(businessId);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isCreateModalOpen) {
      resetForm();
    }
  }, [isCreateModalOpen]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {children || (
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Itineraries
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Your Travel Plans</SheetTitle>
            <SheetDescription>
              Manage your itineraries and trip wishlist
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <Tabs defaultValue="itineraries" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="itineraries">My Itineraries</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              </TabsList>

              <TabsContent value="itineraries" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Your Itineraries</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!user}
                  >
                    <Plus className="w-4 h-4 mr-2" /> New
                  </Button>
                </div>

                {isLoadingItineraries ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : itineraries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>You haven't created any itineraries yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsCreateModalOpen(true)}
                      disabled={!user}
                    >
                      Create your first itinerary
                    </Button>
                  </div>
                ) : (
                  <Accordion
                    type="single"
                    collapsible
                    value={activeItineraryId ? String(activeItineraryId) : undefined}
                    onValueChange={(value) => setActiveItineraryId(value ? Number(value) : null)}
                  >
                    {itineraries.map((itinerary) => (
                      <AccordionItem key={itinerary.id} value={String(itinerary.id)}>
                        <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{itinerary.title}</span>
                            {itinerary.startDate && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(itinerary.startDate), 'MMM d, yyyy')}
                                {itinerary.endDate && ` - ${format(new Date(itinerary.endDate), 'MMM d, yyyy')}`}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2">
                          {itinerary.description && (
                            <p className="text-sm text-muted-foreground mb-3">{itinerary.description}</p>
                          )}
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="justify-start"
                              onClick={() => openItineraryDetails(itinerary.id)}
                            >
                              <ListChecks className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="justify-start"
                              onClick={() => handleEditItinerary(itinerary)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Itinerary
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteItinerary(itinerary.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="wishlist" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Your Wishlist</h3>
                </div>

                {isLoadingWishlist ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Your wishlist is empty.</p>
                    <p className="text-sm">Save places you'd like to visit here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishlistItems.map((business) => (
                      <Card key={business.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="h-24 w-24 flex-shrink-0">
                            <img 
                              src={business.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} 
                              alt={business.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-between flex-grow p-3">
                            <div>
                              <h4 className="font-medium text-sm">{business.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{business.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleToggleWishlist(business.id)}>
                                <HeartOff className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8" asChild>
                                <a href={`/business/${business.id}`}>
                                  Details
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create Itinerary Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Itinerary</DialogTitle>
            <DialogDescription>
              Plan your perfect trip. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItineraryTitle}
                onChange={(e) => setNewItineraryTitle(e.target.value)}
                placeholder="e.g., Weekend in Victoria Falls"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newItineraryDescription}
                onChange={(e) => setNewItineraryDescription(e.target.value)}
                placeholder="Add some notes about your trip"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date (optional)</Label>
                <DatePicker
                  date={newItineraryStartDate}
                  setDate={setNewItineraryStartDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (optional)</Label>
                <DatePicker
                  date={newItineraryEndDate}
                  setDate={setNewItineraryEndDate}
                  placeholder="Select end date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItinerary} disabled={createItineraryMutation.isPending}>
              {createItineraryMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Itinerary"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Itinerary Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Itinerary</DialogTitle>
            <DialogDescription>
              Update your itinerary details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={newItineraryTitle}
                onChange={(e) => setNewItineraryTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={newItineraryDescription}
                onChange={(e) => setNewItineraryDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date (optional)</Label>
                <DatePicker
                  date={newItineraryStartDate}
                  setDate={setNewItineraryStartDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date (optional)</Label>
                <DatePicker
                  date={newItineraryEndDate}
                  setDate={setNewItineraryEndDate}
                  placeholder="Select end date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItinerary} disabled={updateItineraryMutation.isPending}>
              {updateItineraryMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Itinerary"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}