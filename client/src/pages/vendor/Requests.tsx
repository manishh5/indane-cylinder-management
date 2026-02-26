import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useVendorInventory, useVendorRequests, useCreateVendorRequest } from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { useState } from "react";
import { Archive, ArrowDownToLine, ArrowUpFromLine, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VendorRequests() {
  const { user } = useAuth();
  const { data: inventory } = useVendorInventory(user?.id);
  const { data: requests } = useVendorRequests();
  const createRequest = useCreateVendorRequest();
  const { toast } = useToast();
  
  const [demand, setDemand] = useState("");

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(demand);
    if (isNaN(qty) || qty <= 0) return;
    
    createRequest.mutate({ quantityDemanded: qty }, {
      onSuccess: () => {
        toast({ title: "Request sent to Admin" });
        setDemand("");
      }
    });
  };

  const myRequests = requests?.filter(r => r.vendorId === user?.id) || [];

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Inventory & Requests</h1>
            <p className="text-muted-foreground">Manage your stock and request new cylinders.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass shadow-lg border-t-4 border-t-blue-500 rounded-2xl">
              <CardContent className="p-6">
                <ArrowDownToLine className="w-8 h-8 text-blue-500 mb-2 opacity-80" />
                <p className="text-sm font-medium text-muted-foreground">Taken</p>
                <p className="text-3xl font-bold">{inventory?.taken || 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-green-500 rounded-2xl">
              <CardContent className="p-6">
                <ArrowUpFromLine className="w-8 h-8 text-green-500 mb-2 opacity-80" />
                <p className="text-sm font-medium text-muted-foreground">Returned</p>
                <p className="text-3xl font-bold">{inventory?.returned || 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-purple-500 rounded-2xl">
              <CardContent className="p-6">
                <Archive className="w-8 h-8 text-purple-500 mb-2 opacity-80" />
                <p className="text-sm font-medium text-muted-foreground">Net Empty</p>
                <p className="text-3xl font-bold">{inventory?.netEmpty || 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-primary rounded-2xl">
              <CardContent className="p-6">
                <RefreshCcw className="w-8 h-8 text-primary mb-2 opacity-80" />
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="text-3xl font-bold">{inventory?.balance || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 rounded-3xl glass shadow-xl border-white/50 h-fit">
              <CardHeader className="bg-primary/5 border-b rounded-t-3xl pb-6">
                <CardTitle>Request Cylinders</CardTitle>
                <CardDescription>Request a new batch from main admin.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quantity Needed</Label>
                    <Input 
                      type="number" 
                      value={demand} 
                      onChange={e => setDemand(e.target.value)}
                      className="h-12 rounded-xl bg-white/80" 
                      placeholder="e.g. 50"
                    />
                  </div>
                  <Button type="submit" disabled={createRequest.isPending || !demand} className="w-full h-12 rounded-xl">
                    {createRequest.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-3xl glass shadow-xl border-white/50 overflow-hidden">
              <CardHeader className="bg-white/50 border-b pb-4">
                <CardTitle>Request History</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Demanded</th>
                      <th className="px-6 py-4 font-medium">Approved Qty</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white/40">
                    {myRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-6 py-4">{format(new Date(req.createdAt!), 'PP')}</td>
                        <td className="px-6 py-4 font-semibold">{req.quantityDemanded}</td>
                        <td className="px-6 py-4 text-green-600 font-bold">{req.quantityApproved || '-'}</td>
                        <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      </tr>
                    ))}
                    {myRequests.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
