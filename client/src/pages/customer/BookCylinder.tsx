import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, CYLINDER_TYPES } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useCylinderRates } from "@/hooks/use-vendors";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { useEffect } from "react";
import { Flame } from "lucide-react";

const bookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  pincode: z.string().length(6, "Pincode must be 6 digits").optional().or(z.literal("")),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookCylinder() {
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const { data: rates } = useCylinderRates();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "", phone: "", address: "", city: "", pincode: "",
      cylinderType: "14.2kg Domestic", quantity: 1, bookingType: "refill",
      specialInstructions: "", customerId: user?.id
    }
  });

  useEffect(() => {
    if (user) {
      form.setValue("customerName", user.name || user.username);
      form.setValue("phone", user.phone || "");
      form.setValue("address", user.address || "");
      form.setValue("customerId", user.id);
    }
  }, [user, form]);

  const cylinderType = form.watch("cylinderType");
  const quantity = form.watch("quantity");
  const rate = rates?.find(r => r.cylinderType === cylinderType);
  const estimatedAmount = rate ? rate.price * (quantity || 1) : null;

  const onSubmit = (data: BookingForm) => {
    createBooking.mutate(data, {
      onSuccess: (booking) => {
        toast({ title: "Booking confirmed!", description: `Your Track ID: ${booking.trackOrderId}` });
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
        <div className="max-w-2xl mx-auto pt-6">
          <Card className="shadow-2xl border-0 ring-1 ring-black/5 rounded-3xl overflow-hidden glass">
            <CardHeader className="bg-primary/5 pb-6 text-center border-b">
              <div className="flex justify-center mb-3">
                <div className="bg-primary/10 rounded-full p-4"><Flame className="w-8 h-8 text-primary" /></div>
              </div>
              <CardTitle className="text-3xl font-display">Book New Cylinder</CardTitle>
              <CardDescription>Order a fresh LPG cylinder to your doorstep.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Name & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input id="customerName" {...form.register("customerName")} className="h-11 rounded-xl bg-white/60" data-testid="input-name" />
                    {form.formState.errors.customerName && <p className="text-destructive text-xs">{form.formState.errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">+91</span>
                      <Input id="phone" {...form.register("phone")} className="h-11 rounded-xl bg-white/60 pl-12" placeholder="9355241XXXX" data-testid="input-phone" />
                    </div>
                    {form.formState.errors.phone && <p className="text-destructive text-xs">{form.formState.errors.phone.message}</p>}
                  </div>
                </div>

                {/* Cylinder Type & Booking Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cylinder Type</Label>
                    <Controller control={form.control} name="cylinderType" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11 rounded-xl bg-white/60" data-testid="select-cylinder-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {CYLINDER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Booking Type</Label>
                    <Controller control={form.control} name="bookingType" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11 rounded-xl bg-white/60" data-testid="select-booking-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="refill">Refill</SelectItem>
                          <SelectItem value="new_connection">New Connection</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={1} max={10} {...form.register("quantity")} className="h-11 rounded-xl bg-white/60" data-testid="input-quantity" />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input id="address" {...form.register("address")} className="h-11 rounded-xl bg-white/60" placeholder="Street / Mohalla / Colony" data-testid="input-address" />
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...form.register("city")} className="h-11 rounded-xl bg-white/60" placeholder="e.g. Muzaffarnagar" data-testid="input-city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...form.register("pincode")} maxLength={6} className="h-11 rounded-xl bg-white/60" placeholder="e.g. 251001" data-testid="input-pincode" />
                    {form.formState.errors.pincode && <p className="text-destructive text-xs">{form.formState.errors.pincode.message}</p>}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions (optional)</Label>
                  <Input id="specialInstructions" {...form.register("specialInstructions")} className="h-11 rounded-xl bg-white/60" placeholder="Any delivery instructions..." data-testid="input-instructions" />
                </div>

                {/* Price estimate */}
                {estimatedAmount !== null && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Estimated Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{estimatedAmount}</span>
                  </div>
                )}

                <Button type="submit" disabled={createBooking.isPending} className="w-full h-14 rounded-xl text-lg shadow-lg mt-2" data-testid="button-book">
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
