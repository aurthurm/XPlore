import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Itinerary, ItineraryDay, ItineraryItem, Business } from '@shared/schema';
import { 
  Plus, Calendar, ListChecks, Trash2, Edit, X, ChevronRight, Map, 
  Heart, HeartOff, Clock, MapPin, Car, Hotel, Utensils, Mountain, Ticket,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("itineraries");
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [activeItineraryId, setActiveItineraryId] = useState<number | null>(null);
  
  // State for itinerary details
  const [selectedItineraryId, setSelectedItineraryId] = useState<number | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [newDayOpen, setNewDayOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [dayItems, setDayItems] = useState<Record<number, ItineraryItem[]>>({});
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  
  // Item form state
  const [itemType, setItemType] = useState<string>('activity');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemStartTime, setItemStartTime] = useState<string>('');
  const [itemEndTime, setItemEndTime] = useState<string>('');
  const [itemLocation, setItemLocation] = useState<string>('');

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

  // Reset forms
  const resetForm = () => {
    setNewItineraryTitle('');
    setNewItineraryDescription('');
    setNewItineraryStartDate(undefined);
    setNewItineraryEndDate(undefined);
  };
  
  const resetItemForm = () => {
    setItemType('activity');
    setItemTitle('');
    setItemDescription('');
    setItemStartTime('');
    setItemEndTime('');
    setItemLocation('');
  };
  
  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      type: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      dayId: number;
    }) => {
      const res = await apiRequest('POST', `/api/itinerary-days/${data.dayId}/items`, data);
      return await res.json();
    },
    onSuccess: (newItem) => {
      // Add the new item to the dayItems state
      setDayItems(prev => ({
        ...prev,
        [newItem.dayId]: [...(prev[newItem.dayId] || []), newItem]
      }));
      
      setNewItemOpen(false);
      resetItemForm();
      toast({
        title: "Item added",
        description: "Your item has been added to the itinerary day.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  });

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

  // Open itinerary details in a modal
  const openItineraryDetails = (id: number) => {
    setSelectedItineraryId(id);
    setIsDetailsModalOpen(true);
  };
  
  // Fetch itinerary details
  const { data: selectedItinerary, isLoading: itineraryLoading } = useQuery<Itinerary>({
    queryKey: ['/api/itineraries', selectedItineraryId],
    enabled: !!selectedItineraryId && isDetailsModalOpen,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/itineraries/${selectedItineraryId}`);
      return await res.json();
    }
  });
  
  // Fetch itinerary days
  const { data: days = [], isLoading: daysLoading } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itineraries', selectedItineraryId, 'days'],
    enabled: !!selectedItineraryId && isDetailsModalOpen,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/itineraries/${selectedItineraryId}/days`);
      return await res.json();
    }
  });
  
  // Create new day mutation
  const createDayMutation = useMutation({
    mutationFn: async (data: { date: string, notes?: string }) => {
      if (!selectedItineraryId) throw new Error("No itinerary selected");

      // Calculate day number based on start date
      const dayNumber = selectedItinerary?.startDate 
        ? Math.floor(
            (new Date(data.date).getTime() - new Date(selectedItinerary.startDate).getTime()) 
            / (1000 * 60 * 60 * 24)
          ) + 1 
        : 1;
      
      const res = await apiRequest('POST', `/api/itineraries/${selectedItineraryId}/days`, {
        ...data,
        dayNumber
      });
      return await res.json();
    },
    onSuccess: (newDay) => {
      // Initialize empty items array for the new day
      setDayItems(prev => ({
        ...prev,
        [newDay.id]: []
      }));
      
      // Refetch itinerary days
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries', selectedItineraryId, 'days'] });
      setNewDayOpen(false);
      toast({
        title: "Day added",
        description: "The day has been added to your itinerary.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add day",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Fetch items for each day
  useEffect(() => {
    if (!days || days.length === 0 || !isDetailsModalOpen) return;
    
    const fetchItemsForDays = async () => {
      const newDayItems: Record<number, ItineraryItem[]> = {};
      
      try {
        for (const day of days) {
          const res = await apiRequest('GET', `/api/itinerary-days/${day.id}/items`);
          const items = await res.json();
          newDayItems[day.id] = items;
        }
        
        setDayItems(newDayItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast({
          title: "Error",
          description: "Failed to load itinerary items",
          variant: "destructive",
        });
      }
    };
    
    fetchItemsForDays();
  }, [days, isDetailsModalOpen, toast]);

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
  
  // Toggle day expansion
  const toggleDayExpansion = (dayId: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

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
      
      {/* Add Day Modal */}
      <Dialog open={newDayOpen} onOpenChange={setNewDayOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Day to Itinerary</DialogTitle>
            <DialogDescription>
              Add a new day to your itinerary.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                date={newItineraryStartDate}
                setDate={setNewItineraryStartDate}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={newItineraryDescription}
                onChange={(e) => setNewItineraryDescription(e.target.value)}
                placeholder="Add any notes for this day"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDayOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!newItineraryStartDate) {
                  toast({
                    title: "Date required",
                    description: "Please select a date for this day",
                    variant: "destructive"
                  });
                  return;
                }
                
                createDayMutation.mutate({
                  date: newItineraryStartDate.toISOString(),
                  notes: newItineraryDescription || undefined
                });
              }} 
              disabled={createDayMutation.isPending}
            >
              {createDayMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Day"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Item Modal */}
      <Dialog open={newItemOpen} onOpenChange={(open) => {
        if (!open) {
          resetItemForm();
        }
        setNewItemOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Activity to Day</DialogTitle>
            <DialogDescription>
              Add a new activity, accommodation or transportation to your itinerary day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-type">Activity Type</Label>
              <select
                id="item-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="activity">Activity</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                placeholder="Enter title"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description (optional)</Label>
              <Textarea
                id="item-description"
                placeholder="Add details about this activity"
                rows={2}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-start-time">Start Time (optional)</Label>
                <Input
                  id="item-start-time"
                  type="time"
                  value={itemStartTime}
                  onChange={(e) => setItemStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-end-time">End Time (optional)</Label>
                <Input
                  id="item-end-time"
                  type="time"
                  value={itemEndTime}
                  onChange={(e) => setItemEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-location">Location (optional)</Label>
              <Input
                id="item-location"
                placeholder="Enter location"
                value={itemLocation}
                onChange={(e) => setItemLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!selectedDayId) {
                  toast({
                    title: "Error",
                    description: "No day selected",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (!itemTitle.trim()) {
                  toast({
                    title: "Title required",
                    description: "Please provide a title for the item",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Send only the time part (HH:MM:SS), not the full ISO date string
                // This is what the PostgreSQL time field expects
                const formattedStartTime = itemStartTime ? 
                  itemStartTime + ":00" : 
                  undefined;
                
                const formattedEndTime = itemEndTime ? 
                  itemEndTime + ":00" : 
                  undefined;
                
                createItemMutation.mutate({
                  title: itemTitle,
                  description: itemDescription || undefined,
                  type: itemType,
                  startTime: formattedStartTime,
                  endTime: formattedEndTime,
                  location: itemLocation || undefined,
                  dayId: selectedDayId,
                });
              }}
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Itinerary Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {itineraryLoading || !selectedItinerary ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItinerary.title}</DialogTitle>
                <DialogDescription className="flex flex-col md:flex-row gap-2 md:gap-4">
                  {selectedItinerary.startDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {format(new Date(selectedItinerary.startDate), 'MMM d, yyyy')}
                        {selectedItinerary.endDate && ` - ${format(new Date(selectedItinerary.endDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                  )}
                  {selectedItinerary.description && (
                    <p className="text-muted-foreground">{selectedItinerary.description}</p>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Itinerary Days</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setNewDayOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Day
                  </Button>
                </div>
                
                {daysLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : days.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No days added to this itinerary yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setNewDayOpen(true)}
                    >
                      Add your first day
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {days
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => {
                        const dayItemsCount = (dayItems[day.id] || []).length;
                        const isExpanded = expandedDays[day.id] || false;
                        
                        return (
                          <Card key={day.id} className="overflow-hidden">
                            <CardHeader 
                              className="pb-2 cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleDayExpansion(day.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="flex-grow">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      Day {day.dayNumber}: {format(new Date(day.date), 'EEEE, MMMM d')}
                                      {dayItemsCount > 0 && (
                                        <Badge variant="outline" className="ml-2 bg-primary/10 hover:bg-primary/20 border-primary/10 text-primary">
                                          {dayItemsCount} {dayItemsCount === 1 ? 'item' : 'items'}
                                        </Badge>
                                      )}
                                    </CardTitle>
                                    {day.notes && (
                                      <CardDescription>{day.notes}</CardDescription>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedDayId(day.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this day? All items will be lost.')) {
                                        // Implement delete day functionality
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            
                            {isExpanded && (
                              <CardContent>
                                {dayItemsCount > 0 ? (
                                  <div className="space-y-3">
                                    {(dayItems[day.id] || [])
                                      .sort((a, b) => {
                                        // Sort by start time if available
                                        if (!a.startTime && !b.startTime) return 0;
                                        if (!a.startTime) return 1;
                                        if (!b.startTime) return -1;
                                        
                                        // Compare directly as strings since format is HH:MM:SS
                                        return a.startTime.localeCompare(b.startTime);
                                      })
                                      .map((item) => (
                                        <div key={item.id} className="p-3 border rounded-md bg-muted/30">
                                          <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-2">
                                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                {item.type === 'accommodation' && <Hotel className="h-4 w-4 text-primary" />}
                                                {item.type === 'transportation' && <Car className="h-4 w-4 text-primary" />}
                                                {item.type === 'activity' && <Mountain className="h-4 w-4 text-primary" />}
                                                {item.type === 'custom' && <Ticket className="h-4 w-4 text-primary" />}
                                              </div>
                                              <div>
                                                <h4 className="font-medium text-sm">{item.title}</h4>
                                                {item.description && (
                                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                                )}
                                                <div className="flex flex-wrap gap-x-3 mt-1">
                                                  {item.startTime && (
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                      <Clock className="h-3 w-3 mr-1" />
                                                      {/* Format time without having to parse to Date - just extract HH:MM from the time string */}
                                                      {item.startTime.substring(0, 5).split(':').map((n, i) => 
                                                        i === 0 ? String(parseInt(n) % 12 || 12) : n
                                                      ).join(':') + (parseInt(item.startTime.split(':')[0]) >= 12 ? ' PM' : ' AM')}
                                                      
                                                      {item.endTime && ` - ${
                                                        item.endTime.substring(0, 5).split(':').map((n, i) => 
                                                          i === 0 ? String(parseInt(n) % 12 || 12) : n
                                                        ).join(':') + (parseInt(item.endTime.split(':')[0]) >= 12 ? ' PM' : ' AM')
                                                      }`}
                                                    </div>
                                                  )}
                                                  {item.location && (
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                      <MapPin className="h-3 w-3 mr-1" />
                                                      {item.location}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex gap-1">
                                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 w-7 p-0 text-destructive"
                                                onClick={() => {
                                                  if (confirm('Are you sure you want to delete this item?')) {
                                                    // Implement delete item functionality
                                                  }
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-3 text-muted-foreground text-sm">
                                    <p>No activities planned for this day.</p>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="mt-1"
                                      onClick={() => {
                                        setSelectedDayId(day.id);
                                        setNewItemOpen(true);
                                      }}
                                    >
                                      Add an activity
                                    </Button>
                                  </div>
                                )}
                                <div className="mt-3 text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDayId(day.id);
                                      setNewItemOpen(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Item
                                  </Button>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}