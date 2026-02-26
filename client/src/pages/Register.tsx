import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";

type RegisterForm = z.infer<typeof api.auth.registerCustomer.input>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isRegistering } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(api.auth.registerCustomer.input),
    defaultValues: { name: "", phone: "", password: "", address: "" }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
      toast({ title: "Registration successful!", description: "Welcome to GasFlow." });
      setLocation("/customer");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message,
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh] py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-2 pb-8 pt-10">
              <CardTitle className="text-3xl font-display">Create Account</CardTitle>
              <CardDescription className="text-base">Join us for faster bookings</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register("name")} className="h-12 rounded-xl bg-white/50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Username)</Label>
                  <Input id="phone" {...form.register("phone")} className="h-12 rounded-xl bg-white/50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Default Address</Label>
                  <Input id="address" {...form.register("address")} className="h-12 rounded-xl bg-white/50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...form.register("password")} className="h-12 rounded-xl bg-white/50 focus:bg-white" />
                </div>
                <Button type="submit" disabled={isRegistering} className="w-full h-12 mt-4 rounded-xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {isRegistering ? "Creating Account..." : "Sign Up"}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-4">
                  Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
