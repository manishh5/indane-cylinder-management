import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowRight, Flame, Package, Truck, Home } from "lucide-react";
import { useLocation } from "wouter";

const quickBookingSchema = insertBookingSchema.extend({
  quantity: z.coerce.number().min(1).max(10),
  phone: z.string().min(10, "Invalid Indian phone number").max(10),
});

type QuickBookingForm = z.infer<typeof quickBookingSchema>;

export default function HomePage() {
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
          description: `Your tracking ID is ${result.trackOrderId}.`,
        });
        form.reset();
        setLocation(`/track?id=${result.trackOrderId}`);
      }
    });
  };

  const navItems = ["Home", "Features", "Safety", "Address"];

  return (
    <Layout>
      <div className="space-y-12">
        {/* Banner Section */}
        <section className="bg-primary rounded-[40px] p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-6xl font-display font-bold">M/S Sarvat Indane Sewa</h1>
            <p className="text-2xl font-light opacity-90">Indane LPG Gas Cylinder Distributer</p>
          </div>
          <div className="absolute top-12 right-12">
            <Button onClick={() => setLocation("/login")} variant="outline" className="bg-white/10 border-white/20 text-white rounded-full px-8 py-6 text-lg hover:bg-white/20">
              <LogIn className="mr-2 w-5 h-5" />
              Login
            </Button>
          </div>
        </section>

        {/* Local Nav */}
        <div className="flex gap-8 px-4 border-b">
          {navItems.map(item => (
            <button key={item} className={`pb-4 text-lg font-medium ${item === "Home" ? "text-primary border-b-2 border-primary" : "text-gray-500"}`}>
              {item}
            </button>
          ))}
        </div>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="rounded-[32px] border-0 shadow-lg p-8 space-y-6 group hover:shadow-2xl transition-all cursor-pointer" onClick={() => setLocation("/login")}>
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">New Connection</h3>
              <p className="text-gray-500">(Apply for new LPG)</p>
            </div>
            <div className="h-1 bg-blue-500 rounded-full w-2/3 group-hover:w-full transition-all"></div>
          </Card>

          <Card className="rounded-[32px] border-0 shadow-lg p-8 space-y-6 group hover:shadow-2xl transition-all border-b-4 border-primary">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Quick Booking</h3>
              <p className="text-gray-500">(For non-users)</p>
            </div>
          </Card>

          <Card className="rounded-[32px] border-0 shadow-lg p-8 space-y-6 group hover:shadow-2xl transition-all" onClick={() => setLocation("/login")}>
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Home Delivery</h3>
              <p className="text-gray-500">(For Users)</p>
            </div>
            <div className="h-1 bg-red-500 rounded-full w-2/3 group-hover:w-full transition-all"></div>
          </Card>
        </section>

        {/* Quick Booking Form */}
        <section className="max-w-4xl mx-auto py-12">
          <Card className="glass rounded-[40px] border-0 shadow-2xl p-10">
            <h2 className="text-3xl font-display font-bold mb-8">Instant Booking</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("customerName")} placeholder="Enter your name" className="h-14 rounded-2xl bg-gray-50 border-0" />
                  {form.formState.errors.customerName && <p className="text-red-500 text-sm">{form.formState.errors.customerName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500">+91</span>
                    <Input {...form.register("phone")} placeholder="935524XXXX" className="h-14 rounded-2xl bg-gray-50 border-0 pl-14" />
                  </div>
                  {form.formState.errors.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...form.register("address")} placeholder="Delivery address" className="h-14 rounded-2xl bg-gray-50 border-0" />
                  {form.formState.errors.address && <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" {...form.register("quantity")} className="h-14 rounded-2xl bg-gray-50 border-0" />
                </div>
              </div>
              <Button type="submit" disabled={createBooking.isPending} className="w-full h-16 rounded-2xl text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl">
                {createBooking.isPending ? "Booking..." : "Book Now"}
                <ArrowRight className="ml-2" />
              </Button>
            </form>
          </Card>
        </section>

        {/* Bottom Banner */}
        <section className="bg-primary rounded-[40px] p-20 text-center space-y-10 relative overflow-hidden">
          <h2 className="text-6xl font-display font-bold text-white max-w-4xl mx-auto leading-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Book a demo today and see how our ERP system can streamline your operations
          </p>
          <div className="flex justify-center gap-6">
            <Button className="bg-white text-primary rounded-full px-10 py-8 text-xl font-bold hover:bg-gray-100">
              Request Demo
            </Button>
            <Button variant="outline" className="bg-primary-foreground/10 border-white/20 text-white rounded-full px-10 py-8 text-xl font-bold hover:bg-white/20">
              View All Services
            </Button>
          </div>
        </section>

        <footer className="text-center py-10 text-gray-400">
           <p>© 2024 Indane LPG - M/S Sarvat Indane Sewa. All rights reserved.</p>
        </footer>
      </div>
    </Layout>
  );
}
