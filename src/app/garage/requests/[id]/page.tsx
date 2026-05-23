"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Phone, User, Car, Wrench,
  Clock, CheckCircle2, XCircle, Navigation, Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Booking } from "@/types";

export default function GarageRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.booking))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAccept() {
    setActionLoading("accept");
    try {
      const res = await fetch(`/api/bookings/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
      toast.success("Booking accepted! Customer has been notified.");
    } catch (err) { toast.error((err as Error).message); }
    finally { setActionLoading(null); }
  }

  async function handleDispatch() {
    setActionLoading("dispatch");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispatched", dispatched_at: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
      toast.success("Mechanic dispatched!");
    } catch (err) { toast.error((err as Error).message); }
    finally { setActionLoading(null); }
  }

  async function handleComplete() {
    setActionLoading("complete");
    try {
      const res = await fetch(`/api/bookings/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ final_price: booking?.estimated_price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
      toast.success("Service marked as complete!");
    } catch (err) { toast.error((err as Error).message); }
    finally { setActionLoading(null); }
  }

  async function handleCancel() {
    setActionLoading("cancel");
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by garage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
      toast.success("Booking cancelled");
    } catch (err) { toast.error((err as Error).message); }
    finally { setActionLoading(null); }
  }

  if (loading) return <div className="min-h-screen bg-background animate-pulse" />;
  if (!booking) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Not found</p></div>;

  const customer = booking.customer as { user?: { name?: string; phone?: string } } | undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground text-sm">{booking.booking_number}</h1>
            <span className={`status-badge text-xs ${getStatusColor(booking.status)}`}>
              <span className="status-dot bg-current" />
              {getStatusLabel(booking.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 space-y-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{customer?.user?.name ?? "Customer"}</p>
                  <p className="text-xs text-muted-foreground">{customer?.user?.phone}</p>
                </div>
              </div>
              {customer?.user?.phone && (
                <Button variant="ghost" size="icon-sm" asChild>
                  <a href={`tel:${customer.user.phone}`}><Phone className="w-4 h-4" /></a>
                </Button>
              )}
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>{booking.customer_address}</span>
            </div>
            {booking.customer_lat && booking.customer_lng && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://maps.google.com/?q=${booking.customer_lat},${booking.customer_lng}`} target="_blank">
                  <Navigation className="w-4 h-4" />Open in Maps
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Service</span>
              <span className="font-medium text-foreground">{booking.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Car className="w-4 h-4" /> Vehicle</span>
              <span className="font-medium text-foreground">{booking.vehicle?.make} {booking.vehicle?.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /> Schedule</span>
              <span className="font-medium text-foreground">
                {new Date(booking.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {booking.scheduled_time}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Estimated Price</span>
              <span className="font-bold text-foreground">{formatCurrency(booking.estimated_price ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {(booking.status === "dispatched" || booking.status === "in_progress") && booking.arrival_otp && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Key className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Arrival OTP</p>
              </div>
              <p className="text-3xl font-bold tracking-[0.3em] text-primary">{booking.arrival_otp}</p>
              <p className="text-xs text-muted-foreground mt-2">Show this OTP to the customer when you arrive</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2 pb-8">
          {booking.status === "pending" && (
            <>
              <Button className="w-full" onClick={handleAccept} disabled={actionLoading === "accept"}>
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading === "accept" ? "Accepting..." : "Accept Booking"}
              </Button>
              <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleCancel} disabled={actionLoading === "cancel"}>
                <XCircle className="w-4 h-4" />
                Decline
              </Button>
            </>
          )}
          {booking.status === "accepted" && (
            <Button className="w-full" onClick={handleDispatch} disabled={actionLoading === "dispatch"}>
              <Navigation className="w-4 h-4" />
              {actionLoading === "dispatch" ? "Dispatching..." : "Dispatch Mechanic"}
            </Button>
          )}
          {(booking.status === "dispatched" || booking.status === "in_progress") && (
            <Button className="w-full" variant="success" onClick={handleComplete} disabled={actionLoading === "complete"}>
              <CheckCircle2 className="w-4 h-4" />
              {actionLoading === "complete" ? "Completing..." : "Mark Service Complete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
