import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Shield, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  const milestones = [
    { year: "1964", title: "Established", desc: "Indane brand launched by Indian Oil Corporation" },
    { year: "1990", title: "National Expansion", desc: "Expanded to all major cities across India" },
    { year: "2010", title: "Digital Transformation", desc: "Online booking and tracking introduced" },
    { year: "2024", title: "1 Million+ Customers", desc: "Serving over a million households" },
  ];

  const services = [
    "Domestic LPG Cylinders (14.2 Kg)",
    "Commercial LPG Cylinders (19 Kg)",
    "Portable Cylinders (5 Kg)",
    "New Connection Registration",
    "Cylinder Refill Booking",
    "Home Delivery Service",
    "Safety Equipment",
    "24/7 Emergency Support",
  ];

  return (
    <Layout>
      <div className="space-y-16 pb-20">
        {/* Hero Section */}
        <section className="relative h-[400px] -mt-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0f172a] opacity-90 z-0"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-primary font-bold">M/S Sarvat Indane Sewa</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              About Our Services
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-light">
              India's most trusted LPG provider, delivering safe and reliable energy to millions of households since 1964.
            </p>
            <div className="absolute top-4 right-4 md:top-8 md:right-8">
               <Button onClick={() => setLocation("/login")} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-6 text-lg font-bold">Login</Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-bold tracking-wider uppercase text-sm block mb-4">Our Mission</span>
            <h2 className="text-4xl font-display font-bold text-[#1e293b] mb-6">
              Powering India's Kitchens with Clean Energy
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Indane is a premium brand of Indian Oil Corporation, committed to providing safe, efficient and environmentally friendly LPG solutions to every Indian household.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Safety First</h4>
                <p className="text-gray-500">Highest safety standards in cylinder handling and delivery</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Customer Centric</h4>
                <p className="text-gray-500">Your satisfaction is our top priority</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-gray-50/50 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-primary font-bold tracking-wider uppercase text-sm block mb-4">What We Offer</span>
            <h2 className="text-4xl font-display font-bold text-[#1e293b] mb-12">Our Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 text-left">
                  <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-green-500 -rotate-45 -mt-0.5"></div>
                  </div>
                  <span className="text-gray-700 font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-primary font-bold tracking-wider uppercase text-sm block mb-4">Our Journey</span>
          <h2 className="text-4xl font-display font-bold text-[#1e293b] mb-16">Milestones</h2>
          <div className="space-y-8 text-left">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-8 items-center">
                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg shadow-primary/30">
                  {m.year}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#1e293b] mb-1">{m.title}</h4>
                  <p className="text-gray-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
