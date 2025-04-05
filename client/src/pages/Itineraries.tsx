import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Itinerary } from '@shared/schema';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, MapPin, Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }).refine((endDate, data) => {
    return new Date(endDate) >= new Date((data as any).startDate);
  }, {
    message: "End date must be after start date",
  }),
  isPublic: z.boolean().default(false),
  coverImage: z.string().optional(),
});

// Temporary userId until authentication is implemented
const TEMP_USER_ID = 1;

export default function Itineraries() {
  const { toast } = useToast();
  const [newItineraryOpen, setNewItineraryOpen] = useState(false);
  
  // Query itineraries
  const { data: itineraries, isLoading, error } = useQuery<Itinerary[]>({
    queryKey: ['/api/itineraries/user', TEMP_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/itineraries/user/${TEMP_USER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch itineraries');
      }
      return response.json();
    }
  });
  
  // Create new itinerary mutation
  const createItineraryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: TEMP_USER_ID,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create itinerary');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/user', TEMP_USER_ID] });
      toast({
        title: "Itinerary created",
        description: "Your new itinerary has been created successfully.",
      });
      setNewItineraryOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async (itineraryId: number) => {
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete itinerary');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/user', TEMP_USER_ID] });
      toast({
        title: "Itinerary deleted",
        description: "The itinerary has been deleted successfully.",
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
  
  // New itinerary form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isPublic: false,
      coverImage: '',
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    createItineraryMutation.mutate(values);
  }
  
  function handleDeleteItinerary(id: number) {
    if (confirm("Are you sure you want to delete this itinerary? This action cannot be undone.")) {
      deleteItineraryMutation.mutate(id);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Itineraries</h1>
        <Dialog open={newItineraryOpen} onOpenChange={setNewItineraryOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Itinerary</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Itinerary</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new travel itinerary.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter itinerary title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a description to your itinerary" 
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
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Public Itinerary</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this itinerary viewable by others with the share link
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewItineraryOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createItineraryMutation.isPending}>
                    {createItineraryMutation.isPending ? "Creating..." : "Create Itinerary"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="text-center p-8 text-red-500">
          <p>Error loading itineraries. Please try again later.</p>
        </div>
      )}

      {itineraries && itineraries.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-muted/20 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No itineraries yet</h3>
          <p className="text-muted-foreground mb-4">Create your first itinerary to start planning your trip.</p>
          <Button
            onClick={() => setNewItineraryOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Itinerary</span>
          </Button>
        </div>
      )}

      {itineraries && itineraries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="overflow-hidden flex flex-col">
              {itinerary.coverImage ? (
                <div className="h-40 overflow-hidden">
                  <img
                    src={itinerary.coverImage}
                    alt={itinerary.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-primary/50" />
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{itinerary.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {itinerary.description || "No description provided"}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button variant="default" asChild>
                  <Link to={`/itinerary/${itinerary.id}`}>View Details</Link>
                </Button>
                <div className="flex gap-2">
                  {itinerary.isPublic && (
                    <Button variant="ghost" size="icon" title="Share Itinerary">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Delete Itinerary"
                    onClick={() => handleDeleteItinerary(itinerary.id)}
                    disabled={deleteItineraryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}