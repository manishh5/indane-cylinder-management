import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 
    }),
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return done(null, false, { message: "Invalid credentials" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Ensure Admin exists
  try {
    const admin = await storage.getUserByUsername("ADMIN");
    if (!admin) {
      await storage.createUser({
        username: "ADMIN",
        password: "newAdmin",
        role: "admin",
        name: "Admin"
      });
    }
  } catch (err) {
    console.error("Error setting up admin user", err);
  }

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  
  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  app.post(api.auth.registerCustomer.path, async (req, res) => {
    try {
      const input = api.auth.registerCustomer.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.phone);
      if (existing) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
      const user = await storage.createUser({
        username: input.phone,
        password: input.password,
        role: "customer",
        name: input.name,
        phone: input.phone,
        address: input.address
      });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.status(201).json(user);
      });
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking({
        ...input,
        customerId: req.isAuthenticated() ? (req.user as any).id : null
      });
      res.status(201).json(booking);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    if (user.role === 'admin' || user.role === 'vendor') {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } else {
      const bookings = await storage.getCustomorBookings(user.id);
      res.json(bookings);
    }
  });

  app.get(api.bookings.get.path, async (req, res) => {
    const booking = await storage.getBookingByTrackId(req.params.trackOrderId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { status } = req.body;
    const booking = await storage.updateBookingStatus(Number(req.params.id), status);
    res.json(booking);
  });

  app.post(api.vendors.submitKyc.path, async (req, res) => {
    try {
      const input = api.vendors.submitKyc.input.parse(req.body);
      const kyc = await storage.createVendorKyc(input);
      res.status(201).json(kyc);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0].message });
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.vendors.listKyc.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Not authorized" });
    const kycs = await storage.getAllVendorKycs();
    res.json(kycs);
  });

  app.post(api.vendors.approveKyc.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Not authorized" });
    const kycId = Number(req.params.id);
    const { username, password } = req.body;
    const kyc = await storage.getVendorKyc(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    
    const user = await storage.createUser({
      username,
      password,
      role: 'vendor',
      name: kyc.vendorName,
      phone: kyc.phone,
      address: kyc.address,
      kycApproved: true
    });
    
    await storage.updateVendorKycStatus(kycId, 'approved');
    await storage.createVendorInventory(user.id);
    
    res.json({ ...kyc, status: 'approved' });
  });

  app.get(api.vendors.inventory.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const vendorId = Number(req.params.id) === 0 ? (req.user as any).id : Number(req.params.id);
    const inv = await storage.getVendorInventory(vendorId);
    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json(inv);
  });

  app.post(api.vendors.createRequest.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'vendor') return res.status(401).json({ message: "Not authorized" });
    const user = req.user as any;
    const { quantityDemanded } = req.body;
    const reqData = await storage.createVendorRequest({
      vendorId: user.id,
      quantityDemanded: Number(quantityDemanded),
    });
    res.status(201).json(reqData);
  });

  app.get(api.vendors.listRequests.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" });
    const user = req.user as any;
    if (user.role === 'admin') {
      const reqs = await storage.getAllVendorRequests();
      res.json(reqs);
    } else if (user.role === 'vendor') {
      const reqs = await storage.getVendorRequests(user.id);
      res.json(reqs);
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  });

  app.patch(api.vendors.approveRequest.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Not authorized" });
    const reqId = Number(req.params.id);
    const { quantityApproved } = req.body;
    const vReq = await storage.updateVendorRequest(reqId, Number(quantityApproved), 'approved');
    
    const inv = await storage.getVendorInventory(vReq.vendorId);
    if (inv) {
      await storage.updateVendorInventory(vReq.vendorId, {
        taken: inv.taken + Number(quantityApproved),
        balance: inv.balance + Number(quantityApproved),
      });
    }
    res.json(vReq);
  });

  return httpServer;
}
