import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-display font-bold text-foreground">About GasFlow</h1>
          <p className="text-xl text-muted-foreground font-light">Revolutionizing fuel distribution with seamless technology.</p>
        </motion.div>

        <div className="space-y-12">
          <Card className="glass rounded-3xl border-0 ring-1 ring-black/5 overflow-hidden">
            <CardContent className="p-10 text-lg leading-relaxed text-foreground/80 space-y-6">
              <p>
                Founded in 2024, <strong className="text-primary font-bold">GasFlow</strong> emerged from a simple idea: booking a gas cylinder should be as easy as ordering a pizza. We identified the inefficiencies in the traditional agency model and built a digital-first ecosystem connecting customers, vendors, and central supply chains.
              </p>
              <p>
                Our platform provides unprecedented transparency. Customers can track orders in real time. Vendors can manage inventory digitally. Admins oversee the entire logistics pipeline from a single pane of glass.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-primary/5 p-10 rounded-3xl border border-primary/10">
              <h3 className="text-2xl font-display font-bold mb-4 text-primary">Our Mission</h3>
              <p className="text-foreground/80">
                To ensure continuous, safe, and transparent energy access to every household and business through innovative digital logistics.
              </p>
            </div>
            <div className="bg-secondary p-10 rounded-3xl border border-secondary">
              <h3 className="text-2xl font-display font-bold mb-4">Our Vision</h3>
              <p className="text-foreground/80">
                To be the industry standard for smart utility distribution, expanding our technology to broader energy sectors globally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
