import { db } from "./db";
import {
  users, bookings, vendorKycs, vendorInventories, vendorRequests,
  type User, type InsertUser, type Booking, type InsertBooking,
  type VendorKyc, type InsertVendorKyc, type VendorInventory,
  type VendorRequest, type InsertVendorRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserKyc(id: number, approved: boolean): Promise<User>;
  
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingByTrackId(trackOrderId: string): Promise<Booking | undefined>;
  getCustomorBookings(customerId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
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
  updateVendorRequest(id: number, approvedQty: number, status: string): Promise<VendorRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async updateUserKyc(id: number, kycApproved: boolean): Promise<User> {
    const [updated] = await db.update(users).set({ kycApproved }).where(eq(users.id, id)).returning();
    return updated;
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values({
      ...booking,
      trackOrderId: `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }).returning();
    return created;
  }
  async getBookingByTrackId(trackOrderId: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.trackOrderId, trackOrderId));
    return booking;
  }
  async getCustomorBookings(customerId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }
  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async createVendorKyc(kyc: InsertVendorKyc): Promise<VendorKyc> {
    const [created] = await db.insert(vendorKycs).values(kyc).returning();
    return created;
  }
  async getVendorKyc(id: number): Promise<VendorKyc | undefined> {
    const [kyc] = await db.select().from(vendorKycs).where(eq(vendorKycs.id, id));
    return kyc;
  }
  async getAllVendorKycs(): Promise<VendorKyc[]> {
    return await db.select().from(vendorKycs);
  }
  async updateVendorKycStatus(id: number, status: string): Promise<VendorKyc> {
    const [updated] = await db.update(vendorKycs).set({ status }).where(eq(vendorKycs.id, id)).returning();
    return updated;
  }
  
  async getVendorInventory(vendorId: number): Promise<VendorInventory | undefined> {
    const [inv] = await db.select().from(vendorInventories).where(eq(vendorInventories.vendorId, vendorId));
    return inv;
  }
  async createVendorInventory(vendorId: number): Promise<VendorInventory> {
    const [inv] = await db.insert(vendorInventories).values({ vendorId }).returning();
    return inv;
  }
  async updateVendorInventory(vendorId: number, changes: Partial<VendorInventory>): Promise<VendorInventory> {
    const [updated] = await db.update(vendorInventories).set(changes).where(eq(vendorInventories.vendorId, vendorId)).returning();
    return updated;
  }
  
  async createVendorRequest(request: InsertVendorRequest): Promise<VendorRequest> {
    const [created] = await db.insert(vendorRequests).values(request).returning();
    return created;
  }
  async getAllVendorRequests(): Promise<VendorRequest[]> {
    return await db.select().from(vendorRequests);
  }
  async getVendorRequests(vendorId: number): Promise<VendorRequest[]> {
    return await db.select().from(vendorRequests).where(eq(vendorRequests.vendorId, vendorId));
  }
  async updateVendorRequest(id: number, quantityApproved: number, status: string): Promise<VendorRequest> {
    const [updated] = await db.update(vendorRequests).set({ quantityApproved, status }).where(eq(vendorRequests.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
