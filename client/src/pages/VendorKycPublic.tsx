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
import { Store, FileCheck, Upload, ImageIcon, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";

const kycSchema = insertVendorKycSchema.extend({
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

type KycForm = z.infer<typeof kycSchema>;

function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  testId,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (base64: string) => void;
  testId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div
        className="border-2 border-dashed border-primary/30 rounded-2xl p-4 bg-white/60 hover:bg-white/80 hover:border-primary/50 transition-all cursor-pointer"
        onClick={() => inputRef.current?.click()}
        data-testid={testId}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="space-y-2">
            <img
              src={preview}
              alt={label}
              className="w-full h-40 object-cover rounded-xl border border-white shadow"
            />
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {fileName}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
            <div className="bg-primary/10 rounded-full p-3">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium">Tap to select from gallery</p>
            <p className="text-xs">{hint}</p>
          </div>
        )}
      </div>
      {value && !preview && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Image selected
        </p>
      )}
    </div>
  );
}

export default function VendorKycPublic() {
  const { toast } = useToast();
  const submitKyc = useSubmitVendorKyc();

  const [aadharData, setAadharData] = useState("");
  const [panData, setPanData] = useState("");

  const form = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: { vendorName: "", phone: "", email: "", address: "", area: "", aadharUrl: "", panUrl: "" }
  });

  const onSubmit = (data: KycForm) => {
    if (!aadharData) {
      toast({ variant: "destructive", title: "Aadhar required", description: "Please upload your Aadhar card image." });
      return;
    }
    if (!panData) {
      toast({ variant: "destructive", title: "PAN required", description: "Please upload your PAN card image." });
      return;
    }

    submitKyc.mutate({ ...data, aadharUrl: aadharData, panUrl: panData }, {
      onSuccess: () => {
        toast({ title: "Application Submitted!", description: "Your KYC is under review. Admin will contact you with login credentials." });
        form.reset();
        setAadharData("");
        setPanData("");
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
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Become an authorized vendor. Submit your KYC — admin will review and provide your login credentials.
          </p>
        </div>

        <Card className="glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6 border-b">
            <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" /> KYC Application Form</CardTitle>
            <CardDescription>Fill all fields and upload your identity documents from your gallery.</CardDescription>
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

              {/* Document Upload */}
              <div className="grid sm:grid-cols-2 gap-5 p-5 bg-secondary/30 rounded-2xl border border-secondary">
                <ImageUploadField
                  label="Aadhar Card Photo *"
                  hint="JPG, PNG accepted"
                  value={aadharData}
                  onChange={setAadharData}
                  testId="kyc-aadhar-upload"
                />
                <ImageUploadField
                  label="PAN Card Photo *"
                  hint="JPG, PNG accepted"
                  value={panData}
                  onChange={setPanData}
                  testId="kyc-pan-upload"
                />
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
