import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings, useUpdateBookingStatus, useAssignVendor } from "@/hooks/use-bookings";
import {
  useAdminStats, useVendorKycList, useApproveVendorKyc, useRejectVendorKyc,
  useVendorList, useVendorRequests, useApproveVendorRequest, useVendorInventory,
  useVendorPayments, useApprovePayment, useRejectPayment,
  useCustomerList, useCylinderRates, useUpsertRate
} from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  ShoppingCart, Clock, CheckCircle2, Users, Store, TrendingUp,
  FileCheck, ExternalLink, Package, Banknote, IndianRupee, RefreshCcw, ArrowDownToLine, ArrowUpFromLine, Archive, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CYLINDER_TYPES } from "@shared/schema";

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const Icon = icon;
  return (
    <Card className={`glass rounded-2xl shadow-lg border-t-4 ${color}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="opacity-60"><Icon className="w-10 h-10" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: bookings, isLoading: loadingBookings } = useBookings();
  const { data: kycs } = useVendorKycList();
  const { data: vendors } = useVendorList();
  const { data: requests } = useVendorRequests();
  const { data: payments } = useVendorPayments();
  const { data: customers } = useCustomerList();
  const { data: rates } = useCylinderRates();

  const updateStatus = useUpdateBookingStatus();
  const assignVendor = useAssignVendor();
  const approveKyc = useApproveVendorKyc();
  const rejectKyc = useRejectVendorKyc();
  const approveRequest = useApproveVendorRequest();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const upsertRate = useUpsertRate();
  const { toast } = useToast();

  const [kycDialog, setKycDialog] = useState<number | null>(null);
  const [kycUsername, setKycUsername] = useState("");
  const [kycPassword, setKycPassword] = useState("");
  const [reqDialog, setReqDialog] = useState<number | null>(null);
  const [approvedQty, setApprovedQty] = useState("");
  const [rateEdit, setRateEdit] = useState<Record<string, string>>({});

  const handleKycApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycDialog || !kycUsername || !kycPassword) return;
    approveKyc.mutate({ id: kycDialog, username: kycUsername, password: kycPassword }, {
      onSuccess: () => {
        toast({ title: "Vendor approved & credentials created" });
        setKycDialog(null); setKycUsername(""); setKycPassword("");
      }
    });
  };

  const handleReqApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDialog) return;
    approveRequest.mutate({ id: reqDialog, quantityApproved: Number(approvedQty) }, {
      onSuccess: () => {
        toast({ title: "Request approved & inventory updated" });
        setReqDialog(null); setApprovedQty("");
      }
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Admin Control Centre</h1>
            <p className="text-muted-foreground">M/S Sarvat Indane Sewa — Full system overview</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? "—"} color="border-t-primary" />
            <StatCard icon={Clock} label="Pending" value={stats?.pendingOrders ?? "—"} color="border-t-yellow-500" />
            <StatCard icon={CheckCircle2} label="Delivered" value={stats?.deliveredOrders ?? "—"} color="border-t-green-500" />
            <StatCard icon={Store} label="Vendors" value={stats?.totalVendors ?? "—"} color="border-t-blue-500" />
            <StatCard icon={Users} label="Customers" value={stats?.totalCustomers ?? "—"} color="border-t-purple-500" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="orders">
            <TabsList className="glass rounded-2xl p-1 h-auto flex-wrap gap-1">
              <TabsTrigger value="orders" data-testid="tab-orders" className="rounded-xl">Orders</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors" className="rounded-xl">Vendors</TabsTrigger>
              <TabsTrigger value="kyc" data-testid="tab-kyc" className="rounded-xl">KYC Applications</TabsTrigger>
              <TabsTrigger value="cyl-requests" data-testid="tab-cyl-requests" className="rounded-xl">Cylinder Requests</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments" className="rounded-xl">Payment Requests</TabsTrigger>
              <TabsTrigger value="customers" data-testid="tab-customers" className="rounded-xl">Customers</TabsTrigger>
              <TabsTrigger value="rates" data-testid="tab-rates" className="rounded-xl">Cylinder Rates</TabsTrigger>
            </TabsList>

            {/* ── ORDERS ── */}
            <TabsContent value="orders">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>All Bookings</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Track ID</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Cylinder</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Assign Vendor</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/70">
                      {loadingBookings ? (
                        <tr><td colSpan={9} className="text-center py-10 animate-pulse">Loading...</td></tr>
                      ) : bookings?.map((b) => (
                        <tr key={b.id} className="hover:bg-white/90 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{b.trackOrderId}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{b.customerName}</div>
                            <div className="text-xs text-muted-foreground">{b.phone}</div>
                            <div className="text-xs text-muted-foreground max-w-[120px] truncate">{b.address}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-medium">{b.cylinderType}</div>
                            <div className="text-xs text-muted-foreground capitalize">{b.bookingType?.replace("_", " ")}</div>
                          </td>
                          <td className="px-4 py-3 font-bold">{b.quantity}</td>
                          <td className="px-4 py-3 text-green-700 font-semibold">₹{b.amount || 0}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs">{format(new Date(b.createdAt!), "dd MMM yy")}</td>
                          <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-4 py-3">
                            <Select
                              value={b.assignedVendorId ? String(b.assignedVendorId) : ""}
                              onValueChange={(val) => assignVendor.mutate({ id: b.id, vendorId: Number(val) })}
                            >
                              <SelectTrigger className="w-[130px] rounded-xl h-8 text-xs bg-white" data-testid={`assign-vendor-${b.id}`}>
                                <SelectValue placeholder="Assign vendor" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {vendors?.map(v => (
                                  <SelectItem key={v.id} value={String(v.id)}>{v.name || v.username}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              disabled={updateStatus.isPending}
                              value={b.status}
                              onValueChange={(val) => updateStatus.mutate({ id: b.id, status: val })}
                            >
                              <SelectTrigger className="w-[140px] rounded-xl h-8 text-xs bg-white" data-testid={`status-select-${b.id}`}>
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
                        <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── VENDORS ── */}
            <TabsContent value="vendors">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>Active Vendors</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Vendor</th>
                        <th className="px-6 py-3 font-medium">Username</th>
                        <th className="px-6 py-3 font-medium">Phone</th>
                        <th className="px-6 py-3 font-medium">Address</th>
                        <th className="px-6 py-3 font-medium">Inventory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/60">
                      {vendors?.map(v => (
                        <VendorRow key={v.id} vendor={v} />
                      ))}
                      {vendors?.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No approved vendors yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── KYC ── */}
            <TabsContent value="kyc">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kycs?.map(kyc => (
                  <Card key={kyc.id} className="glass rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader className="bg-white/50 border-b pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{kyc.vendorName}</CardTitle>
                        <StatusBadge status={kyc.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{format(new Date(kyc.createdAt!), "dd MMM yyyy")}</p>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 space-y-3">
                      <div className="text-sm"><span className="text-muted-foreground">Phone: </span><span className="font-medium">{kyc.phone}</span></div>
                      {kyc.email && <div className="text-sm"><span className="text-muted-foreground">Email: </span><span className="font-medium">{kyc.email}</span></div>}
                      {kyc.area && <div className="text-sm"><span className="text-muted-foreground">Area: </span><span className="font-medium">{kyc.area}</span></div>}
                      <div className="text-sm"><span className="text-muted-foreground">Address: </span><span>{kyc.address}</span></div>
                      <div className="flex gap-4 pt-2">
                        <a href={kyc.aadharUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary flex items-center hover:underline">Aadhar <ExternalLink className="ml-1 w-3 h-3"/></a>
                        <a href={kyc.panUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary flex items-center hover:underline">PAN <ExternalLink className="ml-1 w-3 h-3"/></a>
                      </div>
                    </CardContent>
                    {kyc.status === "pending" && (
                      <CardFooter className="p-4 bg-white/40 border-t gap-3">
                        <Dialog open={kycDialog === kyc.id} onOpenChange={(open) => { setKycDialog(open ? kyc.id : null); }}>
                          <DialogTrigger asChild>
                            <Button className="flex-1 rounded-xl gap-2" data-testid={`approve-kyc-${kyc.id}`}><FileCheck className="w-4 h-4"/> Approve</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl glass">
                            <DialogHeader><DialogTitle>Create Vendor Account</DialogTitle></DialogHeader>
                            <form onSubmit={handleKycApprove} className="space-y-4 pt-4">
                              <div className="space-y-2"><Label>Username</Label><Input value={kycUsername} onChange={e=>setKycUsername(e.target.value)} required className="h-12 rounded-xl" placeholder="e.g. vendor01" /></div>
                              <div className="space-y-2"><Label>Password</Label><Input type="password" value={kycPassword} onChange={e=>setKycPassword(e.target.value)} required className="h-12 rounded-xl" /></div>
                              <Button type="submit" disabled={approveKyc.isPending} className="w-full h-12 rounded-xl">{approveKyc.isPending ? "Processing..." : "Approve & Create Account"}</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="rounded-xl text-destructive border-destructive/30" onClick={() => rejectKyc.mutate(kyc.id, { onSuccess: () => toast({ title: "KYC Rejected" }) })} data-testid={`reject-kyc-${kyc.id}`}><X className="w-4 h-4"/></Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
                {kycs?.length === 0 && (
                  <div className="col-span-3 text-center py-20 text-muted-foreground bg-secondary/20 rounded-3xl border-dashed border-2">No KYC applications yet.</div>
                )}
              </div>
            </TabsContent>

            {/* ── CYLINDER REQUESTS ── */}
            <TabsContent value="cyl-requests">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>Cylinder Requests from Vendors</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Vendor ID</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Req. Type</th>
                        <th className="px-6 py-3 font-medium">Demanded</th>
                        <th className="px-6 py-3 font-medium">Notes</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/60">
                      {requests?.map(r => (
                        <tr key={r.id} className="hover:bg-white/80 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs">V-{r.vendorId}</td>
                          <td className="px-6 py-3 text-xs">{r.cylinderType}</td>
                          <td className="px-6 py-3">
                            <Badge variant={r.requestType === "take" ? "default" : "secondary"} className="capitalize">{r.requestType}</Badge>
                          </td>
                          <td className="px-6 py-3 font-bold">{r.quantityDemanded}</td>
                          <td className="px-6 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{r.notes || "—"}</td>
                          <td className="px-6 py-3 text-xs">{format(new Date(r.createdAt!), "dd MMM yy")}</td>
                          <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-6 py-3">
                            {r.status === "pending" && (
                              <Dialog open={reqDialog === r.id} onOpenChange={(open) => setReqDialog(open ? r.id : null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="rounded-xl" data-testid={`approve-req-${r.id}`}>Approve</Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl glass">
                                  <DialogHeader><DialogTitle>Approve Cylinder Request</DialogTitle></DialogHeader>
                                  <form onSubmit={handleReqApprove} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                      <Label>Approve Quantity (max {r.quantityDemanded})</Label>
                                      <Input type="number" max={r.quantityDemanded} value={approvedQty} onChange={e=>setApprovedQty(e.target.value)} required className="h-12 rounded-xl" placeholder="Enter quantity" />
                                    </div>
                                    <Button type="submit" disabled={approveRequest.isPending} className="w-full h-12 rounded-xl">{approveRequest.isPending ? "Approving..." : "Confirm Approval"}</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                          </td>
                        </tr>
                      ))}
                      {requests?.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No cylinder requests.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── PAYMENTS ── */}
            <TabsContent value="payments">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>Vendor Payment Requests</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Vendor</th>
                        <th className="px-6 py-3 font-medium">Amount</th>
                        <th className="px-6 py-3 font-medium">Method</th>
                        <th className="px-6 py-3 font-medium">Reference</th>
                        <th className="px-6 py-3 font-medium">Notes</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/60">
                      {payments?.map(p => (
                        <tr key={p.id} className="hover:bg-white/80 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs">V-{p.vendorId}</td>
                          <td className="px-6 py-3 font-bold text-green-700">₹{p.amount}</td>
                          <td className="px-6 py-3 capitalize">{p.paymentMethod?.replace("_", " ")}</td>
                          <td className="px-6 py-3 text-xs font-mono">{p.referenceNumber || "—"}</td>
                          <td className="px-6 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{p.notes || "—"}</td>
                          <td className="px-6 py-3 text-xs">{format(new Date(p.createdAt!), "dd MMM yy")}</td>
                          <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-6 py-3">
                            {p.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" className="rounded-xl" onClick={() => approvePayment.mutate(p.id, { onSuccess: () => toast({ title: "Payment Approved" }) })} data-testid={`approve-payment-${p.id}`}>Approve</Button>
                                <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => rejectPayment.mutate(p.id, { onSuccess: () => toast({ title: "Payment Rejected" }) })} data-testid={`reject-payment-${p.id}`}>Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {payments?.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No payment requests.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── CUSTOMERS ── */}
            <TabsContent value="customers">
              <Card className="rounded-3xl shadow-xl glass border-white/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>Registered Customers</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Phone</th>
                        <th className="px-6 py-3 font-medium">Address</th>
                        <th className="px-6 py-3 font-medium">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white/60">
                      {customers?.map(c => (
                        <tr key={c.id} className="hover:bg-white/80">
                          <td className="px-6 py-3 font-semibold">{c.name}</td>
                          <td className="px-6 py-3 font-mono">+91 {c.phone}</td>
                          <td className="px-6 py-3 text-muted-foreground max-w-[200px] truncate">{c.address || "—"}</td>
                          <td className="px-6 py-3">{bookings?.filter(b => b.customerId === c.id).length ?? 0}</td>
                        </tr>
                      ))}
                      {customers?.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No registered customers yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* ── CYLINDER RATES ── */}
            <TabsContent value="rates">
              <Card className="rounded-3xl shadow-xl glass border-white/50">
                <CardHeader className="bg-primary/5 border-b"><CardTitle>Manage Cylinder Rates</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CYLINDER_TYPES.map(type => {
                      const current = rates?.find(r => r.cylinderType === type);
                      return (
                        <Card key={type} className="rounded-2xl glass border border-white/60 p-4">
                          <p className="font-semibold text-sm mb-3">{type}</p>
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2 text-muted-foreground text-sm">₹</span>
                              <Input
                                type="number"
                                className="h-10 rounded-xl pl-7 bg-white"
                                defaultValue={current?.price ?? ""}
                                value={rateEdit[type] ?? current?.price ?? ""}
                                onChange={e => setRateEdit(prev => ({ ...prev, [type]: e.target.value }))}
                                placeholder="Set price"
                                data-testid={`rate-input-${type}`}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="rounded-xl h-10"
                              disabled={upsertRate.isPending}
                              onClick={() => {
                                const val = rateEdit[type] || String(current?.price || "");
                                if (!val) return;
                                upsertRate.mutate({ cylinderType: type, price: Number(val) }, {
                                  onSuccess: () => toast({ title: `Rate updated for ${type}` })
                                });
                              }}
                              data-testid={`rate-save-${type}`}
                            >Save</Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function VendorRow({ vendor }: { vendor: any }) {
  const { data: inv } = useVendorInventory(vendor.id);
  return (
    <tr className="hover:bg-white/80">
      <td className="px-6 py-3 font-semibold">{vendor.name}</td>
      <td className="px-6 py-3 font-mono text-xs">{vendor.username}</td>
      <td className="px-6 py-3">+91 {vendor.phone}</td>
      <td className="px-6 py-3 text-muted-foreground max-w-[160px] truncate">{vendor.address || "—"}</td>
      <td className="px-6 py-3">
        {inv ? (
          <div className="flex gap-3 text-xs">
            <span className="text-blue-600 font-medium">↓{inv.taken}</span>
            <span className="text-green-600 font-medium">↑{inv.returned}</span>
            <span className="text-purple-600 font-medium">∅{inv.netEmpty}</span>
            <span className="text-primary font-medium">Bal:{inv.balance}</span>
          </div>
        ) : <span className="text-muted-foreground text-xs">Loading...</span>}
      </td>
    </tr>
  );
}
