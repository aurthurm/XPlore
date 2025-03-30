import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBusinessSchema, 
  insertClaimRequestSchema,
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
