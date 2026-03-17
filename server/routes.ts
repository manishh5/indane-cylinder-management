import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { CYLINDER_TYPES } from "@shared/schema";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-indane",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    } catch (err) { return done(err); }
  }));
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try { done(null, await storage.getUser(id)); } catch (err) { done(err); }
  });

  // Seed admin and cylinder rates
  try {
    const admin = await storage.getUserByUsername("ADMIN");
    if (!admin) {
      await storage.createUser({ username: "ADMIN", password: "newAdmin", role: "admin", name: "Admin" });
    }
    const rates = await storage.getCylinderRates();
    if (rates.length === 0) {
      const defaultRates = [
        { cylinderType: "14.2kg Domestic", price: 902 },
        { cylinderType: "19kg Commercial", price: 1765 },
        { cylinderType: "10kg Composite", price: 640 },
        { cylinderType: "5kg Domestic", price: 450 },
        { cylinderType: "5kg Commercial", price: 490 },
      ];
      for (const r of defaultRates) await storage.upsertCylinderRate(r.cylinderType, r.price);
    }
  } catch (err) { console.error("Seed error", err); }

  // ── AUTH ──
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => res.json(req.user));
  app.post(api.auth.logout.path, (req, res, next) => req.logout((err) => err ? next(err) : res.json({ message: "Logged out" })));
  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
  app.post(api.auth.registerCustomer.path, async (req, res) => {
    try {
      const input = api.auth.registerCustomer.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.phone);
      if (existing) return res.status(400).json({ message: "Phone number already registered" });
      const user = await storage.createUser({ username: input.phone, password: input.password, role: "customer", name: input.name, phone: input.phone, address: input.address });
      req.login(user, (err) => err ? res.status(500).json({ message: "Login failed" }) : res.status(201).json(user));
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── BOOKINGS ──
  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      // Calculate amount from cylinder rate
      const rates = await storage.getCylinderRates();
      const rate = rates.find(r => r.cylinderType === input.cylinderType);
      const amount = rate ? rate.price * (input.quantity || 1) : 0;
      const booking = await storage.createBooking({ ...input, amount, customerId: req.isAuthenticated() ? (req.user as any).id : null });
      res.status(201).json(booking);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Server error" });
    }
  });
  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    const bookings = user.role === "customer" ? await storage.getCustomerBookings(user.id) : await storage.getAllBookings();
    res.json(bookings);
  });
  app.get(api.bookings.get.path, async (req, res) => {
    const booking = await storage.getBookingByTrackId(req.params.trackOrderId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  });
  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const user = req.user as any;
    if (user.role !== "admin" && user.role !== "vendor") return res.status(403).json({ message: "Forbidden" });
    const booking = await storage.updateBookingStatus(Number(req.params.id), req.body.status);
    res.json(booking);
  });
  app.patch(api.bookings.assignVendor.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const booking = await storage.assignVendorToBooking(Number(req.params.id), Number(req.body.vendorId));
    res.json(booking);
  });

  // ── VENDORS ──
  app.post(api.vendors.submitKyc.path, async (req, res) => {
    try {
      const input = api.vendors.submitKyc.input.parse(req.body);
      res.status(201).json(await storage.createVendorKyc(input));
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Server error" });
    }
  });
  app.get(api.vendors.listKyc.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.getAllVendorKycs());
  });
  app.post(api.vendors.approveKyc.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const kyc = await storage.getVendorKyc(Number(req.params.id));
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    const { username, password } = req.body;
    const user = await storage.createUser({ username, password, role: "vendor", name: kyc.vendorName, phone: kyc.phone, address: kyc.address, kycApproved: true });
    await storage.updateVendorKycStatus(Number(req.params.id), "approved");
    await storage.createVendorInventory(user.id);
    res.json({ ...kyc, status: "approved" });
  });
  app.post(api.vendors.rejectKyc.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.updateVendorKycStatus(Number(req.params.id), "rejected"));
  });
  app.get(api.vendors.list.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.getAllVendors());
  });
  app.get(api.vendors.inventory.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const id = Number(req.params.id) === 0 ? (req.user as any).id : Number(req.params.id);
    const inv = await storage.getVendorInventory(id);
    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json(inv);
  });

  // ── VENDOR CYLINDER REQUESTS ──
  app.post(api.vendors.createRequest.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "vendor") return res.status(403).json({ message: "Forbidden" });
    const user = req.user as any;
    const { quantityDemanded, cylinderType, requestType, notes } = req.body;
    res.status(201).json(await storage.createVendorRequest({ vendorId: user.id, quantityDemanded: Number(quantityDemanded), cylinderType: cylinderType || "14.2kg Domestic", requestType: requestType || "take", notes: notes || "" }));
  });
  app.get(api.vendors.listRequests.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const user = req.user as any;
    res.json(user.role === "admin" ? await storage.getAllVendorRequests() : await storage.getVendorRequests(user.id));
  });
  app.patch(api.vendors.approveRequest.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { quantityApproved } = req.body;
    const vReq = await storage.updateVendorRequest(Number(req.params.id), Number(quantityApproved), "approved");
    const inv = await storage.getVendorInventory(vReq.vendorId);
    if (inv) {
      const isTake = vReq.requestType === "take";
      const newTaken = isTake ? inv.taken + Number(quantityApproved) : inv.taken;
      const newReturned = !isTake ? inv.returned + Number(quantityApproved) : inv.returned;
      const newNetEmpty = newTaken - newReturned;
      const newBalance = isTake ? inv.balance + Number(quantityApproved) : Math.max(0, inv.balance - Number(quantityApproved));
      await storage.updateVendorInventory(vReq.vendorId, { taken: newTaken, returned: newReturned, netEmpty: newNetEmpty, balance: newBalance });
    }
    res.json(vReq);
  });

  // ── VENDOR PAYMENTS ──
  app.post(api.vendors.submitPayment.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "vendor") return res.status(403).json({ message: "Forbidden" });
    const user = req.user as any;
    res.status(201).json(await storage.createPaymentRequest({ ...req.body, vendorId: user.id }));
  });
  app.get(api.vendors.listPayments.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const user = req.user as any;
    res.json(user.role === "admin" ? await storage.getAllPaymentRequests() : await storage.getVendorPaymentRequests(user.id));
  });
  app.patch(api.vendors.approvePayment.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.updatePaymentRequestStatus(Number(req.params.id), "approved"));
  });
  app.patch(api.vendors.rejectPayment.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.updatePaymentRequestStatus(Number(req.params.id), "rejected"));
  });

  // ── ADMIN ──
  app.get(api.admin.stats.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const [allBookings, vendors, customers] = await Promise.all([storage.getAllBookings(), storage.getAllVendors(), storage.getAllCustomers()]);
    res.json({
      totalOrders: allBookings.length,
      pendingOrders: allBookings.filter(b => b.status === "pending").length,
      deliveredOrders: allBookings.filter(b => b.status === "delivered").length,
      totalVendors: vendors.length,
      totalCustomers: customers.length,
    });
  });
  app.get(api.admin.customers.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.getAllCustomers());
  });

  // ── CYLINDER RATES ──
  app.get(api.rates.list.path, async (_req, res) => res.json(await storage.getCylinderRates()));
  app.post(api.rates.upsert.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { cylinderType, price } = req.body;
    res.json(await storage.upsertCylinderRate(cylinderType, Number(price)));
  });

  return httpServer;
}
