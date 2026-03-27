import { z } from "zod";
import {
  insertBookingSchema, insertVendorKycSchema, insertVendorRequestSchema, insertPaymentRequestSchema,
  users, bookings, vendorKycs, vendorInventories, vendorRequests, vendorPaymentRequests, cylinderRates
} from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: { method: "POST" as const, path: "/auth/login" as const, input: z.object({ username: z.string(), password: z.string() }), responses: { 200: z.custom<typeof users.$inferSelect>() } },
    logout: { method: "POST" as const, path: "/auth/logout" as const, responses: { 200: z.object({ message: z.string() }) } },
    me: { method: "GET" as const, path: "/auth/me" as const, responses: { 200: z.custom<typeof users.$inferSelect>() } },
    registerCustomer: { method: "POST" as const, path: "/auth/register-customer" as const, input: z.object({ name: z.string(), phone: z.string(), password: z.string(), address: z.string() }), responses: { 201: z.custom<typeof users.$inferSelect>() } },
  },
  bookings: {
    create: { method: "POST" as const, path: "/api/bookings" as const, input: insertBookingSchema, responses: { 201: z.custom<typeof bookings.$inferSelect>() } },
    list: { method: "GET" as const, path: "/api/bookings" as const, responses: { 200: z.array(z.custom<typeof bookings.$inferSelect>()) } },
    get: { method: "GET" as const, path: "/api/bookings/track/:trackOrderId" as const, responses: { 200: z.custom<typeof bookings.$inferSelect>() } },
    updateStatus: { method: "PATCH" as const, path: "/api/bookings/:id/status" as const, input: z.object({ status: z.string() }), responses: { 200: z.custom<typeof bookings.$inferSelect>() } },
    assignVendor: { method: "PATCH" as const, path: "/api/bookings/:id/assign-vendor" as const, input: z.object({ vendorId: z.number() }), responses: { 200: z.custom<typeof bookings.$inferSelect>() } },
  },
  vendors: {
    submitKyc: { method: "POST" as const, path: "/api/vendors/kyc" as const, input: insertVendorKycSchema, responses: { 201: z.custom<typeof vendorKycs.$inferSelect>() } },
    listKyc: { method: "GET" as const, path: "/api/vendors/kyc" as const, responses: { 200: z.array(z.custom<typeof vendorKycs.$inferSelect>()) } },
    approveKyc: { method: "POST" as const, path: "/api/vendors/kyc/:id/approve" as const, input: z.object({ username: z.string(), password: z.string() }), responses: { 200: z.custom<typeof vendorKycs.$inferSelect>() } },
    rejectKyc: { method: "POST" as const, path: "/api/vendors/kyc/:id/reject" as const, responses: { 200: z.custom<typeof vendorKycs.$inferSelect>() } },
    list: { method: "GET" as const, path: "/api/vendors/list" as const, responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) } },
    inventory: { method: "GET" as const, path: "/api/vendors/:id/inventory" as const, responses: { 200: z.custom<typeof vendorInventories.$inferSelect>() } },
    createRequest: { method: "POST" as const, path: "/api/vendors/requests" as const, input: z.object({ quantityDemanded: z.number(), cylinderType: z.string(), requestType: z.string(), notes: z.string().optional() }), responses: { 201: z.custom<typeof vendorRequests.$inferSelect>() } },
    listRequests: { method: "GET" as const, path: "/api/vendors/requests" as const, responses: { 200: z.array(z.custom<typeof vendorRequests.$inferSelect>()) } },
    approveRequest: { method: "PATCH" as const, path: "/api/vendors/requests/:id/approve" as const, input: z.object({ quantityApproved: z.number() }), responses: { 200: z.custom<typeof vendorRequests.$inferSelect>() } },
    submitPayment: { method: "POST" as const, path: "/api/vendors/payments" as const, input: insertPaymentRequestSchema, responses: { 201: z.custom<typeof vendorPaymentRequests.$inferSelect>() } },
    listPayments: { method: "GET" as const, path: "/api/vendors/payments" as const, responses: { 200: z.array(z.custom<typeof vendorPaymentRequests.$inferSelect>()) } },
    approvePayment: { method: "PATCH" as const, path: "/api/vendors/payments/:id/approve" as const, responses: { 200: z.custom<typeof vendorPaymentRequests.$inferSelect>() } },
    rejectPayment: { method: "PATCH" as const, path: "/api/vendors/payments/:id/reject" as const, responses: { 200: z.custom<typeof vendorPaymentRequests.$inferSelect>() } },
  },
  admin: {
    stats: { method: "GET" as const, path: "/api/admin/stats" as const, responses: { 200: z.object({ totalOrders: z.number(), pendingOrders: z.number(), deliveredOrders: z.number(), totalVendors: z.number(), totalCustomers: z.number() }) } },
    customers: { method: "GET" as const, path: "/api/admin/customers" as const, responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) } },
  },
  rates: {
    list: { method: "GET" as const, path: "/api/rates" as const, responses: { 200: z.array(z.custom<typeof cylinderRates.$inferSelect>()) } },
    upsert: { method: "POST" as const, path: "/api/rates" as const, input: z.object({ cylinderType: z.string(), price: z.number() }), responses: { 200: z.custom<typeof cylinderRates.$inferSelect>() } },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
