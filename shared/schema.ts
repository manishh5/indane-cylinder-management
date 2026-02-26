import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'customer', 'admin', 'vendor'
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  address: text("address"),
  kycApproved: boolean("kyc_approved").default(false),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"), // null for quick booking
  trackOrderId: text("track_order_id").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default('pending'), // pending, accepted, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorKycs = pgTable("vendor_kycs", {
  id: serial("id").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  aadharUrl: text("aadhar_url").notNull(),
  panUrl: text("pan_url").notNull(),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorInventories = pgTable("vendor_inventories", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  taken: integer("taken").notNull().default(0),
  returned: integer("returned").notNull().default(0),
  netEmpty: integer("net_empty").notNull().default(0),
  balance: integer("balance").notNull().default(0),
});

export const vendorRequests = pgTable("vendor_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  quantityDemanded: integer("quantity_demanded").notNull(),
  quantityApproved: integer("quantity_approved").default(0),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, trackOrderId: true });
export const insertVendorKycSchema = createInsertSchema(vendorKycs).omit({ id: true, createdAt: true, status: true });
export const insertVendorRequestSchema = createInsertSchema(vendorRequests).omit({ id: true, createdAt: true, status: true, quantityApproved: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type VendorKyc = typeof vendorKycs.$inferSelect;
export type InsertVendorKyc = z.infer<typeof insertVendorKycSchema>;
export type VendorInventory = typeof vendorInventories.$inferSelect;
export type VendorRequest = typeof vendorRequests.$inferSelect;
export type InsertVendorRequest = z.infer<typeof insertVendorRequestSchema>;
