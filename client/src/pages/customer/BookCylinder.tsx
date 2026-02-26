import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { useEffect } from "react";

const bookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookCylinder() {
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { customerName: "", phone: "", address: "", quantity: 1, customerId: user?.id }
  });

  useEffect(() => {
    if (user) {
      form.setValue("customerName", user.name || user.username);
      form.setValue("phone", user.phone || "");
      form.setValue("address", user.address || "");
      form.setValue("customerId", user.id);
    }
  }, [user, form]);

  const onSubmit = (data: BookingForm) => {
    createBooking.mutate(data, {
      onSuccess: () => {
        toast({ title: "Booking successful!" });
        setLocation("/customer");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="shadow-2xl border-0 ring-1 ring-black/5 rounded-3xl overflow-hidden glass">
            <CardHeader className="bg-primary/5 pb-8 text-center border-b">
              <CardTitle className="text-3xl font-display">Book New Cylinder</CardTitle>
              <CardDescription>Order a fresh cylinder to your registered address.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input id="customerName" {...form.register("customerName")} className="h-12 rounded-xl bg-white/60" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...form.register("phone")} className="h-12 rounded-xl bg-white/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" {...form.register("quantity")} className="h-12 rounded-xl bg-white/60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input id="address" {...form.register("address")} className="h-12 rounded-xl bg-white/60" />
                </div>

                <Button type="submit" disabled={createBooking.isPending} className="w-full h-14 rounded-xl text-lg shadow-lg mt-4">
                  {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
