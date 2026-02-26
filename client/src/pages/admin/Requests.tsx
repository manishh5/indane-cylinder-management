import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useVendorRequests, useApproveVendorRequest } from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { useState } from "react";

export default function AdminRequests() {
  const { data: requests } = useVendorRequests();
  const approveReq = useApproveVendorRequest();
  
  // Local state for editing demand per request row
  const [approvals, setApprovals] = useState<Record<number, string>>({});

  const handleApprove = (id: number, demanded: number) => {
    const qtyStr = approvals[id];
    const qty = qtyStr ? parseInt(qtyStr) : demanded; // Default to demanded if untouched
    
    approveReq.mutate({ id, quantityApproved: qty });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Vendor Supply Requests</h1>
            <p className="text-muted-foreground">Manage cylinder allocations to vendors.</p>
          </div>

          <Card className="rounded-3xl shadow-xl overflow-hidden glass border-white/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Vendor ID</th>
                    <th className="px-6 py-4 font-medium text-center">Requested Qty</th>
                    <th className="px-6 py-4 font-medium text-center">Approved Qty</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white/40">
                  {requests?.map((req) => (
                    <tr key={req.id} className="hover:bg-white/60">
                      <td className="px-6 py-4">{format(new Date(req.createdAt!), 'PP')}</td>
                      <td className="px-6 py-4 font-mono font-bold">VND-{req.vendorId}</td>
                      <td className="px-6 py-4 text-center text-lg font-bold">{req.quantityDemanded}</td>
                      <td className="px-6 py-4 text-center">
                        {req.status === 'pending' ? (
                          <Input 
                            type="number" 
                            className="w-24 mx-auto text-center font-bold bg-white"
                            defaultValue={req.quantityDemanded}
                            onChange={(e) => setApprovals({...approvals, [req.id]: e.target.value})}
                          />
                        ) : (
                          <span className="text-lg font-bold text-green-600">{req.quantityApproved}</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="rounded-lg shadow-md"
                            disabled={approveReq.isPending}
                            onClick={() => handleApprove(req.id, req.quantityDemanded)}
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests?.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
