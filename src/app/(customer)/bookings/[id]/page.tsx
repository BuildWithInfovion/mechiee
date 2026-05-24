"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Phone, Star, CheckCircle2, Clock,
  CreditCard, Bike, Search, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpInput } from "@/components/shared/OtpInput";
import { RatingStars } from "@/components/shared/RatingStars";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";

const STATUS_STEPS = [
  { status: "pending", label: "Searching for mechanic", desc: "Broadcasting to nearby garages..." },
  { status: "accepted", label: "Mechanic Found", desc: "Garage confirmed your booking" },
  { status: "dispatched", label: "On the Way", desc: "Mechanic is heading to you" },
  { status: "in_progress", label: "In Progress", desc: "Service is being done" },
  { status: "completed", label: "Completed", desc: "Service done successfully" },
];

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpLoading, setOtpLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.booking))
      .finally(() => setLoading(false));
  }, [id]);

  // Supabase Realtime: subscribe to this booking row for live status updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`booking-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${id}` },
        async () => {
          // Re-fetch full booking with joins on update
          const res = await fetch(`/api/bookings/${id}`);
          const data = await res.json();
          if (data.booking) {
            setBooking(data.booking);
            if (data.booking.garage_id && data.booking.status === "accepted") {
              toast.success("Mechanic found!", `${data.booking.garage?.name} accepted your request`);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function handleOtpVerify(otp: string) {
    setOtpLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify_otp: true, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
      toast.success("Mechanic arrival confirmed!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleReview() {
    if (!rating) return;
    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: id, rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      setReviewed(true);
      toast.success("Thank you for your review!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setReviewLoading(false);
    }
  }

  async function handlePayment() {
    if (!booking?.estimated_price) return;
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: id, amount: booking.final_price ?? booking.estimated_price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const Razorpay = (window as { Razorpay?: new (opts: object) => { open(): void } }).Razorpay;
      if (!Razorpay) { toast.error("Payment gateway not loaded"); return; }

      const rzp = new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.order.id,
        amount: data.order.amount,
        currency: "INR",
        name: "Mechiee",
        description: `Booking #${booking.booking_number}`,
        handler: () => { toast.success("Payment successful!"); router.refresh(); },
      });
      rzp.open();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (loading) return <div className="min-h-screen bg-background animate-pulse" />;
  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Booking not found</p>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.status === booking.status);
  const isPending = booking.status === "pending" && !booking.garage_id;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 py-4">
        <div className="max-w-screen-sm mx-auto flex items-center gap-3">
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

      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
        {/* Searching state — animated */}
        {isPending && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Search className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Searching for mechanics...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Broadcasting to garages near you. You&apos;ll be notified the moment one accepts.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mechanic assigned — show garage */}
        {booking.garage_id && booking.garage && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {booking.garage.logo_url ? (
                    <img src={booking.garage.logo_url} alt={booking.garage.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-400 font-medium">
                    {booking.status === "completed" ? "Serviced by" : "Assigned mechanic"}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">{booking.garage.name}</p>
                  {booking.garage.area && (
                    <p className="text-xs text-muted-foreground">{booking.garage.area}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon-sm" asChild>
                  <a href={`tel:${booking.garage.phone}`}>
                    <Phone className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Booking Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {STATUS_STEPS.filter((s) => s.status !== "cancelled").map((s, i) => {
              const done = i < currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <div key={s.status} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done || active ? "bg-primary" : "bg-secondary"}`}>
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${active ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                      {s.label}
                    </p>
                    {active && <p className="text-xs text-muted-foreground">{s.desc}</p>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* OTP Verification (when dispatched) */}
        {booking.status === "dispatched" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Mechanic Arrived?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask the mechanic for their 6-digit OTP and enter it below to confirm arrival
                </p>
              </div>
              <OtpInput onComplete={handleOtpVerify} disabled={otpLoading} />
            </CardContent>
          </Card>
        )}

        {/* Service Details */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bike className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{booking.service?.name}</p>
                <p className="text-xs text-muted-foreground">{booking.vehicle?.make} {booking.vehicle?.model}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(booking.final_price ?? booking.estimated_price ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.final_price ? "Final" : "Estimated"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {new Date(booking.scheduled_date).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long"
                })} at {booking.scheduled_time}
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{booking.customer_address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        {booking.status === "completed" && booking.payment_status === "pending" && (
          <Button className="w-full" onClick={handlePayment}>
            <CreditCard className="w-4 h-4" />
            Pay {formatCurrency(booking.final_price ?? booking.estimated_price ?? 0)}
          </Button>
        )}

        {/* Review */}
        {booking.status === "completed" && !reviewed && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Rate your experience</p>
              <RatingStars rating={rating} interactive onRate={setRating} size="lg" />
              {rating > 0 && (
                <>
                  <textarea
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={2}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button className="w-full" size="sm" onClick={handleReview} disabled={reviewLoading}>
                    <Star className="w-4 h-4" />
                    Submit Review
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {reviewed && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-foreground">Review submitted. Thank you!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
