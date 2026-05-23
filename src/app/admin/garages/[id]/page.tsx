"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStatusColor } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Garage } from "@/types";

export default function AdminGarageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/garages/${id}`)
      .then((r) => r.json())
      .then((d) => setGarage(d.garage))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: "active" | "suspended") {
    setActionLoading(status);
    try {
      const res = await fetch(`/api/garages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGarage(data.garage);
      toast.success(`Garage ${status === "active" ? "approved" : "suspended"}`);
      if (status === "active") setTimeout(() => router.push("/admin/garages"), 1500);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-background animate-pulse" />;
  if (!garage) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Garage not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{garage.name}</h1>
            <span className={`status-badge text-xs ${getStatusColor(garage.status)}`}>
              <span className="status-dot bg-current" />
              {garage.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 space-y-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Garage Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground">{garage.address}</p>
                <p className="text-muted-foreground text-xs">{garage.area}, {garage.city} – {garage.pincode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>{garage.phone}</span>
              <span className="text-border">|</span>
              <span>WhatsApp: {garage.whatsapp_number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-amber-400" />
              <span>{garage.rating} rating · {garage.total_reviews} reviews · {garage.total_jobs} jobs</span>
            </div>
            {garage.description && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">{garage.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        {garage.documents && Object.keys(garage.documents).length > 0 && (
          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(garage.documents).map(([key, url]) => (
                <a key={key} href={url as string} target="_blank"
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <span className="text-sm text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                  <Badge variant="default" className="text-xs">View</Badge>
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-2 pb-8">
          {garage.status !== "active" && (
            <Button className="w-full" onClick={() => updateStatus("active")} disabled={actionLoading === "active"}>
              <CheckCircle2 className="w-4 h-4" />
              {actionLoading === "active" ? "Approving..." : "Approve Garage"}
            </Button>
          )}
          {garage.status !== "suspended" && (
            <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => updateStatus("suspended")} disabled={actionLoading === "suspended"}>
              <XCircle className="w-4 h-4" />
              {actionLoading === "suspended" ? "Suspending..." : "Suspend Garage"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
