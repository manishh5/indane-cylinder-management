import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, CYLINDER_TYPES } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useCylinderRates } from "@/hooks/use-vendors";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ArrowRight, Truck } from "lucide-react";
import { useLocation } from "wouter";

const quickBookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
  phone: z.string().min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits"),
  pincode: z.string().length(6, "Pincode must be 6 digits").optional().or(z.literal("")),
});

type QuickBookingForm = z.infer<typeof quickBookingSchema>;

export default function QuickBook() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: rates } = useCylinderRates();

  const form = useForm<QuickBookingForm>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      customerName: "", phone: "", address: "", city: "", pincode: "",
      cylinderType: "14.2kg Domestic", quantity: 1, bookingType: "refill",
      specialInstructions: ""
    }
  });

  const cylinderType = form.watch("cylinderType");
  const quantity = form.watch("quantity");
  const rate = rates?.find(r => r.cylinderType === cylinderType);
  const estimatedAmount = rate ? rate.price * (quantity || 1) : null;

  const onSubmit = (data: QuickBookingForm) => {
    createBooking.mutate(data, {
      onSuccess: (result) => {
        toast({ title: "Booking Successful!", description: `Your Tracking ID: ${result.trackOrderId}` });
        form.reset();
        setLocation(`/track?id=${result.trackOrderId}`);
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-5">
              <Truck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold mb-2">Quick Booking</h1>
          <p className="text-muted-foreground text-lg">No account needed — fill in your details and get a booking ID instantly.</p>
        </div>

        <Card className="glass rounded-[40px] border-0 shadow-2xl">
          <CardHeader className="bg-primary/5 border-b rounded-t-[40px] px-10 pt-8 pb-6">
            <CardTitle className="text-xl">Cylinder Booking Form</CardTitle>
            <CardDescription>Your booking will be confirmed immediately with a tracking ID.</CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("customerName")} placeholder="Your full name" className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-name" />
                  {form.formState.errors.customerName && <p className="text-destructive text-sm">{form.formState.errors.customerName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">+91</span>
                    <Input {...form.register("phone")} placeholder="935524XXXX" className="h-12 rounded-2xl bg-white/80 border-0 pl-14" data-testid="input-quick-phone" />
                  </div>
                  {form.formState.errors.phone && <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cylinder Type</Label>
                  <Controller control={form.control} name="cylinderType" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 rounded-2xl bg-white/80 border-0" data-testid="select-quick-cylinder">
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
                      <SelectTrigger className="h-12 rounded-2xl bg-white/80 border-0" data-testid="select-quick-booking-type">
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

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Delivery Address</Label>
                  <Input {...form.register("address")} placeholder="Street, Mohalla, Colony" className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-address" />
                  {form.formState.errors.address && <p className="text-destructive text-sm">{form.formState.errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" {...form.register("quantity")} min={1} max={10} className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-qty" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...form.register("city")} placeholder="e.g. Muzaffarnagar" className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-city" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input {...form.register("pincode")} maxLength={6} placeholder="e.g. 251001" className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-pincode" />
                  {form.formState.errors.pincode && <p className="text-destructive text-xs">{form.formState.errors.pincode.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Instructions (optional)</Label>
                <Input {...form.register("specialInstructions")} placeholder="Any delivery instructions..." className="h-12 rounded-2xl bg-white/80 border-0" data-testid="input-quick-instructions" />
              </div>

              {estimatedAmount !== null && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{estimatedAmount}</span>
                </div>
              )}

              <Button type="submit" disabled={createBooking.isPending} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl" data-testid="button-quick-book">
                {createBooking.isPending ? "Booking..." : "Book Now"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
