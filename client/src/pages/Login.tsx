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
import { ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";

type LoginForm = z.infer<typeof api.auth.login.input>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState<"user" | "pass" | null>(null);

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

  const copyAndFill = (field: "username" | "password", value: string) => {
    form.setValue(field, value);
    setCopied(field === "username" ? "user" : "pass");
    setTimeout(() => setCopied(null), 1500);
  };

  const fillAdmin = () => {
    form.setValue("username", "ADMIN");
    form.setValue("password", "newAdmin");
    toast({ title: "Admin credentials filled", description: "Click Sign In to login as admin." });
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[75vh] py-8">
        <div className="w-full max-w-md space-y-4">

          {/* Admin credentials info card */}
          <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary/15 rounded-xl p-2 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-primary mb-2">Admin Login Credentials</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Username</span>
                        <p className="font-mono font-bold text-sm">ADMIN</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg"
                        onClick={() => copyAndFill("username", "ADMIN")}
                        data-testid="copy-username"
                      >
                        {copied === "user" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Password</span>
                        <p className="font-mono font-bold text-sm">newAdmin</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg"
                        onClick={() => copyAndFill("password", "newAdmin")}
                        data-testid="copy-password"
                      >
                        {copied === "pass" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 rounded-xl h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    onClick={fillAdmin}
                    data-testid="btn-fill-admin"
                  >
                    Auto-fill Admin Credentials
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login form */}
          <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-2 pb-6 pt-8">
              <CardTitle className="text-3xl font-display">Sign In</CardTitle>
              <CardDescription className="text-base">Admin · Vendor · Customer</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...form.register("username")}
                    className="h-12 rounded-xl bg-white/50 focus:bg-white transition-colors"
                    placeholder="Enter your username"
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    className="h-12 rounded-xl bg-white/50 focus:bg-white transition-colors"
                    placeholder="Enter your password"
                    data-testid="input-password"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  data-testid="btn-signin"
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Customer without account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    Register here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
