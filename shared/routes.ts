import { z } from 'zod';
import { 
  insertUserSchema, insertBookingSchema, insertVendorKycSchema, insertVendorRequestSchema,
  users, bookings, vendorKycs, vendorInventories, vendorRequests 
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    registerCustomer: {
      method: 'POST' as const,
      path: '/api/auth/register-customer' as const,
      input: z.object({ name: z.string(), phone: z.string(), password: z.string(), address: z.string() }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/track/:trackOrderId' as const,
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  vendors: {
    submitKyc: {
      method: 'POST' as const,
      path: '/api/vendors/kyc' as const,
      input: insertVendorKycSchema,
      responses: {
        201: z.custom<typeof vendorKycs.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    listKyc: {
      method: 'GET' as const,
      path: '/api/vendors/kyc' as const,
      responses: {
        200: z.array(z.custom<typeof vendorKycs.$inferSelect>()),
      }
    },
    approveKyc: {
      method: 'POST' as const,
      path: '/api/vendors/kyc/:id/approve' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof vendorKycs.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    inventory: {
      method: 'GET' as const,
      path: '/api/vendors/:id/inventory' as const,
      responses: {
        200: z.custom<typeof vendorInventories.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    createRequest: {
      method: 'POST' as const,
      path: '/api/vendors/requests' as const,
      input: z.object({ quantityDemanded: z.number() }),
      responses: {
        201: z.custom<typeof vendorRequests.$inferSelect>(),
      }
    },
    listRequests: {
      method: 'GET' as const,
      path: '/api/vendors/requests' as const,
      responses: {
        200: z.array(z.custom<typeof vendorRequests.$inferSelect>()),
      }
    },
    approveRequest: {
      method: 'PATCH' as const,
      path: '/api/vendors/requests/:id/approve' as const,
      input: z.object({ quantityApproved: z.number() }),
      responses: {
        200: z.custom<typeof vendorRequests.$inferSelect>(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
