import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Truck, UserCheck, Flame, ShieldCheck, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();

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
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card
            className="rounded-[28px] border-0 shadow-lg p-7 space-y-4 group hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => setLocation("/register")}
            data-testid="card-new-connection"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">New Connection</h3>
              <p className="text-muted-foreground text-sm">Apply for a new Indane LPG connection with doorstep service.</p>
            </div>
            <div className="h-1 bg-blue-500 rounded-full w-1/2 group-hover:w-full transition-all" />
          </Card>

          <Card
            className="rounded-[28px] border-0 shadow-xl p-7 space-y-4 bg-primary text-white cursor-pointer hover:scale-[1.02] transition-all"
            onClick={() => setLocation("/quick-book")}
            data-testid="card-quick-booking"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Quick Booking</h3>
              <p className="text-white/80 text-sm">Book cylinders instantly — no login needed. Click to book now.</p>
            </div>
            <div className="h-1 bg-white/40 rounded-full w-1/2 group-hover:w-full transition-all" />
          </Card>

          <Card
            className="rounded-[28px] border-0 shadow-lg p-7 space-y-4 group hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => setLocation("/login")}
            data-testid="card-customer-account"
          >
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

        {/* Trust Badges */}
        <section className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: ShieldCheck, label: "Genuine Indane", sub: "Authorized distributor. ISO certified cylinders." },
            { icon: Clock, label: "Fast Delivery", sub: "Same-day or next-day delivery within Muzaffarnagar." },
            { icon: Flame, label: "24/7 Support", sub: "Call us anytime: +91-9355241824" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-primary/10 rounded-full p-4"><Icon className="w-8 h-8 text-primary" /></div>
              </div>
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
          <Button
            onClick={() => setLocation("/vendor-kyc")}
            className="bg-white text-primary rounded-full px-10 py-6 text-xl font-bold hover:bg-gray-100 relative z-10"
            data-testid="button-vendor-kyc"
          >
            Register as Vendor
          </Button>
        </section>
      </div>
    </Layout>
  );
}
