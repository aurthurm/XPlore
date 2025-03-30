import { 
  categories, users, businesses, claimRequests,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Business, type InsertBusiness,
  type ClaimRequest, type InsertClaimRequest,
  type SearchFilter
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Business methods
  getBusinesses(filter?: SearchFilter): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business | undefined>;
  getBusinessByGooglePlaceId(placeId: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  getBusinessesByOwnerId(ownerId: number): Promise<Business[]>;
  
  // Claim requests
  createClaimRequest(request: InsertClaimRequest): Promise<ClaimRequest>;
  getClaimRequestById(id: number): Promise<ClaimRequest | undefined>;
  getClaimRequestsByBusinessId(businessId: number): Promise<ClaimRequest[]>;
  getClaimRequestsByUserId(userId: number): Promise<ClaimRequest[]>;
  updateClaimRequest(id: number, status: string): Promise<ClaimRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private businesses: Map<number, Business>;
  private claimRequests: Map<number, ClaimRequest>;
  
  private userId: number;
  private categoryId: number;
  private businessId: number;
  private claimRequestId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.businesses = new Map();
    this.claimRequests = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.businessId = 1;
    this.claimRequestId = 1;
    
    // Initialize with default categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const defaultCategories = [
      { name: "Accommodation", icon: "hotel" },
      { name: "Dining", icon: "utensils" },
      { name: "Attractions", icon: "mountain" },
      { name: "Services", icon: "concierge-bell" },
      { name: "Shopping", icon: "shopping-bag" }
    ];
    
    for (const category of defaultCategories) {
      this.createCategory(category);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Business methods
  async getBusinesses(filter?: SearchFilter): Promise<Business[]> {
    let businesses = Array.from(this.businesses.values());
    
    if (!filter) return businesses;
    
    // Apply filters
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      businesses = businesses.filter(business => 
        business.name.toLowerCase().includes(keyword) || 
        (business.description?.toLowerCase().includes(keyword))
      );
    }
    
    if (filter.categoryId) {
      businesses = businesses.filter(business => business.categoryId === filter.categoryId);
    }
    
    if (filter.priceLevel && filter.priceLevel.length > 0) {
      businesses = businesses.filter(business => 
        business.priceLevel && filter.priceLevel?.includes(business.priceLevel)
      );
    }
    
    if (filter.rating) {
      businesses = businesses.filter(business => 
        business.rating && business.rating >= (filter.rating || 0)
      );
    }
    
    if (filter.amenities && filter.amenities.length > 0) {
      businesses = businesses.filter(business => 
        business.amenities && filter.amenities?.some(amenity => 
          business.amenities?.includes(amenity)
        )
      );
    }
    
    if (filter.accessibility && filter.accessibility.length > 0) {
      businesses = businesses.filter(business => 
        business.tags && filter.accessibility?.some(access => 
          business.tags?.includes(access)
        )
      );
    }
    
    if (filter.nearMe && filter.latitude && filter.longitude) {
      // Simple distance calculation (not accurate for large distances)
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km
        return distance;
      };
      
      const maxDistance = filter.radius || 10; // Default 10km radius
      
      businesses = businesses.filter(business => {
        const distance = calculateDistance(
          filter.latitude!, 
          filter.longitude!, 
          business.latitude, 
          business.longitude
        );
        return distance <= maxDistance;
      });
      
      // Sort by distance
      businesses.sort((a, b) => {
        const distA = calculateDistance(filter.latitude!, filter.longitude!, a.latitude, a.longitude);
        const distB = calculateDistance(filter.latitude!, filter.longitude!, b.latitude, b.longitude);
        return distA - distB;
      });
    }
    
    return businesses;
  }
  
  async getBusinessById(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }
  
  async getBusinessByGooglePlaceId(placeId: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.googlePlaceId === placeId
    );
  }
  
  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.businessId++;
    const timestamp = new Date();
    const business: Business = { ...insertBusiness, id, createdAt: timestamp };
    this.businesses.set(id, business);
    return business;
  }
  
  async updateBusiness(id: number, partialBusiness: Partial<InsertBusiness>): Promise<Business | undefined> {
    const existingBusiness = this.businesses.get(id);
    if (!existingBusiness) return undefined;
    
    const updatedBusiness = { ...existingBusiness, ...partialBusiness };
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }
  
  async getBusinessesByOwnerId(ownerId: number): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(
      (business) => business.ownerId === ownerId
    );
  }
  
  // Claim request methods
  async createClaimRequest(insertClaimRequest: InsertClaimRequest): Promise<ClaimRequest> {
    const id = this.claimRequestId++;
    const timestamp = new Date();
    const claimRequest: ClaimRequest = { ...insertClaimRequest, id, createdAt: timestamp };
    this.claimRequests.set(id, claimRequest);
    return claimRequest;
  }
  
  async getClaimRequestById(id: number): Promise<ClaimRequest | undefined> {
    return this.claimRequests.get(id);
  }
  
  async getClaimRequestsByBusinessId(businessId: number): Promise<ClaimRequest[]> {
    return Array.from(this.claimRequests.values()).filter(
      (request) => request.businessId === businessId
    );
  }
  
  async getClaimRequestsByUserId(userId: number): Promise<ClaimRequest[]> {
    return Array.from(this.claimRequests.values()).filter(
      (request) => request.userId === userId
    );
  }
  
  async updateClaimRequest(id: number, status: string): Promise<ClaimRequest | undefined> {
    const existingRequest = this.claimRequests.get(id);
    if (!existingRequest) return undefined;
    
    const updatedRequest = { ...existingRequest, status };
    this.claimRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
