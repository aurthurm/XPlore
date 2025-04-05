import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBusinessSchema, 
  insertClaimRequestSchema,
  insertItinerarySchema,
  insertItineraryDaySchema,
  insertItineraryItemSchema,
  insertItineraryCollaboratorSchema,
  insertTransportBookingSchema,
  searchFilterSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to handle validation errors
function handleValidationError(error: ZodError, res: Response) {
  const validationError = fromZodError(error);
  return res.status(400).json({ 
    message: "Validation error", 
    errors: validationError.details 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.route('/api');
  
  // Categories
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });
  
  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      
      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });
  
  // Businesses
  app.get('/api/businesses', async (req, res) => {
    try {
      const filters = req.query;
      
      // Parse and validate the filters
      let parsedFilters: any = {};
      
      if (filters.keyword) parsedFilters.keyword = filters.keyword as string;
      if (filters.categoryId) parsedFilters.categoryId = parseInt(filters.categoryId as string);
      if (filters.priceLevel) {
        if (Array.isArray(filters.priceLevel)) {
          parsedFilters.priceLevel = (filters.priceLevel as string[]).map(p => parseInt(p));
        } else {
          parsedFilters.priceLevel = [parseInt(filters.priceLevel as string)];
        }
      }
      if (filters.rating) parsedFilters.rating = parseFloat(filters.rating as string);
      if (filters.amenities) {
        if (Array.isArray(filters.amenities)) {
          parsedFilters.amenities = filters.amenities as string[];
        } else {
          parsedFilters.amenities = [filters.amenities as string];
        }
      }
      if (filters.accessibility) {
        if (Array.isArray(filters.accessibility)) {
          parsedFilters.accessibility = filters.accessibility as string[];
        } else {
          parsedFilters.accessibility = [filters.accessibility as string];
        }
      }
      if (filters.latitude && filters.longitude) {
        parsedFilters.nearMe = true;
        parsedFilters.latitude = parseFloat(filters.latitude as string);
        parsedFilters.longitude = parseFloat(filters.longitude as string);
        if (filters.radius) parsedFilters.radius = parseFloat(filters.radius as string);
      }
      
      try {
        const validatedFilters = searchFilterSchema.parse(parsedFilters);
        const businesses = await storage.getBusinesses(validatedFilters);
        res.json(businesses);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({ message: 'Failed to fetch businesses' });
    }
  });
  
  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid business ID' });
      }
      
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
      
      res.json(business);
    } catch (error) {
      console.error('Error fetching business:', error);
      res.status(500).json({ message: 'Failed to fetch business' });
    }
  });
  
  app.post('/api/businesses', async (req, res) => {
    try {
      try {
        const businessData = insertBusinessSchema.parse(req.body);
        const business = await storage.createBusiness(businessData);
        res.status(201).json(business);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating business:', error);
      res.status(500).json({ message: 'Failed to create business' });
    }
  });
  
  app.put('/api/businesses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid business ID' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const businessData = insertBusinessSchema.partial().parse(req.body);
        const business = await storage.updateBusiness(id, businessData);
        
        if (!business) {
          return res.status(404).json({ message: 'Business not found' });
        }
        
        res.json(business);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating business:', error);
      res.status(500).json({ message: 'Failed to update business' });
    }
  });
  
  app.get('/api/businesses/owner/:ownerId', async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ message: 'Invalid owner ID' });
      }
      
      const businesses = await storage.getBusinessesByOwnerId(ownerId);
      res.json(businesses);
    } catch (error) {
      console.error('Error fetching owner businesses:', error);
      res.status(500).json({ message: 'Failed to fetch owner businesses' });
    }
  });
  
  // Users
  app.post('/api/users', async (req, res) => {
    try {
      try {
        const userData = insertUserSchema.parse(req.body);
        
        // Check if user exists
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        
        const user = await storage.createUser(userData);
        
        // Don't return the password in response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  // Claim requests
  app.post('/api/claim-requests', async (req, res) => {
    try {
      try {
        const claimData = insertClaimRequestSchema.parse(req.body);
        
        // Validate business exists
        const business = await storage.getBusinessById(claimData.businessId);
        if (!business) {
          return res.status(404).json({ message: 'Business not found' });
        }
        
        // Validate user exists
        const user = await storage.getUser(claimData.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if business is already claimed
        if (business.claimed) {
          return res.status(400).json({ message: 'Business is already claimed' });
        }
        
        // Check if there's a pending request
        const existingRequests = await storage.getClaimRequestsByBusinessId(claimData.businessId);
        const pendingRequest = existingRequests.find(r => r.status === 'pending');
        if (pendingRequest) {
          return res.status(400).json({ message: 'There is already a pending claim request for this business' });
        }
        
        const claimRequest = await storage.createClaimRequest(claimData);
        res.status(201).json(claimRequest);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating claim request:', error);
      res.status(500).json({ message: 'Failed to create claim request' });
    }
  });
  
  app.get('/api/claim-requests/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const requests = await storage.getClaimRequestsByUserId(userId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching user claim requests:', error);
      res.status(500).json({ message: 'Failed to fetch user claim requests' });
    }
  });
  
  app.put('/api/claim-requests/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid claim request ID' });
      }
      
      const { status } = req.body;
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const claimRequest = await storage.getClaimRequestById(id);
      if (!claimRequest) {
        return res.status(404).json({ message: 'Claim request not found' });
      }
      
      if (claimRequest.status !== 'pending') {
        return res.status(400).json({ message: 'Claim request is not pending' });
      }
      
      const updatedRequest = await storage.updateClaimRequest(id, status);
      
      // If approved, update the business
      if (status === 'approved') {
        await storage.updateBusiness(claimRequest.businessId, { 
          claimed: true,
          ownerId: claimRequest.userId
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating claim request:', error);
      res.status(500).json({ message: 'Failed to update claim request' });
    }
  });

  // Itinerary Routes
  // Get user's itineraries
  app.get('/api/itineraries/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const itineraries = await storage.getItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      res.status(500).json({ message: 'Failed to fetch itineraries' });
    }
  });
  
  // Get specific itinerary
  app.get('/api/itineraries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      const itinerary = await storage.getItineraryById(id);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      res.json(itinerary);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      res.status(500).json({ message: 'Failed to fetch itinerary' });
    }
  });
  
  // Create new itinerary
  app.post('/api/itineraries', async (req, res) => {
    try {
      try {
        const itineraryData = insertItinerarySchema.parse(req.body);
        
        // Check if user exists
        const user = await storage.getUser(itineraryData.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const itinerary = await storage.createItinerary(itineraryData);
        res.status(201).json(itinerary);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
      res.status(500).json({ message: 'Failed to create itinerary' });
    }
  });
  
  // Update itinerary
  app.put('/api/itineraries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const itineraryData = insertItinerarySchema.partial().parse(req.body);
        const itinerary = await storage.updateItinerary(id, itineraryData);
        
        if (!itinerary) {
          return res.status(404).json({ message: 'Itinerary not found' });
        }
        
        res.json(itinerary);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating itinerary:', error);
      res.status(500).json({ message: 'Failed to update itinerary' });
    }
  });
  
  // Delete itinerary
  app.delete('/api/itineraries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      const itinerary = await storage.getItineraryById(id);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      await storage.deleteItinerary(id);
      res.json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      res.status(500).json({ message: 'Failed to delete itinerary' });
    }
  });
  
  // Itinerary Days Routes
  // Get days for an itinerary
  app.get('/api/itineraries/:itineraryId/days', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      // Check if itinerary exists
      const itinerary = await storage.getItineraryById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      const days = await storage.getItineraryDays(itineraryId);
      res.json(days);
    } catch (error) {
      console.error('Error fetching itinerary days:', error);
      res.status(500).json({ message: 'Failed to fetch itinerary days' });
    }
  });
  
  // Create a day for an itinerary
  app.post('/api/itineraries/:itineraryId/days', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      // Check if itinerary exists
      const itinerary = await storage.getItineraryById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      try {
        const dayData = { ...req.body, itineraryId };
        const validatedDay = insertItineraryDaySchema.parse(dayData);
        const day = await storage.createItineraryDay(validatedDay);
        res.status(201).json(day);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating itinerary day:', error);
      res.status(500).json({ message: 'Failed to create itinerary day' });
    }
  });
  
  // Update a day
  app.put('/api/itinerary-days/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid day ID' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const dayData = insertItineraryDaySchema.partial().parse(req.body);
        const day = await storage.updateItineraryDay(id, dayData);
        
        if (!day) {
          return res.status(404).json({ message: 'Day not found' });
        }
        
        res.json(day);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating itinerary day:', error);
      res.status(500).json({ message: 'Failed to update itinerary day' });
    }
  });
  
  // Delete a day
  app.delete('/api/itinerary-days/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid day ID' });
      }
      
      const day = await storage.getItineraryDayById(id);
      if (!day) {
        return res.status(404).json({ message: 'Day not found' });
      }
      
      await storage.deleteItineraryDay(id);
      res.json({ message: 'Day deleted successfully' });
    } catch (error) {
      console.error('Error deleting itinerary day:', error);
      res.status(500).json({ message: 'Failed to delete itinerary day' });
    }
  });
  
  // Itinerary Items Routes
  // Get items for a day
  app.get('/api/itinerary-days/:dayId/items', async (req, res) => {
    try {
      const dayId = parseInt(req.params.dayId);
      if (isNaN(dayId)) {
        return res.status(400).json({ message: 'Invalid day ID' });
      }
      
      // Check if day exists
      const day = await storage.getItineraryDayById(dayId);
      if (!day) {
        return res.status(404).json({ message: 'Day not found' });
      }
      
      const items = await storage.getItineraryItems(dayId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching itinerary items:', error);
      res.status(500).json({ message: 'Failed to fetch itinerary items' });
    }
  });
  
  // Create an item for a day
  app.post('/api/itinerary-days/:dayId/items', async (req, res) => {
    try {
      const dayId = parseInt(req.params.dayId);
      if (isNaN(dayId)) {
        return res.status(400).json({ message: 'Invalid day ID' });
      }
      
      // Check if day exists
      const day = await storage.getItineraryDayById(dayId);
      if (!day) {
        return res.status(404).json({ message: 'Day not found' });
      }
      
      try {
        const itemData = { ...req.body, dayId };
        
        // If businessId is provided, check if it exists
        if (itemData.businessId) {
          const business = await storage.getBusinessById(itemData.businessId);
          if (!business) {
            return res.status(404).json({ message: 'Business not found' });
          }
        }
        
        const validatedItem = insertItineraryItemSchema.parse(itemData);
        const item = await storage.createItineraryItem(validatedItem);
        res.status(201).json(item);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating itinerary item:', error);
      res.status(500).json({ message: 'Failed to create itinerary item' });
    }
  });
  
  // Update an item
  app.put('/api/itinerary-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const itemData = insertItineraryItemSchema.partial().parse(req.body);
        
        // If businessId is provided, check if it exists
        if (itemData.businessId) {
          const business = await storage.getBusinessById(itemData.businessId);
          if (!business) {
            return res.status(404).json({ message: 'Business not found' });
          }
        }
        
        const item = await storage.updateItineraryItem(id, itemData);
        
        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(item);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating itinerary item:', error);
      res.status(500).json({ message: 'Failed to update itinerary item' });
    }
  });
  
  // Delete an item
  app.delete('/api/itinerary-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      const item = await storage.getItineraryItemById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      await storage.deleteItineraryItem(id);
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting itinerary item:', error);
      res.status(500).json({ message: 'Failed to delete itinerary item' });
    }
  });
  
  // Collaborators Routes
  // Get collaborators for an itinerary
  app.get('/api/itineraries/:itineraryId/collaborators', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      // Check if itinerary exists
      const itinerary = await storage.getItineraryById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      const collaborators = await storage.getItineraryCollaborators(itineraryId);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ message: 'Failed to fetch collaborators' });
    }
  });
  
  // Add a collaborator
  app.post('/api/itineraries/:itineraryId/collaborators', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      // Check if itinerary exists
      const itinerary = await storage.getItineraryById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      try {
        const collaboratorData = { ...req.body, itineraryId };
        const validatedCollaborator = insertItineraryCollaboratorSchema.parse(collaboratorData);
        
        // Check if collaborator already exists
        const collaborators = await storage.getItineraryCollaborators(itineraryId);
        const existingCollaborator = collaborators.find(c => c.email === validatedCollaborator.email);
        if (existingCollaborator) {
          return res.status(400).json({ message: 'Collaborator already exists' });
        }
        
        const collaborator = await storage.addItineraryCollaborator(validatedCollaborator);
        res.status(201).json(collaborator);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ message: 'Failed to add collaborator' });
    }
  });
  
  // Update a collaborator
  app.put('/api/itineraries/:itineraryId/collaborators/:email', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ message: 'Invalid email' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const collaboratorData = insertItineraryCollaboratorSchema.partial().parse(req.body);
        
        // Get collaborators to see if the one we're updating exists
        const collaborators = await storage.getItineraryCollaborators(itineraryId);
        const existingCollaborator = collaborators.find(c => c.email === email);
        if (!existingCollaborator) {
          return res.status(404).json({ message: 'Collaborator not found' });
        }
        
        const collaborator = await storage.updateItineraryCollaborator(itineraryId, email, collaboratorData);
        
        if (!collaborator) {
          return res.status(404).json({ message: 'Collaborator not found' });
        }
        
        res.json(collaborator);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating collaborator:', error);
      res.status(500).json({ message: 'Failed to update collaborator' });
    }
  });
  
  // Remove a collaborator
  app.delete('/api/itineraries/:itineraryId/collaborators/:email', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ message: 'Invalid email' });
      }
      
      // Get collaborators to see if the one we're removing exists
      const collaborators = await storage.getItineraryCollaborators(itineraryId);
      const existingCollaborator = collaborators.find(c => c.email === email);
      if (!existingCollaborator) {
        return res.status(404).json({ message: 'Collaborator not found' });
      }
      
      await storage.removeItineraryCollaborator(itineraryId, email);
      res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ message: 'Failed to remove collaborator' });
    }
  });
  
  // Transport Booking Routes
  // Get bookings for a user
  app.get('/api/transport-bookings/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const bookings = await storage.getTransportBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching transport bookings:', error);
      res.status(500).json({ message: 'Failed to fetch transport bookings' });
    }
  });
  
  // Get bookings for an itinerary
  app.get('/api/itineraries/:itineraryId/transport-bookings', async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.itineraryId);
      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: 'Invalid itinerary ID' });
      }
      
      // Check if itinerary exists
      const itinerary = await storage.getItineraryById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      const bookings = await storage.getTransportBookingsByItinerary(itineraryId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching transport bookings for itinerary:', error);
      res.status(500).json({ message: 'Failed to fetch transport bookings for itinerary' });
    }
  });
  
  // Create a transport booking
  app.post('/api/transport-bookings', async (req, res) => {
    try {
      try {
        const bookingData = insertTransportBookingSchema.parse(req.body);
        
        // Check if user exists
        const user = await storage.getUser(bookingData.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if itinerary exists, if provided
        if (bookingData.itineraryId) {
          const itinerary = await storage.getItineraryById(bookingData.itineraryId);
          if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
          }
        }
        
        const booking = await storage.createTransportBooking(bookingData);
        res.status(201).json(booking);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating transport booking:', error);
      res.status(500).json({ message: 'Failed to create transport booking' });
    }
  });
  
  // Update a transport booking
  app.put('/api/transport-bookings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      try {
        // Use partial to allow updating subset of fields
        const bookingData = insertTransportBookingSchema.partial().parse(req.body);
        
        // If user ID is provided, check if user exists
        if (bookingData.userId) {
          const user = await storage.getUser(bookingData.userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
        }
        
        // If itinerary ID is provided, check if itinerary exists
        if (bookingData.itineraryId) {
          const itinerary = await storage.getItineraryById(bookingData.itineraryId);
          if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
          }
        }
        
        const booking = await storage.updateTransportBooking(id, bookingData);
        
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleValidationError(error, res);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating transport booking:', error);
      res.status(500).json({ message: 'Failed to update transport booking' });
    }
  });
  
  // Delete a transport booking
  app.delete('/api/transport-bookings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      const booking = await storage.getTransportBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      await storage.deleteTransportBooking(id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting transport booking:', error);
      res.status(500).json({ message: 'Failed to delete transport booking' });
    }
  });

  // Mock Google Places API for seeding data
  app.get('/api/seed-data', async (_req, res) => {
    try {
      // Sample data for initial load
      const sampleBusinesses = [
        {
          name: "Victoria Falls Hotel",
          description: "Historic 5-star hotel with stunning views of Victoria Falls",
          address: "1 Mallet Drive, Victoria Falls",
          city: "Victoria Falls",
          latitude: -17.9326,
          longitude: 25.8308,
          categoryId: 1, // Accommodation
          rating: 4.8,
          priceLevel: 4, // $$$$
          website: "https://www.victoriafallshotel.com",
          phone: "+263 83 2844561",
          images: ["https://images.unsplash.com/photo-1455587734955-081b22074882"],
          tags: ["5-star hotel", "Luxury", "Restaurant"],
          amenities: ["WiFi", "Pool", "Restaurant", "Bar", "Air Conditioning"]
        },
        {
          name: "Great Zimbabwe Ruins",
          description: "UNESCO World Heritage Site and ancient stone city",
          address: "Great Zimbabwe, Masvingo",
          city: "Masvingo",
          latitude: -20.2852,
          longitude: 30.9344,
          categoryId: 3, // Attractions
          rating: 4.7,
          priceLevel: 2, // $$
          website: "https://www.greatzimbabwe.com",
          phone: "+263 77 1234567",
          images: ["https://images.unsplash.com/photo-1575223970966-76ae61ee7838"],
          tags: ["Historical", "Cultural", "Guided Tours"],
          amenities: ["Guided Tours", "Parking", "Souvenir Shop"]
        },
        {
          name: "Mana Pools Safari Lodge",
          description: "Luxury safari lodge in Mana Pools National Park",
          address: "Mana Pools National Park",
          city: "Kariba",
          latitude: -15.8760,
          longitude: 29.3851,
          categoryId: 1, // Accommodation
          rating: 4.9,
          priceLevel: 4, // $$$$
          website: "https://www.manapoolslodge.com",
          phone: "+263 78 9876543",
          images: ["https://images.unsplash.com/photo-1504871881170-d7a841199146"],
          tags: ["Safari", "Eco-Lodge", "Wildlife"],
          amenities: ["WiFi", "Pool", "Restaurant", "Game Drives", "Bar"]
        },
        {
          name: "Boma Restaurant",
          description: "Traditional African dining experience with local cuisine",
          address: "745 Fife Street, Harare",
          city: "Harare",
          latitude: -17.8252,
          longitude: 31.0335,
          categoryId: 2, // Dining
          rating: 4.6,
          priceLevel: 2, // $$
          website: "https://www.bomarestaurant.co.zw",
          phone: "+263 77 8765432",
          images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"],
          tags: ["Authentic", "Traditional", "Live Music"],
          amenities: ["Live Music", "Outdoor Seating", "Private Dining", "Bar"]
        }
      ];
      
      // Add sample businesses if they don't exist
      const existingBusinesses = await storage.getBusinesses();
      if (existingBusinesses.length === 0) {
        for (const business of sampleBusinesses) {
          await storage.createBusiness(business);
        }
      }
      
      res.json({ message: "Data seeded successfully", count: sampleBusinesses.length });
    } catch (error) {
      console.error('Error seeding data:', error);
      res.status(500).json({ message: 'Failed to seed data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
