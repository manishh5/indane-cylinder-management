import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowRight, Flame, Truck, ShieldCheck, Phone } from "lucide-react";
import { useLocation } from "wouter";

// Extended schema to ensure numbers are handled correctly from inputs
const quickBookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
});

type QuickBookingForm = z.infer<typeof quickBookingSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const form = useForm<QuickBookingForm>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      quantity: 1,
    }
  });

  const onSubmit = (data: QuickBookingForm) => {
    createBooking.mutate(data, {
      onSuccess: (result) => {
        toast({
          title: "Booking Successful!",
          description: `Your tracking ID is ${result.trackOrderId}. Save this to track your order.`,
        });
        form.reset();
        setLocation(`/track?id=${result.trackOrderId}`);
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: err.message,
        });
      }
    });
  };

  return (
    <Layout>
      <div className="relative isolate pt-8 pb-16">
        {/* Abstract Minimal Background Elements */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h1 className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              Instant Cylinder <br/>
              <span className="text-gradient">Delivery</span> to Your Door
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Fast, reliable, and secure gas cylinder booking system. Book online instantly or sign up to manage your history and track deliveries in real-time.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                <Flame className="text-primary w-5 h-5" />
                <span className="font-medium text-sm">Certified Safe</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                <Truck className="text-primary w-5 h-5" />
                <span className="font-medium text-sm">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                <ShieldCheck className="text-primary w-5 h-5" />
                <span className="font-medium text-sm">Quality Assured</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass overflow-hidden border-0 ring-1 ring-black/5 rounded-3xl">
              <CardHeader className="bg-primary/5 pb-8">
                <CardTitle className="text-2xl font-display">Quick Booking</CardTitle>
                <CardDescription>No account required. Book a cylinder instantly.</CardDescription>
              </CardHeader>
              <CardContent className="-mt-4 bg-white/60 p-6 rounded-t-3xl pt-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input id="customerName" {...form.register("customerName")} placeholder="John Doe" className="bg-white/80 rounded-xl h-12" />
                    {form.formState.errors.customerName && <p className="text-destructive text-sm">{form.formState.errors.customerName.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" {...form.register("phone")} placeholder="+1 234 567 890" className="bg-white/80 rounded-xl h-12" />
                      {form.formState.errors.phone && <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" {...form.register("quantity")} className="bg-white/80 rounded-xl h-12" />
                      {form.formState.errors.quantity && <p className="text-destructive text-sm">{form.formState.errors.quantity.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" {...form.register("address")} placeholder="123 Main St, City" className="bg-white/80 rounded-xl h-12" />
                    {form.formState.errors.address && <p className="text-destructive text-sm">{form.formState.errors.address.message}</p>}
                  </div>

                  <Button type="submit" disabled={createBooking.isPending} className="w-full h-12 rounded-xl mt-4 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-semibold">
                    {createBooking.isPending ? "Processing..." : "Book Now"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
