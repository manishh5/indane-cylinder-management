import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
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
  customerId: integer("customer_id"),
  trackOrderId: text("track_order_id").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").default(""),
  pincode: text("pincode").default(""),
  cylinderType: text("cylinder_type").notNull().default("14.2kg Domestic"),
  quantity: integer("quantity").notNull().default(1),
  bookingType: text("booking_type").notNull().default("refill"), // refill, new_connection
  amount: integer("amount").default(0),
  specialInstructions: text("special_instructions").default(""),
  assignedVendorId: integer("assigned_vendor_id"),
  status: text("status").notNull().default("pending"), // pending, processing, out_for_delivery, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorKycs = pgTable("vendor_kycs", {
  id: serial("id").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").default(""),
  address: text("address").notNull(),
  area: text("area").default(""),
  aadharUrl: text("aadhar_url").notNull(),
  panUrl: text("pan_url").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorInventories = pgTable("vendor_inventories", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  taken: integer("taken").notNull().default(0),
  returned: integer("returned").notNull().default(0),
  netEmpty: integer("net_empty").notNull().default(0),
  balance: integer("balance").notNull().default(0),
  outstandingBalance: integer("outstanding_balance").notNull().default(0),
});

export const vendorRequests = pgTable("vendor_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  cylinderType: text("cylinder_type").notNull().default("14.2kg Domestic"),
  requestType: text("request_type").notNull().default("take"), // take, return
  quantityDemanded: integer("quantity_demanded").notNull(),
  quantityApproved: integer("quantity_approved").default(0),
  notes: text("notes").default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorPaymentRequests = pgTable("vendor_payment_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, upi, bank_transfer
  referenceNumber: text("reference_number").default(""),
  notes: text("notes").default(""),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const cylinderRates = pgTable("cylinder_rates", {
  id: serial("id").primaryKey(),
  cylinderType: text("cylinder_type").notNull().unique(),
  price: integer("price").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, trackOrderId: true });
export const insertVendorKycSchema = createInsertSchema(vendorKycs).omit({ id: true, createdAt: true, status: true });
export const insertVendorRequestSchema = createInsertSchema(vendorRequests).omit({ id: true, createdAt: true, status: true, quantityApproved: true });
export const insertPaymentRequestSchema = createInsertSchema(vendorPaymentRequests).omit({ id: true, createdAt: true, status: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type VendorKyc = typeof vendorKycs.$inferSelect;
export type InsertVendorKyc = z.infer<typeof insertVendorKycSchema>;
export type VendorInventory = typeof vendorInventories.$inferSelect;
export type VendorRequest = typeof vendorRequests.$inferSelect;
export type InsertVendorRequest = z.infer<typeof insertVendorRequestSchema>;
export type VendorPaymentRequest = typeof vendorPaymentRequests.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type CylinderRate = typeof cylinderRates.$inferSelect;

export const CYLINDER_TYPES = ["14.2kg Domestic", "19kg Commercial", "10kg Composite", "5kg Domestic", "5kg Commercial"] as const;
export type CylinderType = typeof CYLINDER_TYPES[number];
