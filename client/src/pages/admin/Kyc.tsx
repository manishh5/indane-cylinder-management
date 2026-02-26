import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useVendorKycList, useApproveVendorKyc } from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";
import { FileCheck, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminKyc() {
  const { data: kycs } = useVendorKycList();
  const approveKyc = useApproveVendorKyc();
  const { toast } = useToast();
  
  const [selectedKyc, setSelectedKyc] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKyc || !username || !password) return;
    
    approveKyc.mutate({ id: selectedKyc, username, password }, {
      onSuccess: () => {
        toast({ title: "Vendor Approved & Created" });
        setDialogOpen(false);
        setUsername("");
        setPassword("");
      }
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Vendor KYC Applications</h1>
            <p className="text-muted-foreground">Review vendor documents and generate credentials.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kycs?.map((kyc) => (
              <Card key={kyc.id} className="glass rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="bg-white/50 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{kyc.vendorName}</CardTitle>
                    <StatusBadge status={kyc.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">Applied: {format(new Date(kyc.createdAt!), 'PP')}</p>
                </CardHeader>
                <CardContent className="p-6 flex-1 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Contact</span>
                    <p className="font-medium">{kyc.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Address</span>
                    <p className="text-sm">{kyc.address}</p>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <a href={kyc.aadharUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary flex items-center hover:underline">
                      Aadhar <ExternalLink className="ml-1 w-3 h-3"/>
                    </a>
                    <a href={kyc.panUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary flex items-center hover:underline">
                      PAN <ExternalLink className="ml-1 w-3 h-3"/>
                    </a>
                  </div>
                </CardContent>
                {kyc.status === 'pending' && (
                  <CardFooter className="p-4 bg-white/40 border-t">
                    <Dialog open={dialogOpen && selectedKyc === kyc.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if(open) setSelectedKyc(kyc.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-xl gap-2"><FileCheck className="w-4 h-4"/> Review & Approve</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl glass">
                        <DialogHeader>
                          <DialogTitle>Approve Vendor & Create Account</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleApprove} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Assign Username</Label>
                            <Input value={username} onChange={e=>setUsername(e.target.value)} required className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Assign Password</Label>
                            <Input value={password} onChange={e=>setPassword(e.target.value)} required className="h-12 rounded-xl" />
                          </div>
                          <Button type="submit" disabled={approveKyc.isPending} className="w-full h-12 rounded-xl mt-4">
                            {approveKyc.isPending ? "Processing..." : "Approve Vendor"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                )}
              </Card>
            ))}
            {kycs?.length === 0 && (
              <div className="col-span-3 text-center py-20 text-muted-foreground bg-secondary/20 rounded-3xl border-dashed border-2">
                No KYC applications pending.
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
