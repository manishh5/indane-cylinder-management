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
import { z } from "zod";
import { Store, FileCheck } from "lucide-react";

const kycSchema = insertVendorKycSchema.extend({
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

type KycForm = z.infer<typeof kycSchema>;

export default function VendorKycPublic() {
  const { toast } = useToast();
  const submitKyc = useSubmitVendorKyc();

  const form = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: { vendorName: "", phone: "", email: "", address: "", area: "", aadharUrl: "", panUrl: "" }
  });

  const onSubmit = (data: KycForm) => {
    submitKyc.mutate(data, {
      onSuccess: () => {
        toast({ title: "Application Submitted!", description: "Your KYC is under review. Admin will contact you with login credentials." });
        form.reset();
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Submission Failed", description: err.message });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-5"><Store className="w-10 h-10 text-primary" /></div>
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">Partner With IndaneSewa</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Become an authorized vendor and deliver Indane LPG cylinders in your area. Submit your KYC — admin will review and provide login credentials.</p>
        </div>

        <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6 border-b">
            <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" /> KYC Application Form</CardTitle>
            <CardDescription>Fill all fields carefully. Approval usually takes 1-2 business days.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Agency / Vendor Name *</Label>
                  <Input id="vendorName" {...form.register("vendorName")} className="h-12 rounded-xl" placeholder="Your agency name" data-testid="kyc-name" />
                  {form.formState.errors.vendorName && <p className="text-destructive text-xs">{form.formState.errors.vendorName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground font-medium">+91</span>
                    <Input id="phone" {...form.register("phone")} className="h-12 rounded-xl pl-12" placeholder="9355241XXXX" data-testid="kyc-phone" />
                  </div>
                  {form.formState.errors.phone && <p className="text-destructive text-xs">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...form.register("email")} className="h-12 rounded-xl" placeholder="vendor@email.com" data-testid="kyc-email" />
                  {form.formState.errors.email && <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Service Area</Label>
                  <Input id="area" {...form.register("area")} className="h-12 rounded-xl" placeholder="e.g. Muzaffarnagar, Shamli" data-testid="kyc-area" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Operating Address *</Label>
                <Input id="address" {...form.register("address")} className="h-12 rounded-xl" placeholder="Full operating address with pincode" data-testid="kyc-address" />
                {form.formState.errors.address && <p className="text-destructive text-xs">{form.formState.errors.address.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5 p-5 bg-secondary/30 rounded-2xl border border-secondary">
                <div className="space-y-2">
                  <Label htmlFor="aadharUrl">Aadhar Document URL *</Label>
                  <Input id="aadharUrl" placeholder="https://drive.google.com/..." {...form.register("aadharUrl")} className="bg-white h-12 rounded-xl" data-testid="kyc-aadhar" />
                  <p className="text-xs text-muted-foreground">Upload to Google Drive and paste link</p>
                  {form.formState.errors.aadharUrl && <p className="text-destructive text-xs">{form.formState.errors.aadharUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panUrl">PAN Document URL *</Label>
                  <Input id="panUrl" placeholder="https://drive.google.com/..." {...form.register("panUrl")} className="bg-white h-12 rounded-xl" data-testid="kyc-pan" />
                  <p className="text-xs text-muted-foreground">Upload to Google Drive and paste link</p>
                  {form.formState.errors.panUrl && <p className="text-destructive text-xs">{form.formState.errors.panUrl.message}</p>}
                </div>
              </div>

              <Button type="submit" disabled={submitKyc.isPending} className="w-full h-14 rounded-xl text-lg shadow-lg" data-testid="kyc-submit">
                {submitKyc.isPending ? "Submitting..." : "Submit KYC Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
