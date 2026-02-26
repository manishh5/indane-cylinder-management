import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { PackageOpen, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const { data: bookings, isLoading } = useBookings();

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Order History</h1>
              <p className="text-muted-foreground">Track and manage your past bookings.</p>
            </div>
            <Button asChild className="rounded-xl shadow-md">
              <Link href="/customer/book">Book New Cylinder</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-48 rounded-2xl bg-muted/50 border-0" />
              ))}
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
              {bookings.map((booking) => (
                <Card key={booking.id} className="rounded-2xl shadow-md hover:shadow-lg transition-all group overflow-hidden border-white/50 glass">
                  <CardHeader className="bg-white/50 border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{booking.trackOrderId.substring(0,8)}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(booking.createdAt!), 'PPp')}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-semibold">{booking.quantity} Cylinders</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address</span>
                      <span className="font-medium text-right max-w-[60%] truncate">{booking.address}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <Link href={`/track?id=${booking.trackOrderId}`} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center w-full group-hover:underline">
                        Track Order Details <ExternalLink className="ml-1 w-3 h-3" />
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
