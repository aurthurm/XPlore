import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, real, json, primaryKey, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  isBusiness: boolean("is_business").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define user relations - will need forward declarations
// Note: Relations are defined after all tables are declared

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  isBusiness: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories);

// Business schema
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  categoryId: integer("category_id").notNull(),
  ownerId: integer("owner_id"),
  claimed: boolean("claimed").default(false),
  rating: real("rating"),
  priceLevel: integer("price_level"),
  website: text("website"),
  phone: text("phone"),
  images: text("images").array(),
  tags: text("tags").array(),
  amenities: text("amenities").array(),
  createdAt: timestamp("created_at").defaultNow(),
  googlePlaceId: text("google_place_id"),
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  name: true,
  description: true,
  address: true,
  city: true,
  latitude: true,
  longitude: true,
  categoryId: true,
  ownerId: true,
  claimed: true,
  rating: true,
  priceLevel: true,
  website: true,
  phone: true,
  images: true,
  tags: true,
  amenities: true,
  googlePlaceId: true,
});

// Business claim requests
export const claimRequests = pgTable("claim_requests", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClaimRequestSchema = createInsertSchema(claimRequests).pick({
  businessId: true,
  userId: true,
  status: true,
  documentUrl: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type ClaimRequest = typeof claimRequests.$inferSelect;
export type InsertClaimRequest = z.infer<typeof insertClaimRequestSchema>;

// Schema for search filters
export const searchFilterSchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.number().optional(),
  priceLevel: z.array(z.number()).optional(),
  amenities: z.array(z.string()).optional(),
  accessibility: z.array(z.string()).optional(),
  rating: z.number().optional(),
  nearMe: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
});

export type SearchFilter = z.infer<typeof searchFilterSchema>;

// Itinerary planning system tables
// Itineraries
export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isPublic: boolean("is_public").default(false),
  coverImage: text("cover_image"),
  totalBudget: integer("total_budget"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//Relations will be defined after all tables are declared

export const insertItinerarySchema = createInsertSchema(itineraries).pick({
  userId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  isPublic: true,
  coverImage: true,
  totalBudget: true,
});

// Itinerary days
export const itineraryDays = pgTable("itinerary_days", {
  id: serial("id").primaryKey(),
  itineraryId: integer("itinerary_id").notNull().references(() => itineraries.id),
  dayNumber: integer("day_number").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

//Relations will be defined after all tables are declared

export const insertItineraryDaySchema = createInsertSchema(itineraryDays).pick({
  itineraryId: true,
  dayNumber: true,
  date: true,
  notes: true,
});

// Itinerary items (activities, accommodations, etc.)
export const itineraryItems = pgTable("itinerary_items", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull().references(() => itineraryDays.id),
  businessId: integer("business_id").references(() => businesses.id),
  type: text("type").notNull(), // 'activity', 'accommodation', 'transportation', 'custom'
  title: text("title").notNull(),
  description: text("description"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  location: text("location"),
  cost: integer("cost"),
  reservationConfirmation: text("reservation_confirmation"),
  customDetails: json("custom_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

//Relations will be defined after all tables are declared

export const insertItineraryItemSchema = createInsertSchema(itineraryItems).pick({
  dayId: true,
  businessId: true,
  type: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  cost: true,
  reservationConfirmation: true,
  customDetails: true,
});

// Itinerary collaborators
export const itineraryCollaborators = pgTable("itinerary_collaborators", {
  itineraryId: integer("itinerary_id").notNull().references(() => itineraries.id),
  email: text("email").notNull(),
  name: text("name"),
  accessLevel: text("access_level").notNull().default("view"), // 'view', 'edit'
  inviteStatus: text("invite_status").notNull().default("pending"), // 'pending', 'accepted'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.itineraryId, table.email] })
  };
});

//Relations will be defined after all tables are declared

export const insertItineraryCollaboratorSchema = createInsertSchema(itineraryCollaborators).pick({
  itineraryId: true,
  email: true,
  name: true,
  accessLevel: true,
});

// Transportation bookings
export const transportBookings = pgTable("transport_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itineraryId: integer("itinerary_id").references(() => itineraries.id),
  serviceType: text("service_type").notNull(), // 'driver', 'taxi', 'shuttle', etc.
  providerName: text("provider_name"),
  providerContact: text("provider_contact"),
  bookingDate: date("booking_date").notNull(),
  pickupTime: time("pickup_time").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  numberOfPassengers: integer("number_of_passengers").default(1),
  specialRequests: text("special_requests"),
  confirmationCode: text("confirmation_code"),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  cost: integer("cost"),
  paymentStatus: text("payment_status").default("unpaid"), // 'unpaid', 'partial', 'paid'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//Relations will be defined after all tables are declared

export const insertTransportBookingSchema = createInsertSchema(transportBookings).pick({
  userId: true,
  itineraryId: true,
  serviceType: true,
  providerName: true,
  providerContact: true,
  bookingDate: true,
  pickupTime: true,
  pickupLocation: true,
  dropoffLocation: true,
  numberOfPassengers: true,
  specialRequests: true,
  confirmationCode: true,
  status: true,
  cost: true,
  paymentStatus: true,
});

// Add new type exports for itinerary-related entities
export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;

export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;

export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;

export type ItineraryCollaborator = typeof itineraryCollaborators.$inferSelect;
export type InsertItineraryCollaborator = z.infer<typeof insertItineraryCollaboratorSchema>;

export type TransportBooking = typeof transportBookings.$inferSelect;
export type InsertTransportBooking = z.infer<typeof insertTransportBookingSchema>;

// Define all relations after all tables are declared to avoid circular references
// User relations
export const userRelations = relations(users, ({ many }) => ({
  itineraries: many(itineraries),
  transportBookings: many(transportBookings),
  claimRequests: many(claimRequests),
}));

// Category relations
export const categoryRelations = relations(categories, ({ many }) => ({
  businesses: many(businesses),
}));

// Business relations
export const businessRelations = relations(businesses, ({ one, many }) => ({
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id]
  }),
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id]
  }),
  claimRequests: many(claimRequests),
  itineraryItems: many(itineraryItems)
}));

// Claim request relations
export const claimRequestRelations = relations(claimRequests, ({ one }) => ({
  business: one(businesses, {
    fields: [claimRequests.businessId],
    references: [businesses.id]
  }),
  user: one(users, {
    fields: [claimRequests.userId],
    references: [users.id]
  })
}));

// Itinerary relations
export const itineraryRelations = relations(itineraries, ({ one, many }) => ({
  user: one(users, {
    fields: [itineraries.userId],
    references: [users.id]
  }),
  days: many(itineraryDays),
  collaborators: many(itineraryCollaborators)
}));

// Itinerary day relations
export const itineraryDayRelations = relations(itineraryDays, ({ one, many }) => ({
  itinerary: one(itineraries, {
    fields: [itineraryDays.itineraryId],
    references: [itineraries.id]
  }),
  items: many(itineraryItems)
}));

// Itinerary item relations
export const itineraryItemRelations = relations(itineraryItems, ({ one }) => ({
  day: one(itineraryDays, {
    fields: [itineraryItems.dayId],
    references: [itineraryDays.id]
  }),
  business: one(businesses, {
    fields: [itineraryItems.businessId],
    references: [businesses.id]
  })
}));

// Itinerary collaborator relations
export const itineraryCollaboratorRelations = relations(itineraryCollaborators, ({ one }) => ({
  itinerary: one(itineraries, {
    fields: [itineraryCollaborators.itineraryId],
    references: [itineraries.id]
  })
}));

// Transport booking relations
export const transportBookingRelations = relations(transportBookings, ({ one }) => ({
  user: one(users, {
    fields: [transportBookings.userId],
    references: [users.id]
  }),
  itinerary: one(itineraries, {
    fields: [transportBookings.itineraryId],
    references: [itineraries.id]
  })
}));
