import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Admin Control Center</h1>
            <p className="text-muted-foreground">Overview of all system bookings.</p>
          </div>

          <Card className="rounded-3xl shadow-2xl overflow-hidden glass border-white/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Track ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Contact / Address</th>
                    <th className="px-6 py-4 font-semibold">Qty</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white/70">
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-10 animate-pulse">Loading...</td></tr>
                  ) : bookings?.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/90 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{booking.trackOrderId}</td>
                      <td className="px-6 py-4 font-semibold">{booking.customerName}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-xs mb-1">{booking.phone}</div>
                        <div className="text-xs text-muted-foreground max-w-[150px] truncate">{booking.address}</div>
                      </td>
                      <td className="px-6 py-4 font-bold">{booking.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">{format(new Date(booking.createdAt!), 'PPp')}</td>
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
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
