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

export function useSubmitVendorKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.vendors.submitKyc.input>) => {
      const res = await fetch(api.vendors.submitKyc.path, {
        method: api.vendors.submitKyc.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit KYC");
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
