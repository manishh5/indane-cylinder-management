import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { PackageOpen, ExternalLink, ShoppingCart, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const { data: bookings, isLoading } = useBookings();

  const total = bookings?.length ?? 0;
  const pending = bookings?.filter(b => b.status === "pending" || b.status === "processing" || b.status === "out_for_delivery").length ?? 0;
  const delivered = bookings?.filter(b => b.status === "delivered").length ?? 0;
  const cancelled = bookings?.filter(b => b.status === "cancelled").length ?? 0;

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">My Orders</h1>
              <p className="text-muted-foreground">Track and manage your cylinder bookings.</p>
            </div>
            <Button asChild className="rounded-xl shadow-md" data-testid="button-new-booking">
              <Link href="/customer/book">+ Book New Cylinder</Link>
            </Button>
          </div>

          {/* Stats */}
          {!isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass rounded-2xl shadow-md border-t-4 border-t-primary">
                <CardContent className="p-5">
                  <ShoppingCart className="w-6 h-6 text-primary mb-2 opacity-70" />
                  <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                  <p className="text-3xl font-bold">{total}</p>
                </CardContent>
              </Card>
              <Card className="glass rounded-2xl shadow-md border-t-4 border-t-yellow-500">
                <CardContent className="p-5">
                  <Clock className="w-6 h-6 text-yellow-500 mb-2 opacity-70" />
                  <p className="text-xs text-muted-foreground font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{pending}</p>
                </CardContent>
              </Card>
              <Card className="glass rounded-2xl shadow-md border-t-4 border-t-green-500">
                <CardContent className="p-5">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mb-2 opacity-70" />
                  <p className="text-xs text-muted-foreground font-medium">Delivered</p>
                  <p className="text-3xl font-bold">{delivered}</p>
                </CardContent>
              </Card>
              <Card className="glass rounded-2xl shadow-md border-t-4 border-t-red-400">
                <CardContent className="p-5">
                  <XCircle className="w-6 h-6 text-red-400 mb-2 opacity-70" />
                  <p className="text-xs text-muted-foreground font-medium">Cancelled</p>
                  <p className="text-3xl font-bold">{cancelled}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Card key={i} className="animate-pulse h-48 rounded-2xl bg-muted/50 border-0" />)}
            </div>
          ) : !bookings?.length ? (
            <Card className="text-center py-20 rounded-3xl shadow-none border-dashed bg-secondary/20">
              <CardContent className="flex flex-col items-center justify-center">
                <PackageOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">You haven't made any orders.</p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/customer/book">Make your first booking</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map(booking => (
                <Card key={booking.id} className="rounded-2xl shadow-md hover:shadow-lg transition-all group overflow-hidden border-white/50 glass" data-testid={`card-booking-${booking.id}`}>
                  <CardHeader className="bg-white/50 border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-mono">{booking.trackOrderId}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(booking.createdAt!), "PPp")}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cylinder Type</span>
                      <span className="font-semibold text-xs">{booking.cylinderType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-semibold">{booking.quantity} cylinder{booking.quantity > 1 ? "s" : ""}</span>
                    </div>
                    {booking.amount ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold text-primary">₹{booking.amount}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking Type</span>
                      <span className="font-medium capitalize">{booking.bookingType?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address</span>
                      <span className="font-medium text-right max-w-[55%] truncate">{booking.address}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <Link href={`/track?id=${booking.trackOrderId}`} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center w-full group-hover:underline">
                        Track Order <ExternalLink className="ml-1 w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
