import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
    accepted: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    delivered: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
    approved: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  };

  return (
    <Badge className={`capitalize shadow-none ${variants[status.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </Badge>
  );
}
