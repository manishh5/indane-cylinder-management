import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">We're here to help with your cylinder bookings and inquiries.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-muted-foreground">Mon-Fri, 9am-6pm</p>
            </CardContent>
          </Card>
          
          <Card className="glass rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">support@gasflow.com</p>
              <p className="text-muted-foreground">vendor@gasflow.com</p>
            </CardContent>
          </Card>
          
          <Card className="glass rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Office</h3>
              <p className="text-muted-foreground">123 Energy Park Ave.</p>
              <p className="text-muted-foreground">Metro City, NY 10001</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
