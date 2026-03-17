import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowRight, Package, Truck, UserCheck, Flame, ShieldCheck, Clock } from "lucide-react";
import { useLocation } from "wouter";

const quickBookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
  phone: z.string().min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits"),
});

type QuickBookingForm = z.infer<typeof quickBookingSchema>;

export default function HomePage() {
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
      <div className="space-y-14">
        {/* Hero Banner */}
        <section className="bg-primary rounded-[40px] p-12 text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute -right-8 bottom-0 w-64 h-64 bg-white/5 rounded-full" />
          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
              <Flame className="w-4 h-4" /> Official Indane LPG Distributor
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold leading-tight">M/S Sarvat Indane Sewa</h1>
            <p className="text-xl opacity-90">Jaswantpuri Sarvat, Muzaffarnagar — Fast & reliable LPG cylinder delivery at your doorstep.</p>
            <div className="flex gap-4 flex-wrap pt-2">
              <Button onClick={() => setLocation("/register")} size="lg" className="bg-white text-primary rounded-full px-8 font-bold hover:bg-gray-100" data-testid="button-register">
                Create Account
              </Button>
              <Button onClick={() => setLocation("/track")} variant="outline" size="lg" className="border-white/40 text-white rounded-full px-8 hover:bg-white/20" data-testid="button-track">
                Track Order
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="rounded-[28px] border-0 shadow-lg p-7 space-y-4 group hover:shadow-2xl transition-all cursor-pointer" onClick={() => setLocation("/register")}>
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">New Connection</h3>
              <p className="text-muted-foreground text-sm">Apply for a new Indane LPG connection with doorstep service.</p>
            </div>
            <div className="h-1 bg-blue-500 rounded-full w-1/2 group-hover:w-full transition-all" />
          </Card>

          <Card className="rounded-[28px] border-0 shadow-xl p-7 space-y-4 bg-primary text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Quick Booking</h3>
              <p className="text-white/80 text-sm">Book cylinders instantly — no login needed. Just fill the form below.</p>
            </div>
          </Card>

          <Card className="rounded-[28px] border-0 shadow-lg p-7 space-y-4 group hover:shadow-2xl transition-all cursor-pointer" onClick={() => setLocation("/login")}>
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Customer Account</h3>
              <p className="text-muted-foreground text-sm">Login to view full order history, track deliveries, and manage bookings.</p>
            </div>
            <div className="h-1 bg-green-500 rounded-full w-1/2 group-hover:w-full transition-all" />
          </Card>
        </section>

        {/* Quick Booking Form */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-display font-bold">Quick Booking</h2>
            <p className="text-muted-foreground mt-2">No account needed — get your booking ID instantly.</p>
          </div>
          <Card className="glass rounded-[40px] border-0 shadow-2xl p-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("customerName")} placeholder="Your full name" className="h-13 rounded-2xl bg-white/80 border-0" data-testid="input-quick-name" />
                  {form.formState.errors.customerName && <p className="text-destructive text-sm">{form.formState.errors.customerName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-muted-foreground font-medium">+91</span>
                    <Input {...form.register("phone")} placeholder="935524XXXX" className="h-13 rounded-2xl bg-white/80 border-0 pl-14" data-testid="input-quick-phone" />
                  </div>
                  {form.formState.errors.phone && <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cylinder Type</Label>
                  <Controller control={form.control} name="cylinderType" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-13 rounded-2xl bg-white/80 border-0" data-testid="select-quick-cylinder">
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
                      <SelectTrigger className="h-13 rounded-2xl bg-white/80 border-0" data-testid="select-quick-booking-type">
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
                  <Input {...form.register("address")} placeholder="Street, Mohalla, Colony" className="h-13 rounded-2xl bg-white/80 border-0" data-testid="input-quick-address" />
                  {form.formState.errors.address && <p className="text-destructive text-sm">{form.formState.errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" {...form.register("quantity")} min={1} max={10} className="h-13 rounded-2xl bg-white/80 border-0" data-testid="input-quick-qty" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...form.register("city")} placeholder="e.g. Muzaffarnagar" className="h-13 rounded-2xl bg-white/80 border-0" data-testid="input-quick-city" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input {...form.register("pincode")} maxLength={6} placeholder="e.g. 251001" className="h-13 rounded-2xl bg-white/80 border-0" data-testid="input-quick-pincode" />
                </div>
              </div>

              {estimatedAmount !== null && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{estimatedAmount}</span>
                </div>
              )}

              <Button type="submit" disabled={createBooking.isPending} className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl" data-testid="button-quick-book">
                {createBooking.isPending ? "Booking..." : "Book Now"}
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </form>
          </Card>
        </section>

        {/* Trust badges */}
        <section className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: ShieldCheck, label: "Genuine Indane", sub: "Authorized distributor. ISO certified cylinders." },
            { icon: Clock, label: "Fast Delivery", sub: "Same-day or next-day delivery within Muzaffarnagar." },
            { icon: Flame, label: "24/7 Support", sub: "Call us anytime: +91-9355241824" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-center"><div className="bg-primary/10 rounded-full p-4"><Icon className="w-8 h-8 text-primary" /></div></div>
              <h4 className="font-bold text-lg">{label}</h4>
              <p className="text-muted-foreground text-sm">{sub}</p>
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="bg-primary rounded-[40px] p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full" />
          <h2 className="text-4xl font-display font-bold text-white relative z-10">Are you a Delivery Vendor?</h2>
          <p className="text-xl text-white/80 max-w-xl mx-auto relative z-10">Register as a vendor, complete your KYC, and start delivering cylinders in your area.</p>
          <Button onClick={() => setLocation("/vendor-kyc")} className="bg-white text-primary rounded-full px-10 py-6 text-xl font-bold hover:bg-gray-100 relative z-10" data-testid="button-vendor-kyc">
            Register as Vendor
          </Button>
        </section>
      </div>
    </Layout>
  );
}
