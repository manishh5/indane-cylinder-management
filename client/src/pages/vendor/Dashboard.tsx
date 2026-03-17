import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { useVendorInventory, useVendorRequests, useCreateVendorRequest, useVendorPayments, useSubmitPayment } from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Archive, RefreshCcw, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CYLINDER_TYPES } from "@shared/schema";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const { data: inventory } = useVendorInventory(user?.id);
  const { data: myRequests } = useVendorRequests();
  const createRequest = useCreateVendorRequest();
  const { data: payments } = useVendorPayments();
  const submitPayment = useSubmitPayment();
  const { toast } = useToast();

  const [reqForm, setReqForm] = useState({ cylinderType: "14.2kg Domestic", requestType: "take", quantityDemanded: "", notes: "" });
  const [payForm, setPayForm] = useState({ amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(reqForm.quantityDemanded);
    if (isNaN(qty) || qty <= 0) return;
    createRequest.mutate({ ...reqForm, quantityDemanded: qty }, {
      onSuccess: () => {
        toast({ title: "Request sent to Admin" });
        setReqForm({ cylinderType: "14.2kg Domestic", requestType: "take", quantityDemanded: "", notes: "" });
      }
    });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.amount) return;
    submitPayment.mutate({ amount: Number(payForm.amount), paymentMethod: payForm.paymentMethod, referenceNumber: payForm.referenceNumber, notes: payForm.notes }, {
      onSuccess: () => {
        toast({ title: "Payment request submitted" });
        setPayForm({ amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
      }
    });
  };

  const pending = bookings?.filter(b => b.status === "pending").length || 0;
  const delivered = bookings?.filter(b => b.status === "delivered").length || 0;
  const total = bookings?.length || 0;

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || user?.username}</p>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass shadow-lg border-t-4 border-t-blue-500 rounded-2xl">
              <CardContent className="p-5">
                <ArrowDownToLine className="w-7 h-7 text-blue-500 mb-2 opacity-80" />
                <p className="text-xs font-medium text-muted-foreground">Cylinders Taken</p>
                <p className="text-3xl font-bold">{inventory?.taken ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-green-500 rounded-2xl">
              <CardContent className="p-5">
                <ArrowUpFromLine className="w-7 h-7 text-green-500 mb-2 opacity-80" />
                <p className="text-xs font-medium text-muted-foreground">Cylinders Returned</p>
                <p className="text-3xl font-bold">{inventory?.returned ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-purple-500 rounded-2xl">
              <CardContent className="p-5">
                <Archive className="w-7 h-7 text-purple-500 mb-2 opacity-80" />
                <p className="text-xs font-medium text-muted-foreground">Net Empty</p>
                <p className="text-3xl font-bold">{inventory?.netEmpty ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="glass shadow-lg border-t-4 border-t-primary rounded-2xl">
              <CardContent className="p-5">
                <RefreshCcw className="w-7 h-7 text-primary mb-2 opacity-80" />
                <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold">{inventory?.balance ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="glass rounded-2xl p-1">
              <TabsTrigger value="orders" className="rounded-xl">Orders ({total})</TabsTrigger>
              <TabsTrigger value="requests" className="rounded-xl">Cylinder Requests</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-xl">Payments</TabsTrigger>
            </TabsList>

            {/* ── ORDERS ── */}
            <TabsContent value="orders">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                  <div className="flex items-center gap-4">
                    <CardTitle>Customer Orders</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{pending} Pending</Badge>
                      <Badge className="bg-green-100 text-green-800">{delivered} Delivered</Badge>
                    </div>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">Track ID</th>
                        <th className="px-5 py-3 font-medium">Customer</th>
                        <th className="px-5 py-3 font-medium">Cylinder</th>
                        <th className="px-5 py-3 font-medium">Address</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium text-right">Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/50">
                      {isLoading ? (
                        <tr><td colSpan={7} className="text-center py-10 animate-pulse">Loading orders...</td></tr>
                      ) : bookings?.map(b => (
                        <tr key={b.id} className="hover:bg-white/80 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs">{b.trackOrderId.substring(0, 8)}</td>
                          <td className="px-5 py-3">
                            <div className="font-semibold">{b.customerName}</div>
                            <div className="text-xs text-muted-foreground">{b.phone}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-xs font-medium">{b.cylinderType}</div>
                            <div className="text-xs text-muted-foreground">Qty: {b.quantity}</div>
                          </td>
                          <td className="px-5 py-3 max-w-[160px] truncate text-muted-foreground text-xs">{b.address}</td>
                          <td className="px-5 py-3 text-xs whitespace-nowrap">{format(new Date(b.createdAt!), "dd MMM yy")}</td>
                          <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-5 py-3 text-right">
                            <Select
                              disabled={updateStatus.isPending}
                              value={b.status}
                              onValueChange={val => updateStatus.mutate({ id: b.id, status: val })}
                            >
                              <SelectTrigger className="w-[150px] rounded-xl h-8 text-xs bg-white ml-auto" data-testid={`vendor-status-${b.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                      {bookings?.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No orders assigned yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── CYLINDER REQUESTS ── */}
            <TabsContent value="requests">
              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 rounded-3xl glass shadow-xl border-white/50">
                  <CardHeader className="bg-primary/5 border-b rounded-t-3xl pb-5">
                    <CardTitle>Request Cylinders</CardTitle>
                    <CardDescription>Send request to main admin.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Cylinder Type</Label>
                        <Select value={reqForm.cylinderType} onValueChange={v => setReqForm(p => ({ ...p, cylinderType: v }))}>
                          <SelectTrigger className="h-11 rounded-xl bg-white" data-testid="req-cylinder-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {CYLINDER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Request Type</Label>
                        <Select value={reqForm.requestType} onValueChange={v => setReqForm(p => ({ ...p, requestType: v }))}>
                          <SelectTrigger className="h-11 rounded-xl bg-white" data-testid="req-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="take">Take Cylinders</SelectItem>
                            <SelectItem value="return">Return Cylinders</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" value={reqForm.quantityDemanded} onChange={e => setReqForm(p => ({ ...p, quantityDemanded: e.target.value }))} className="h-11 rounded-xl bg-white" placeholder="e.g. 50" data-testid="req-quantity" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input value={reqForm.notes} onChange={e => setReqForm(p => ({ ...p, notes: e.target.value }))} className="h-11 rounded-xl bg-white" placeholder="Any remarks..." data-testid="req-notes" />
                      </div>
                      <Button type="submit" disabled={createRequest.isPending || !reqForm.quantityDemanded} className="w-full h-12 rounded-xl" data-testid="req-submit">
                        {createRequest.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 rounded-3xl glass shadow-xl border-white/50 overflow-hidden">
                  <CardHeader className="bg-white/50 border-b"><CardTitle>Request History</CardTitle></CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3 font-medium">Date</th>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Cylinder</th>
                          <th className="px-5 py-3 font-medium">Demanded</th>
                          <th className="px-5 py-3 font-medium">Approved</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white/40">
                        {myRequests?.map(r => (
                          <tr key={r.id}>
                            <td className="px-5 py-3 text-xs">{format(new Date(r.createdAt!), "dd MMM yy")}</td>
                            <td className="px-5 py-3"><Badge variant={r.requestType === "take" ? "default" : "secondary"} className="capitalize text-xs">{r.requestType}</Badge></td>
                            <td className="px-5 py-3 text-xs">{r.cylinderType}</td>
                            <td className="px-5 py-3 font-semibold">{r.quantityDemanded}</td>
                            <td className="px-5 py-3 text-green-600 font-bold">{r.quantityApproved || "—"}</td>
                            <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                        {!myRequests?.length && (
                          <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No requests found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* ── PAYMENTS ── */}
            <TabsContent value="payments">
              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 rounded-3xl glass shadow-xl border-white/50">
                  <CardHeader className="bg-primary/5 border-b rounded-t-3xl pb-5">
                    <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Submit Payment</CardTitle>
                    <CardDescription>Submit outstanding balance payment.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} className="h-11 rounded-xl bg-white" placeholder="Enter amount" required data-testid="pay-amount" />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={payForm.paymentMethod} onValueChange={v => setPayForm(p => ({ ...p, paymentMethod: v }))}>
                          <SelectTrigger className="h-11 rounded-xl bg-white" data-testid="pay-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {payForm.paymentMethod !== "cash" && (
                        <div className="space-y-2">
                          <Label>Reference Number / UTR</Label>
                          <Input value={payForm.referenceNumber} onChange={e => setPayForm(p => ({ ...p, referenceNumber: e.target.value }))} className="h-11 rounded-xl bg-white" placeholder="Transaction reference" data-testid="pay-ref" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} className="h-11 rounded-xl bg-white" placeholder="Additional details" data-testid="pay-notes" />
                      </div>
                      <Button type="submit" disabled={submitPayment.isPending || !payForm.amount} className="w-full h-12 rounded-xl" data-testid="pay-submit">
                        {submitPayment.isPending ? "Submitting..." : "Submit Payment Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 rounded-3xl glass shadow-xl border-white/50 overflow-hidden">
                  <CardHeader className="bg-white/50 border-b"><CardTitle>Payment History</CardTitle></CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3 font-medium">Date</th>
                          <th className="px-5 py-3 font-medium">Amount</th>
                          <th className="px-5 py-3 font-medium">Method</th>
                          <th className="px-5 py-3 font-medium">Reference</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white/40">
                        {payments?.map(p => (
                          <tr key={p.id}>
                            <td className="px-5 py-3 text-xs">{format(new Date(p.createdAt!), "dd MMM yy")}</td>
                            <td className="px-5 py-3 font-bold text-green-700">₹{p.amount}</td>
                            <td className="px-5 py-3 capitalize">{p.paymentMethod?.replace("_", " ")}</td>
                            <td className="px-5 py-3 font-mono text-xs">{p.referenceNumber || "—"}</td>
                            <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                        {!payments?.length && (
                          <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payments submitted yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
