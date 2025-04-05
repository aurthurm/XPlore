import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Itinerary, ItineraryDay, ItineraryItem, TransportBooking } from '@shared/schema';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  PlusCircle,
  ChevronLeft,
  Edit,
  Trash2,
  Car,
  Hotel,
  Utensils,
  Mountain,
  Ticket,
  Map
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Form schemas
const dayFormSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  notes: z.string().optional(),
});

const itemFormSchema = z.object({
  type: z.enum(['activity', 'accommodation', 'transportation', 'custom']),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  startTime: z.string().optional()
    .transform(val => val === '' ? null : val),
  endTime: z.string().optional()
    .transform(val => val === '' ? null : val),
  location: z.string().optional(),
  cost: z.string().optional().transform(val => val ? Number(val) : undefined),
  businessId: z.string().optional().transform(val => val ? Number(val) : undefined),
  reservationConfirmation: z.string().optional(),
});

const transportFormSchema = z.object({
  serviceType: z.enum(['driver', 'taxi', 'shuttle', 'car_rental', 'public_transport']),
  providerName: z.string().optional(),
  providerContact: z.string().optional(),
  bookingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  pickupTime: z.string().min(1, { message: "Pickup time is required" }),
  pickupLocation: z.string().min(1, { message: "Pickup location is required" }),
  dropoffLocation: z.string().min(1, { message: "Dropoff location is required" }),
  numberOfPassengers: z.string().transform(val => Number(val)).default("1"),
  specialRequests: z.string().optional(),
  cost: z.string().optional().transform(val => val ? Number(val) : undefined),
});

// Helper function to get icon by activity type
const getItemIcon = (type: string) => {
  switch (type) {
    case 'accommodation':
      return <Hotel className="h-4 w-4" />;
    case 'transportation':
      return <Car className="h-4 w-4" />;
    case 'activity':
      return <Mountain className="h-4 w-4" />;
    case 'custom':
    default:
      return <Ticket className="h-4 w-4" />;
  }
};

// Temporary userId until authentication is implemented
const TEMP_USER_ID = 1;

export default function ItineraryDetails() {
  const { id } = useParams<{ id: string }>();
  const itineraryId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [newDayOpen, setNewDayOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newTransportOpen, setNewTransportOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('days');
  
  // Fetch itinerary details
  const { data: itinerary, isLoading: itineraryLoading, error: itineraryError } = useQuery<Itinerary>({
    queryKey: ['/api/itineraries', itineraryId],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/${itineraryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch itinerary details');
      }
      return response.json();
    }
  });
  
  // Fetch itinerary days
  const { data: days, isLoading: daysLoading, error: daysError } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itineraries', itineraryId, 'days'],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/${itineraryId}/days`);
      if (!response.ok) {
        throw new Error('Failed to fetch itinerary days');
      }
      return response.json();
    },
    enabled: !!itineraryId
  });
  
  // Fetch transport bookings
  const { data: transportBookings, isLoading: transportLoading, error: transportError } = useQuery<TransportBooking[]>({
    queryKey: ['/api/itineraries', itineraryId, 'transport-bookings'],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/${itineraryId}/transport-bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch transport bookings');
      }
      return response.json();
    },
    enabled: !!itineraryId
  });
  
  // Create new day mutation
  const createDayMutation = useMutation({
    mutationFn: async (data: z.infer<typeof dayFormSchema>) => {
      // Calculate day number based on start date
      const dayNumber = Math.floor(
        (new Date(data.date).getTime() - new Date(itinerary!.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      
      const response = await fetch(`/api/itineraries/${itineraryId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dayNumber
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create day');
      }
      
      return response.json();
    },
    onSuccess: (newDay) => {
      // Initialize empty items array for the new day
      setDayItems(prev => ({
        ...prev,
        [newDay.id]: []
      }));
      
      // Refetch itinerary days
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries', itineraryId, 'days'] });
      toast({
        title: "Day added",
        description: "The day has been added to your itinerary.",
      });
      setNewDayOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add day",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete day mutation
  const deleteDayMutation = useMutation({
    mutationFn: async (dayId: number) => {
      const response = await fetch(`/api/itinerary-days/${dayId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete day');
      }
      
      return response.json();
    },
    onSuccess: (_, deletedDayId) => {
      // Remove day items from state
      setDayItems(prev => {
        const newState = { ...prev };
        delete newState[deletedDayId];
        return newState;
      });
      
      // Refetch itinerary days
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries', itineraryId, 'days'] });
      toast({
        title: "Day deleted",
        description: "The day has been removed from your itinerary.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete day",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create new item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof itemFormSchema>) => {
      if (!selectedDayId) throw new Error("No day selected");
      
      const response = await fetch(`/api/itinerary-days/${selectedDayId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
      }
      
      return response.json();
    },
    onSuccess: (newItem) => {
      if (selectedDayId) {
        // Update local state
        setDayItems(prev => {
          const dayItems = prev[selectedDayId] || [];
          return {
            ...prev,
            [selectedDayId]: [...dayItems, newItem]
          };
        });
        
        // Also invalidate the query to refresh data
        queryClient.invalidateQueries({ 
          queryKey: ['/api/itinerary-days', 'all-items'] 
        });
      }
      toast({
        title: "Item added",
        description: "The item has been added to your itinerary day.",
      });
      setNewItemOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch(`/api/itinerary-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      
      return response.json();
    },
    onSuccess: (_, deletedItemId) => {
      // Find which day this item belonged to and update local state
      for (const [dayId, items] of Object.entries(dayItems)) {
        const dayIdNum = parseInt(dayId);
        const itemIndex = items.findIndex(item => item.id === deletedItemId);
        
        if (itemIndex !== -1) {
          // Update the local state
          setDayItems(prev => {
            const updatedItems = [...prev[dayIdNum]];
            updatedItems.splice(itemIndex, 1);
            return {
              ...prev,
              [dayIdNum]: updatedItems
            };
          });
          break;
        }
      }
      
      // Also invalidate the query to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/itinerary-days', 'all-items'] 
      });
      
      toast({
        title: "Item deleted",
        description: "The item has been removed from your itinerary.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create transport booking mutation
  const createTransportMutation = useMutation({
    mutationFn: async (data: z.infer<typeof transportFormSchema>) => {
      const response = await fetch(`/api/transport-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: TEMP_USER_ID,
          itineraryId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transport booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries', itineraryId, 'transport-bookings'] });
      toast({
        title: "Transport booking added",
        description: "The transport booking has been added to your itinerary.",
      });
      setNewTransportOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add transport booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete transport booking mutation
  const deleteTransportMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/transport-bookings/${bookingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transport booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries', itineraryId, 'transport-bookings'] });
      toast({
        title: "Transport booking deleted",
        description: "The transport booking has been removed from your itinerary.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete transport booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Day form
  const dayForm = useForm<z.infer<typeof dayFormSchema>>({
    resolver: zodResolver(dayFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });
  
  // Item form
  const itemForm = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      type: 'activity',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      cost: '',
      businessId: undefined,
      reservationConfirmation: '',
    },
  });
  
  // Transport form
  const transportForm = useForm<z.infer<typeof transportFormSchema>>({
    resolver: zodResolver(transportFormSchema),
    defaultValues: {
      serviceType: 'driver',
      providerName: '',
      providerContact: '',
      bookingDate: new Date().toISOString().split('T')[0],
      pickupTime: '10:00',
      pickupLocation: '',
      dropoffLocation: '',
      numberOfPassengers: '1',
      specialRequests: '',
      cost: '',
    },
  });
  
  // Submit handlers
  function onDaySubmit(values: z.infer<typeof dayFormSchema>) {
    createDayMutation.mutate(values);
  }
  
  function onItemSubmit(values: z.infer<typeof itemFormSchema>) {
    createItemMutation.mutate(values);
  }
  
  function onTransportSubmit(values: z.infer<typeof transportFormSchema>) {
    createTransportMutation.mutate(values);
  }
  
  // Open item dialog and set selected day
  function handleAddItem(dayId: number) {
    setSelectedDayId(dayId);
    setNewItemOpen(true);
  }
  
  // Handle day deletion
  function handleDeleteDay(dayId: number) {
    if (confirm("Are you sure you want to delete this day and all its activities? This action cannot be undone.")) {
      deleteDayMutation.mutate(dayId);
    }
  }
  
  // Handle item deletion
  function handleDeleteItem(itemId: number) {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteItemMutation.mutate(itemId);
    }
  }
  
  // Handle transport booking deletion
  function handleDeleteTransport(bookingId: number) {
    if (confirm("Are you sure you want to delete this transport booking? This action cannot be undone.")) {
      deleteTransportMutation.mutate(bookingId);
    }
  }
  
  // Get days sorted by day number
  const sortedDays = days ? [...days].sort((a, b) => a.dayNumber - b.dayNumber) : [];
  
  // Create a state to store items for each day
  const [dayItems, setDayItems] = useState<Record<number, ItineraryItem[]>>({});
  
  // Use a single query with enabled based on days being loaded
  const { isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/itinerary-days', 'all-items', sortedDays.map(d => d.id).join(',')],
    queryFn: async () => {
      // Create a map to store items by day ID
      const itemsByDay: Record<number, ItineraryItem[]> = {};
      
      // Fetch items for each day in parallel
      await Promise.all(sortedDays.map(async (day) => {
        try {
          const response = await fetch(`/api/itinerary-days/${day.id}/items`);
          if (!response.ok) {
            throw new Error(`Failed to fetch items for day ${day.dayNumber}`);
          }
          const items = await response.json();
          itemsByDay[day.id] = items;
        } catch (error) {
          console.error(`Error fetching items for day ${day.id}:`, error);
          itemsByDay[day.id] = [];
        }
      }));
      
      // Update state with all fetched items
      setDayItems(itemsByDay);
      return itemsByDay;
    },
    enabled: sortedDays.length > 0,
  });

  // Loading state
  if (itineraryLoading || daysLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (itineraryError || daysError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 text-red-500">
          <p>Error loading itinerary details. Please try again later.</p>
          <Button onClick={() => navigate('/itineraries')} className="mt-4">
            Back to Itineraries
          </Button>
        </div>
      </div>
    );
  }
  
  if (!itinerary) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8">
          <p>Itinerary not found.</p>
          <Button onClick={() => navigate('/itineraries')} className="mt-4">
            Back to Itineraries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/itineraries')}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Itineraries
      </Button>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {itinerary.coverImage && (
          <div className="md:w-1/3 h-48 md:h-auto overflow-hidden rounded-lg">
            <img
              src={itinerary.coverImage}
              alt={itinerary.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className={`${itinerary.coverImage ? 'md:w-2/3' : 'w-full'}`}>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{itinerary.title}</h1>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </div>
          
          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
            </span>
            <Badge variant="outline" className="ml-2">{itinerary.isPublic ? 'Public' : 'Private'}</Badge>
          </div>
          
          <p className="mt-4">
            {itinerary.description || "No description provided"}
          </p>
          
          <div className="mt-4 flex gap-2">
            <Button asChild>
              <Link to={`/itinerary/${itinerary.id}/map`}>
                <Map className="mr-2 h-4 w-4" /> View on Map
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="days" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="days">Itinerary Days</TabsTrigger>
          <TabsTrigger value="transport">Transportation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="days" className="space-y-6">
          {/* Add Day Button */}
          <div className="flex justify-end">
            <Dialog open={newDayOpen} onOpenChange={setNewDayOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Day
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Day</DialogTitle>
                  <DialogDescription>
                    Add a day to your itinerary to plan activities, accommodations, and more.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...dayForm}>
                  <form onSubmit={dayForm.handleSubmit(onDaySubmit)} className="space-y-4">
                    <FormField
                      control={dayForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dayForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any notes for this day" 
                              className="resize-none" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewDayOpen(false)} type="button">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createDayMutation.isPending}>
                        {createDayMutation.isPending ? "Adding..." : "Add Day"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* No days message */}
          {sortedDays.length === 0 && (
            <div className="text-center py-16 bg-muted/20 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No days added yet</h3>
              <p className="text-muted-foreground mb-4">Add days to your itinerary to start planning your activities.</p>
              <Button onClick={() => setNewDayOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Day
              </Button>
            </div>
          )}
          
          {/* Days list */}
          {sortedDays.length > 0 && (
            <div className="space-y-8">
              {sortedDays.map((day, index) => {
                const dayDate = new Date(day.date);
                const items = dayItems[day.id] || [];
                
                // Sort items by start time
                const sortedItems = [...items].sort((a, b) => {
                  if (!a.startTime) return 1;
                  if (!b.startTime) return -1;
                  return a.startTime > b.startTime ? 1 : -1;
                });
                
                return (
                  <Card key={day.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Day {day.dayNumber}: {format(dayDate, 'EEE, MMM d, yyyy')}
                          </CardTitle>
                          {day.notes && (
                            <CardDescription className="mt-1">{day.notes}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleAddItem(day.id)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteDay(day.id)}
                            disabled={deleteDayMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      {itemsLoading ? (
                        <div className="py-4 flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : sortedItems.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No activities planned for this day</p>
                          <Button variant="link" onClick={() => handleAddItem(day.id)}>
                            Add an activity
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sortedItems.map(item => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                              <div className="w-10 pt-1">
                                <div className="bg-primary/10 text-primary rounded-full p-2 w-9 h-9 flex items-center justify-center">
                                  {getItemIcon(item.type)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">{item.title}</h4>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={deleteItemMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                  {(item.startTime || item.endTime) && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {item.startTime && item.startTime.substring(0, 5)}
                                        {item.startTime && item.endTime && " - "}
                                        {item.endTime && item.endTime.substring(0, 5)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {item.location && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{item.location}</span>
                                    </div>
                                  )}
                                  
                                  {item.cost !== null && item.cost !== undefined && (
                                    <div className="text-sm text-muted-foreground ml-auto">
                                      <Badge variant="outline">
                                        ${item.cost}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Add Item Dialog */}
          <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add an activity, accommodation, or other item to your itinerary day.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...itemForm}>
                <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
                  <FormField
                    control={itemForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="activity">Activity</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={itemForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={itemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add description" 
                            className="resize-none" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={itemForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time (optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={itemForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={itemForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={itemForm.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewItemOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createItemMutation.isPending}>
                      {createItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="transport" className="space-y-6">
          {/* Add Transport Button */}
          <div className="flex justify-end">
            <Dialog open={newTransportOpen} onOpenChange={setNewTransportOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Transport
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Transportation</DialogTitle>
                  <DialogDescription>
                    Add transportation details for your trip.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...transportForm}>
                  <form onSubmit={transportForm.handleSubmit(onTransportSubmit)} className="space-y-4">
                    <FormField
                      control={transportForm.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="driver">Private Driver</SelectItem>
                              <SelectItem value="taxi">Taxi</SelectItem>
                              <SelectItem value="shuttle">Shuttle</SelectItem>
                              <SelectItem value="car_rental">Car Rental</SelectItem>
                              <SelectItem value="public_transport">Public Transport</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transportForm.control}
                        name="providerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Name (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter provider name" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transportForm.control}
                        name="providerContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Contact (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact information" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transportForm.control}
                        name="bookingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transportForm.control}
                        name="pickupTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={transportForm.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pickup location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={transportForm.control}
                      name="dropoffLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropoff Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter dropoff location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transportForm.control}
                        name="numberOfPassengers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Passengers</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transportForm.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                                value={field.value || ''} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={transportForm.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements" 
                              className="resize-none" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewTransportOpen(false)} type="button">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTransportMutation.isPending}>
                        {createTransportMutation.isPending ? "Adding..." : "Add Transport"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Transport Bookings List */}
          {transportLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transportError ? (
            <div className="py-8 text-center text-red-500">
              Error loading transport bookings
            </div>
          ) : (!transportBookings || transportBookings.length === 0) ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No transportation bookings</h3>
              <p className="text-muted-foreground mb-4">Add transportation bookings to manage your travel logistics.</p>
              <Button onClick={() => setNewTransportOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transport
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {transportBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-full p-2 w-8 h-8 flex items-center justify-center">
                          <Car className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                          {booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1).replace('_', ' ')}
                          {booking.providerName && ` - ${booking.providerName}`}
                        </CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTransport(booking.id)}
                        disabled={deleteTransportMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(booking.bookingDate), 'EEE, MMM d, yyyy')}</span>
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />
                      <span>{booking.pickupTime.substring(0, 5)}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Pickup</h4>
                        <p className="text-sm text-muted-foreground">{booking.pickupLocation}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Dropoff</h4>
                        <p className="text-sm text-muted-foreground">{booking.dropoffLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                      <div>
                        <span className="text-xs font-medium">Passengers</span>
                        <p className="text-sm">{booking.numberOfPassengers}</p>
                      </div>
                      
                      {booking.providerContact && (
                        <div>
                          <span className="text-xs font-medium">Contact</span>
                          <p className="text-sm">{booking.providerContact}</p>
                        </div>
                      )}
                      
                      {booking.cost !== null && booking.cost !== undefined && (
                        <div className="ml-auto">
                          <Badge variant="outline" className="text-sm">
                            ${booking.cost}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {booking.specialRequests && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs font-medium">Special Requests</span>
                        <p className="text-sm mt-1">{booking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}