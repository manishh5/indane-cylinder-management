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

type LoginForm = z.infer<typeof api.auth.login.input>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(api.auth.login.input),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data);
      if (user.role === "admin") setLocation("/admin");
      else if (user.role === "vendor") setLocation("/vendor");
      else setLocation("/customer");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message,
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-2 pb-8 pt-10">
              <CardTitle className="text-3xl font-display">Welcome Back</CardTitle>
              <CardDescription className="text-base">Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...form.register("username")} className="h-12 rounded-xl bg-white/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...form.register("password")} className="h-12 rounded-xl bg-white/50 focus:bg-white transition-colors" />
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full h-12 rounded-xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-4">
                  Don't have an account? <Link href="/register" className="text-primary hover:underline font-semibold">Sign up</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
