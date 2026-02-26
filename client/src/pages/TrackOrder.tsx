import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrackBooking } from "@/hooks/use-bookings";
import { StatusBadge } from "@/components/StatusBadge";
import { useState, useEffect } from "react";
import { Search, MapPin, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TrackOrder() {
  const [searchInput, setSearchInput] = useState("");
  const [trackId, setTrackId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setSearchInput(id);
      setTrackId(id);
    }
  }, []);

  const { data: booking, isLoading, isError } = useTrackBooking(trackId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackId(searchInput);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-display font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your tracking ID to see the status of your delivery.</p>
        </div>

        <Card className="glass rounded-2xl shadow-lg border-white/50">
          <CardContent className="p-2 sm:p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g., TRK-12345678" 
                  className="pl-12 h-14 rounded-xl text-lg bg-white shadow-sm border-0 ring-1 ring-black/5 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" className="h-14 px-8 rounded-xl text-base shadow-md hover:shadow-lg transition-all">
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Searching...
          </div>
        )}

        {isError && (
          <Card className="border-destructive/50 bg-destructive/5 shadow-none rounded-2xl">
            <CardContent className="p-8 text-center text-destructive">
              Booking not found. Please check your Tracking ID and try again.
            </CardContent>
          </Card>
        )}

        {booking && (
          <Card className="rounded-3xl shadow-xl border-white/50 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Order #{booking.trackOrderId}</p>
                <h3 className="text-2xl font-bold font-display">{booking.customerName}</h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <CardContent className="p-6 grid sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Package className="w-5 h-5"/></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Quantity</p>
                    <p className="text-lg font-semibold">{booking.quantity} Cylinders</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600"><MapPin className="w-5 h-5"/></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Delivery Address</p>
                    <p className="text-base font-medium">{booking.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">{booking.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Calendar className="w-5 h-5"/></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Order Placed On</p>
                    <p className="text-base font-medium">{format(new Date(booking.createdAt!), 'PPpp')}</p>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold mb-2">Delivery Status</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border shadow-sm">
                        <p className="font-semibold text-sm">Order Placed</p>
                      </div>
                    </div>
                    {['accepted', 'delivered'].includes(booking.status) && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border shadow-sm">
                          <p className="font-semibold text-sm">Order Accepted</p>
                        </div>
                      </div>
                    )}
                    {booking.status === 'delivered' && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border shadow-sm">
                          <p className="font-semibold text-sm">Delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
