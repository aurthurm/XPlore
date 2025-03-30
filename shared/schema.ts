import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
