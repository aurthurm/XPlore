import { 
  categories, users, businesses, claimRequests,
  itineraries, itineraryDays, itineraryItems, itineraryCollaborators, transportBookings,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Business, type InsertBusiness,
  type ClaimRequest, type InsertClaimRequest,
  type Itinerary, type InsertItinerary,
  type ItineraryDay, type InsertItineraryDay,
  type ItineraryItem, type InsertItineraryItem,
  type ItineraryCollaborator, type InsertItineraryCollaborator,
  type TransportBooking, type InsertTransportBooking,
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
  
  // Itinerary methods
  getItineraries(userId: number): Promise<Itinerary[]>;
  getItineraryById(id: number): Promise<Itinerary | undefined>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  updateItinerary(id: number, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined>;
  deleteItinerary(id: number): Promise<boolean>;
  
  // Itinerary day methods
  getItineraryDays(itineraryId: number): Promise<ItineraryDay[]>;
  getItineraryDayById(id: number): Promise<ItineraryDay | undefined>;
  createItineraryDay(day: InsertItineraryDay): Promise<ItineraryDay>;
  updateItineraryDay(id: number, day: Partial<InsertItineraryDay>): Promise<ItineraryDay | undefined>;
  deleteItineraryDay(id: number): Promise<boolean>;
  
  // Itinerary item methods
  getItineraryItems(dayId: number): Promise<ItineraryItem[]>;
  getItineraryItemById(id: number): Promise<ItineraryItem | undefined>;
  createItineraryItem(item: InsertItineraryItem): Promise<ItineraryItem>;
  updateItineraryItem(id: number, item: Partial<InsertItineraryItem>): Promise<ItineraryItem | undefined>;
  deleteItineraryItem(id: number): Promise<boolean>;
  
  // Itinerary collaborator methods
  getItineraryCollaborators(itineraryId: number): Promise<ItineraryCollaborator[]>;
  addItineraryCollaborator(collaborator: InsertItineraryCollaborator): Promise<ItineraryCollaborator>;
  updateItineraryCollaborator(itineraryId: number, email: string, data: Partial<InsertItineraryCollaborator>): Promise<ItineraryCollaborator | undefined>;
  removeItineraryCollaborator(itineraryId: number, email: string): Promise<boolean>;
  
  // Transport booking methods
  getTransportBookings(userId: number): Promise<TransportBooking[]>;
  getTransportBookingsByItinerary(itineraryId: number): Promise<TransportBooking[]>;
  getTransportBookingById(id: number): Promise<TransportBooking | undefined>;
  createTransportBooking(booking: InsertTransportBooking): Promise<TransportBooking>;
  updateTransportBooking(id: number, booking: Partial<InsertTransportBooking>): Promise<TransportBooking | undefined>;
  deleteTransportBooking(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private businesses: Map<number, Business>;
  private claimRequests: Map<number, ClaimRequest>;
  private itineraries: Map<number, Itinerary>;
  private itineraryDays: Map<number, ItineraryDay>;
  private itineraryItems: Map<number, ItineraryItem>;
  private itineraryCollaborators: Map<string, ItineraryCollaborator>; // key: itineraryId-email
  private transportBookings: Map<number, TransportBooking>;
  
  private userId: number;
  private categoryId: number;
  private businessId: number;
  private claimRequestId: number;
  private itineraryId: number;
  private itineraryDayId: number;
  private itineraryItemId: number;
  private transportBookingId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.businesses = new Map();
    this.claimRequests = new Map();
    this.itineraries = new Map();
    this.itineraryDays = new Map();
    this.itineraryItems = new Map();
    this.itineraryCollaborators = new Map();
    this.transportBookings = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.businessId = 1;
    this.claimRequestId = 1;
    this.itineraryId = 1;
    this.itineraryDayId = 1;
    this.itineraryItemId = 1;
    this.transportBookingId = 1;
    
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

  // Itinerary methods
  async getItineraries(userId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.userId === userId
    );
  }

  async getItineraryById(id: number): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.itineraryId++;
    const timestamp = new Date();
    const itinerary: Itinerary = { 
      ...insertItinerary, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async updateItinerary(id: number, partialItinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const existingItinerary = this.itineraries.get(id);
    if (!existingItinerary) return undefined;
    
    const updatedItinerary = { 
      ...existingItinerary, 
      ...partialItinerary, 
      updatedAt: new Date() 
    };
    this.itineraries.set(id, updatedItinerary);
    return updatedItinerary;
  }

  async deleteItinerary(id: number): Promise<boolean> {
    // First delete all related entities
    
    // Delete all itinerary days and their items
    const days = await this.getItineraryDays(id);
    for (const day of days) {
      await this.deleteItineraryDay(day.id);
    }
    
    // Delete all collaborators
    const collaborators = await this.getItineraryCollaborators(id);
    for (const collaborator of collaborators) {
      await this.removeItineraryCollaborator(id, collaborator.email);
    }
    
    // Delete the itinerary itself
    return this.itineraries.delete(id);
  }

  // Itinerary day methods
  async getItineraryDays(itineraryId: number): Promise<ItineraryDay[]> {
    const days = Array.from(this.itineraryDays.values()).filter(
      (day) => day.itineraryId === itineraryId
    );
    
    // Sort by day number
    return days.sort((a, b) => a.dayNumber - b.dayNumber);
  }

  async getItineraryDayById(id: number): Promise<ItineraryDay | undefined> {
    return this.itineraryDays.get(id);
  }

  async createItineraryDay(insertDay: InsertItineraryDay): Promise<ItineraryDay> {
    const id = this.itineraryDayId++;
    const timestamp = new Date();
    const day: ItineraryDay = { ...insertDay, id, createdAt: timestamp };
    this.itineraryDays.set(id, day);
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(insertDay.itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    return day;
  }

  async updateItineraryDay(id: number, partialDay: Partial<InsertItineraryDay>): Promise<ItineraryDay | undefined> {
    const existingDay = this.itineraryDays.get(id);
    if (!existingDay) return undefined;
    
    const updatedDay = { ...existingDay, ...partialDay };
    this.itineraryDays.set(id, updatedDay);
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(existingDay.itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    return updatedDay;
  }

  async deleteItineraryDay(id: number): Promise<boolean> {
    const day = this.itineraryDays.get(id);
    if (!day) return false;
    
    // First delete all items in this day
    const items = await this.getItineraryItems(id);
    for (const item of items) {
      await this.deleteItineraryItem(item.id);
    }
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(day.itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    // Delete the day itself
    return this.itineraryDays.delete(id);
  }

  // Itinerary item methods
  async getItineraryItems(dayId: number): Promise<ItineraryItem[]> {
    const items = Array.from(this.itineraryItems.values()).filter(
      (item) => item.dayId === dayId
    );
    
    // Sort by start time if available
    return items.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime > b.startTime ? 1 : -1;
    });
  }

  async getItineraryItemById(id: number): Promise<ItineraryItem | undefined> {
    return this.itineraryItems.get(id);
  }

  async createItineraryItem(insertItem: InsertItineraryItem): Promise<ItineraryItem> {
    const id = this.itineraryItemId++;
    const timestamp = new Date();
    const item: ItineraryItem = { ...insertItem, id, createdAt: timestamp };
    this.itineraryItems.set(id, item);
    
    // Update the parent day's itinerary updatedAt
    const day = await this.getItineraryDayById(insertItem.dayId);
    if (day) {
      const itinerary = await this.getItineraryById(day.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return item;
  }

  async updateItineraryItem(id: number, partialItem: Partial<InsertItineraryItem>): Promise<ItineraryItem | undefined> {
    const existingItem = this.itineraryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...partialItem };
    this.itineraryItems.set(id, updatedItem);
    
    // Update the parent day's itinerary updatedAt
    const day = await this.getItineraryDayById(existingItem.dayId);
    if (day) {
      const itinerary = await this.getItineraryById(day.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return updatedItem;
  }

  async deleteItineraryItem(id: number): Promise<boolean> {
    const item = this.itineraryItems.get(id);
    if (!item) return false;
    
    // Update the parent day's itinerary updatedAt
    const day = await this.getItineraryDayById(item.dayId);
    if (day) {
      const itinerary = await this.getItineraryById(day.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return this.itineraryItems.delete(id);
  }

  // Itinerary collaborator methods
  async getItineraryCollaborators(itineraryId: number): Promise<ItineraryCollaborator[]> {
    return Array.from(this.itineraryCollaborators.values()).filter(
      (collaborator) => collaborator.itineraryId === itineraryId
    );
  }

  async addItineraryCollaborator(insertCollaborator: InsertItineraryCollaborator): Promise<ItineraryCollaborator> {
    const key = `${insertCollaborator.itineraryId}-${insertCollaborator.email}`;
    const timestamp = new Date();
    const collaborator: ItineraryCollaborator = { 
      ...insertCollaborator, 
      createdAt: timestamp,
      inviteStatus: 'pending',
      accessLevel: insertCollaborator.accessLevel || 'view'
    };
    this.itineraryCollaborators.set(key, collaborator);
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(insertCollaborator.itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    return collaborator;
  }

  async updateItineraryCollaborator(
    itineraryId: number, 
    email: string, 
    data: Partial<InsertItineraryCollaborator>
  ): Promise<ItineraryCollaborator | undefined> {
    const key = `${itineraryId}-${email}`;
    const existingCollaborator = this.itineraryCollaborators.get(key);
    if (!existingCollaborator) return undefined;
    
    const updatedCollaborator = { ...existingCollaborator, ...data };
    this.itineraryCollaborators.set(key, updatedCollaborator);
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    return updatedCollaborator;
  }

  async removeItineraryCollaborator(itineraryId: number, email: string): Promise<boolean> {
    const key = `${itineraryId}-${email}`;
    
    // Update the parent itinerary's updatedAt
    const itinerary = await this.getItineraryById(itineraryId);
    if (itinerary) {
      await this.updateItinerary(itinerary.id, {});
    }
    
    return this.itineraryCollaborators.delete(key);
  }

  // Transport booking methods
  async getTransportBookings(userId: number): Promise<TransportBooking[]> {
    return Array.from(this.transportBookings.values()).filter(
      (booking) => booking.userId === userId
    ).sort((a, b) => {
      return new Date(a.bookingDate) > new Date(b.bookingDate) ? 1 : -1;
    });
  }

  async getTransportBookingsByItinerary(itineraryId: number): Promise<TransportBooking[]> {
    return Array.from(this.transportBookings.values()).filter(
      (booking) => booking.itineraryId === itineraryId
    ).sort((a, b) => {
      return new Date(a.bookingDate) > new Date(b.bookingDate) ? 1 : -1;
    });
  }

  async getTransportBookingById(id: number): Promise<TransportBooking | undefined> {
    return this.transportBookings.get(id);
  }

  async createTransportBooking(insertBooking: InsertTransportBooking): Promise<TransportBooking> {
    const id = this.transportBookingId++;
    const timestamp = new Date();
    const booking: TransportBooking = { 
      ...insertBooking, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.transportBookings.set(id, booking);
    
    // If this is part of an itinerary, update the itinerary's updatedAt
    if (insertBooking.itineraryId) {
      const itinerary = await this.getItineraryById(insertBooking.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return booking;
  }

  async updateTransportBooking(id: number, partialBooking: Partial<InsertTransportBooking>): Promise<TransportBooking | undefined> {
    const existingBooking = this.transportBookings.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { 
      ...existingBooking, 
      ...partialBooking, 
      updatedAt: new Date() 
    };
    this.transportBookings.set(id, updatedBooking);
    
    // If this is part of an itinerary, update the itinerary's updatedAt
    if (existingBooking.itineraryId) {
      const itinerary = await this.getItineraryById(existingBooking.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return updatedBooking;
  }

  async deleteTransportBooking(id: number): Promise<boolean> {
    const booking = this.transportBookings.get(id);
    if (!booking) return false;
    
    // If this is part of an itinerary, update the itinerary's updatedAt
    if (booking.itineraryId) {
      const itinerary = await this.getItineraryById(booking.itineraryId);
      if (itinerary) {
        await this.updateItinerary(itinerary.id, {});
      }
    }
    
    return this.transportBookings.delete(id);
  }
}

export const storage = new MemStorage();
