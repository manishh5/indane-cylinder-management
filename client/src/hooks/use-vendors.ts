import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useVendorKycList() {
  return useQuery({
    queryKey: [api.vendors.listKyc.path],
    queryFn: async () => {
      const res = await fetch(api.vendors.listKyc.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KYCs");
      return api.vendors.listKyc.responses[200].parse(await res.json());
    },
  });
}

const BASE_URL = "https://indane-cylinder-management.onrender.com";

export function useSubmitVendorKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.vendors.submitKyc.input>) => {
      
      const res = await fetch(`${BASE_URL}${api.vendors.submitKyc.path}`, {
        method: api.vendors.submitKyc.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit KYC");
      }
      return api.vendors.submitKyc.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listKyc.path] });
    },
  });
}

export function useApproveVendorKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.vendors.approveKyc.input>) => {
      const url = buildUrl(api.vendors.approveKyc.path, { id });
      const res = await fetch(url, {
        method: api.vendors.approveKyc.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve KYC");
      return api.vendors.approveKyc.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listKyc.path] });
      queryClient.invalidateQueries({ queryKey: [api.vendors.list.path] });
    },
  });
}

export function useRejectVendorKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vendors.rejectKyc.path, { id });
      const res = await fetch(url, { method: api.vendors.rejectKyc.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to reject KYC");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listKyc.path] });
    },
  });
}

export function useVendorList() {
  return useQuery({
    queryKey: [api.vendors.list.path],
    queryFn: async () => {
      const res = await fetch(api.vendors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return api.vendors.list.responses[200].parse(await res.json());
    },
  });
}

export function useVendorInventory(vendorId?: number) {
  return useQuery({
    queryKey: [api.vendors.inventory.path, vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const url = buildUrl(api.vendors.inventory.path, { id: vendorId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.vendors.inventory.responses[200].parse(await res.json());
    },
    enabled: !!vendorId,
  });
}

export function useVendorRequests() {
  return useQuery({
    queryKey: [api.vendors.listRequests.path],
    queryFn: async () => {
      const res = await fetch(api.vendors.listRequests.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch requests");
      return api.vendors.listRequests.responses[200].parse(await res.json());
    },
  });
}

export function useCreateVendorRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.vendors.createRequest.input>) => {
      const res = await fetch(api.vendors.createRequest.path, {
        method: api.vendors.createRequest.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create request");
      return api.vendors.createRequest.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listRequests.path] });
    },
  });
}

export function useApproveVendorRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.vendors.approveRequest.input>) => {
      const url = buildUrl(api.vendors.approveRequest.path, { id });
      const res = await fetch(url, {
        method: api.vendors.approveRequest.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve request");
      return api.vendors.approveRequest.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listRequests.path] });
      queryClient.invalidateQueries({ queryKey: [api.vendors.inventory.path] });
    },
  });
}

export function useVendorPayments() {
  return useQuery({
    queryKey: [api.vendors.listPayments.path],
    queryFn: async () => {
      const res = await fetch(api.vendors.listPayments.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return api.vendors.listPayments.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string; vendorId?: number }) => {
      const res = await fetch(`${BASE_URL}${api.vendors.submitKyc.path}`, {
        method: api.vendors.submitPayment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit payment");
      return api.vendors.submitPayment.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listPayments.path] });
    },
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vendors.approvePayment.path, { id });
      const res = await fetch(url, { method: api.vendors.approvePayment.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to approve payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listPayments.path] });
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vendors.rejectPayment.path, { id });
      const res = await fetch(url, { method: api.vendors.rejectPayment.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to reject payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.listPayments.path] });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}

export function useCustomerList() {
  return useQuery({
    queryKey: [api.admin.customers.path],
    queryFn: async () => {
      const res = await fetch(api.admin.customers.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return api.admin.customers.responses[200].parse(await res.json());
    },
  });
}

export function useCylinderRates() {
  return useQuery({
    queryKey: [api.rates.list.path],
    queryFn: async () => {
      const res = await fetch(api.rates.list.path);
      if (!res.ok) throw new Error("Failed to fetch rates");
      return api.rates.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpsertRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cylinderType: string; price: number }) => {
      const res = await fetch(api.rates.upsert.path, {
        method: api.rates.upsert.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update rate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rates.list.path] });
    },
  });
}
