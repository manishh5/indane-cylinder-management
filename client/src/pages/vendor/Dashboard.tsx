import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function VendorDashboard() {
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold">All Orders</h1>
            <p className="text-muted-foreground">Manage and update customer deliveries.</p>
          </div>

          <Card className="rounded-3xl shadow-xl overflow-hidden glass border-white/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-primary/5 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Track ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Address</th>
                    <th className="px-6 py-4 font-medium">Qty</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white/50">
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-10 animate-pulse">Loading orders...</td></tr>
                  ) : bookings?.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{booking.trackOrderId.substring(0,8)}</td>
                      <td className="px-6 py-4 font-semibold">{booking.customerName}<br/><span className="text-xs text-muted-foreground font-normal">{booking.phone}</span></td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={booking.address}>{booking.address}</td>
                      <td className="px-6 py-4">{booking.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(booking.createdAt!), 'PP')}</td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <Select
                          disabled={updateStatus.isPending}
                          value={booking.status}
                          onValueChange={(val) => updateStatus.mutate({ id: booking.id, status: val })}
                        >
                          <SelectTrigger className="w-[130px] rounded-xl h-9 ml-auto bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {bookings?.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No orders found.</td></tr>
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
