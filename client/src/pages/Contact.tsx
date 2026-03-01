import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const contactInfo = [
    { icon: Phone, label: "Phone", value: "+91-9355241824", sub: "Toll Free - Available 24/7", color: "bg-green-50 text-green-600" },
    { icon: Mail, label: "Email", value: "support@indane.co.in", sub: "We reply within 24 hours", color: "bg-blue-50 text-blue-600" },
    { icon: MapPin, label: "Head Office", value: "Indane LPG Office - Jaswantpuri Sarvat", sub: "Indane Warehouse - Bagowali Gate, Sisona Road, Muzaffarnagar - 251001", color: "bg-orange-50 text-orange-600" },
    { icon: Clock, label: "Working Hours", value: "24/7 Service", sub: "Office: Mon-Sat, 9AM - 6PM", color: "bg-purple-50 text-purple-600" },
  ];

  const faqs = [
    { q: "How do I book a cylinder refill?", a: "You can book through our website, mobile app, or by calling our toll-free number." },
    { q: "What is the delivery time?", a: "Standard delivery takes 2-3 business days. Emergency delivery is available in select areas." },
    { q: "How do I apply for a new connection?", a: "Visit our Easy Booking page, select 'New Connection', and fill in the required details." },
    { q: "What payment methods are accepted?", a: "We accept Cash on Delivery, UPI, Credit/Debit Cards, and Net Banking." },
  ];

  return (
    <Layout>
      <div className="space-y-16 pb-20">
        {/* Header Section */}
        <section className="relative h-[350px] -mt-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0f172a] opacity-95 z-0"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-primary font-bold">Contact Us</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-light">
              Have questions? We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </section>

        {/* Info Cards */}
        <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, i) => (
              <Card key={i} className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-6`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{info.label}</h3>
                  <p className="font-bold text-gray-900 mb-1">{info.value}</p>
                  <p className="text-sm text-gray-500 leading-snug">{info.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Form and FAQ */}
        <section className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-3xl font-display font-bold">Send us a Message</h2>
            <form className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Name" className="rounded-xl bg-gray-50/50 border-gray-100 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Your phone number" className="rounded-xl bg-gray-50/50 border-gray-100 h-12" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="rounded-xl bg-gray-50/50 border-gray-100 h-12" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" className="rounded-xl bg-gray-50/50 border-gray-100 h-12" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." className="rounded-xl bg-gray-50/50 border-gray-100 min-h-[150px] resize-none" />
              </div>
              <div className="col-span-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl text-lg font-bold">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-display font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 mt-8">
              <h4 className="text-red-700 font-bold mb-2 uppercase tracking-wider text-sm">Emergency Contact</h4>
              <p className="text-red-900 font-medium mb-4">For gas leaks or emergencies, call immediately:</p>
              <div className="flex items-center gap-3 text-red-600 font-bold text-3xl">
                <Phone className="w-8 h-8" />
                <span>100</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="max-w-7xl mx-auto px-4 h-[400px] bg-gray-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-500">
           <MapPin className="w-12 h-12" />
           <p className="font-medium">Find your nearest Indane distributor</p>
           <Button variant="outline" className="rounded-xl bg-white">View on Map</Button>
        </section>
      </div>
    </Layout>
  );
}
