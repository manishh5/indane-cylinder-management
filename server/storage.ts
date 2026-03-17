import { db } from "./db";
import {
  users, bookings, vendorKycs, vendorInventories, vendorRequests, vendorPaymentRequests, cylinderRates,
  type User, type InsertUser, type Booking, type InsertBooking,
  type VendorKyc, type InsertVendorKyc, type VendorInventory,
  type VendorRequest, type InsertVendorRequest, type VendorPaymentRequest, type InsertPaymentRequest,
  type CylinderRate, CYLINDER_TYPES
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllVendors(): Promise<User[]>;
  getAllCustomers(): Promise<User[]>;

  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingByTrackId(trackOrderId: string): Promise<Booking | undefined>;
  getCustomerBookings(customerId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  assignVendorToBooking(id: number, vendorId: number): Promise<Booking>;

  createVendorKyc(kyc: InsertVendorKyc): Promise<VendorKyc>;
  getVendorKyc(id: number): Promise<VendorKyc | undefined>;
  getAllVendorKycs(): Promise<VendorKyc[]>;
  updateVendorKycStatus(id: number, status: string): Promise<VendorKyc>;

  getVendorInventory(vendorId: number): Promise<VendorInventory | undefined>;
  createVendorInventory(vendorId: number): Promise<VendorInventory>;
  updateVendorInventory(vendorId: number, changes: Partial<VendorInventory>): Promise<VendorInventory>;

  createVendorRequest(request: InsertVendorRequest): Promise<VendorRequest>;
  getAllVendorRequests(): Promise<VendorRequest[]>;
  getVendorRequests(vendorId: number): Promise<VendorRequest[]>;
  updateVendorRequest(id: number, quantityApproved: number, status: string): Promise<VendorRequest>;

  createPaymentRequest(req: InsertPaymentRequest): Promise<VendorPaymentRequest>;
  getAllPaymentRequests(): Promise<VendorPaymentRequest[]>;
  getVendorPaymentRequests(vendorId: number): Promise<VendorPaymentRequest[]>;
  updatePaymentRequestStatus(id: number, status: string): Promise<VendorPaymentRequest>;

  getCylinderRates(): Promise<CylinderRate[]>;
  upsertCylinderRate(cylinderType: string, price: number): Promise<CylinderRate>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    return u;
  }
  async getUserByUsername(username: string) {
    const [u] = await db.select().from(users).where(eq(users.username, username));
    return u;
  }
  async createUser(user: InsertUser) {
    const [u] = await db.insert(users).values(user).returning();
    return u;
  }
  async getAllVendors() {
    return await db.select().from(users).where(eq(users.role, "vendor"));
  }
  async getAllCustomers() {
    return await db.select().from(users).where(eq(users.role, "customer"));
  }

  async createBooking(booking: InsertBooking) {
    const [b] = await db.insert(bookings).values({
      ...booking,
      trackOrderId: `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }).returning();
    return b;
  }
  async getBookingByTrackId(trackOrderId: string) {
    const [b] = await db.select().from(bookings).where(eq(bookings.trackOrderId, trackOrderId));
    return b;
  }
  async getCustomerBookings(customerId: number) {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }
  async getAllBookings() {
    return await db.select().from(bookings);
  }
  async updateBookingStatus(id: number, status: string) {
    const [b] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return b;
  }
  async assignVendorToBooking(id: number, vendorId: number) {
    const [b] = await db.update(bookings).set({ assignedVendorId: vendorId, status: "processing" }).where(eq(bookings.id, id)).returning();
    return b;
  }

  async createVendorKyc(kyc: InsertVendorKyc) {
    const [k] = await db.insert(vendorKycs).values(kyc).returning();
    return k;
  }
  async getVendorKyc(id: number) {
    const [k] = await db.select().from(vendorKycs).where(eq(vendorKycs.id, id));
    return k;
  }
  async getAllVendorKycs() {
    return await db.select().from(vendorKycs);
  }
  async updateVendorKycStatus(id: number, status: string) {
    const [k] = await db.update(vendorKycs).set({ status }).where(eq(vendorKycs.id, id)).returning();
    return k;
  }

  async getVendorInventory(vendorId: number) {
    const [i] = await db.select().from(vendorInventories).where(eq(vendorInventories.vendorId, vendorId));
    return i;
  }
  async createVendorInventory(vendorId: number) {
    const [i] = await db.insert(vendorInventories).values({ vendorId }).returning();
    return i;
  }
  async updateVendorInventory(vendorId: number, changes: Partial<VendorInventory>) {
    const [i] = await db.update(vendorInventories).set(changes).where(eq(vendorInventories.vendorId, vendorId)).returning();
    return i;
  }

  async createVendorRequest(request: InsertVendorRequest) {
    const [r] = await db.insert(vendorRequests).values(request).returning();
    return r;
  }
  async getAllVendorRequests() {
    return await db.select().from(vendorRequests);
  }
  async getVendorRequests(vendorId: number) {
    return await db.select().from(vendorRequests).where(eq(vendorRequests.vendorId, vendorId));
  }
  async updateVendorRequest(id: number, quantityApproved: number, status: string) {
    const [r] = await db.update(vendorRequests).set({ quantityApproved, status }).where(eq(vendorRequests.id, id)).returning();
    return r;
  }

  async createPaymentRequest(req: InsertPaymentRequest) {
    const [p] = await db.insert(vendorPaymentRequests).values(req).returning();
    return p;
  }
  async getAllPaymentRequests() {
    return await db.select().from(vendorPaymentRequests);
  }
  async getVendorPaymentRequests(vendorId: number) {
    return await db.select().from(vendorPaymentRequests).where(eq(vendorPaymentRequests.vendorId, vendorId));
  }
  async updatePaymentRequestStatus(id: number, status: string) {
    const [p] = await db.update(vendorPaymentRequests).set({ status }).where(eq(vendorPaymentRequests.id, id)).returning();
    return p;
  }

  async getCylinderRates() {
    return await db.select().from(cylinderRates);
  }
  async upsertCylinderRate(cylinderType: string, price: number) {
    const existing = await db.select().from(cylinderRates).where(eq(cylinderRates.cylinderType, cylinderType));
    if (existing.length > 0) {
      const [r] = await db.update(cylinderRates).set({ price }).where(eq(cylinderRates.cylinderType, cylinderType)).returning();
      return r;
    }
    const [r] = await db.insert(cylinderRates).values({ cylinderType, price }).returning();
    return r;
  }
}

export const storage = new DatabaseStorage();
