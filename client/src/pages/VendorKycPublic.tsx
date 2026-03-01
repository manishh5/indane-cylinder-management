import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorKycSchema } from "@shared/schema";
import { useSubmitVendorKyc } from "@/hooks/use-vendors";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";

const kycSchema = insertVendorKycSchema.extend({
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
});

type KycForm = z.infer<typeof kycSchema>;

export default function VendorKycPublic() {
  const { toast } = useToast();
  const submitKyc = useSubmitVendorKyc();

  const form = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: { vendorName: "", phone: "", address: "", aadharUrl: "", panUrl: "" }
  });

  const onSubmit = (data: KycForm) => {
    submitKyc.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Application Submitted",
          description: "Your KYC application has been sent for review. We will contact you shortly.",
        });
        form.reset();
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: err.message,
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display font-bold mb-4">Partner With IndaneSewa</h1>
            <p className="text-muted-foreground text-lg">Become an authorized vendor and grow your distribution business.</p>
          </div>

          <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8 border-b">
              <CardTitle>KYC Application</CardTitle>
              <CardDescription>Submit your details to start the verification process.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Agency / Vendor Name</Label>
                    <Input id="vendorName" {...form.register("vendorName")} className="h-12 rounded-xl" placeholder="Agency Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">+91</span>
                      <Input id="phone" {...form.register("phone")} className="h-12 rounded-xl pl-12" placeholder="935524XXXX" />
                    </div>
                    {form.formState.errors.phone && <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Operating Address</Label>
                  <Input id="address" {...form.register("address")} className="h-12 rounded-xl" placeholder="Full operating address" />
                </div>

                <div className="grid sm:grid-cols-2 gap-6 p-6 bg-secondary/30 rounded-2xl border border-secondary">
                  <div className="space-y-2">
                    <Label htmlFor="aadharUrl">Aadhar Document URL</Label>
                    <Input id="aadharUrl" placeholder="https://..." {...form.register("aadharUrl")} className="bg-white h-12 rounded-xl" />
                    <p className="text-xs text-muted-foreground">Provide link to Aadhar copy</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panUrl">PAN Document URL</Label>
                    <Input id="panUrl" placeholder="https://..." {...form.register("panUrl")} className="bg-white h-12 rounded-xl" />
                    <p className="text-xs text-muted-foreground">Provide link to PAN copy</p>
                  </div>
                </div>

                <Button type="submit" disabled={submitKyc.isPending} className="w-full h-14 rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {submitKyc.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
