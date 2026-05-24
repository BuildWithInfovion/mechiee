"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, CheckCircle2, Clock, ChevronRight, Bike, MapPin } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";

type FilterTab = "new" | "active" | "completed";
const TABS: { label: string; value: FilterTab }[] = [
  { label: "New", value: "new" },
  { label: "Active", value: "active" },
  { label: "Done", value: "completed" },
];

interface BroadcastRequest {
  id: string;
  notified_at: string;
  distance_km: number | null;
  booking: {
    id: string;
    booking_number: string;
    scheduled_date: string;
    scheduled_time: string;
    customer_address: string;
    estimated_price: number | null;
    vehicle: { make: string; model: string; year: number | null } | null;
    service: { name: string; category: string } | null;
    customer: { user: { name: string | null } | null } | null;
  };
}

export default function GarageRequestsPage() {
  const [tab, setTab] = useState<FilterTab>("new");
  const [broadcasts, setBroadcasts] = useState<BroadcastRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    const res = await fetch("/api/garage/available-requests");
    const data = await res.json();
    setBroadcasts(data.requests ?? []);
  }, []);

  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings ?? []);
  }, []);

  useEffect(() => {
    Promise.all([fetchBroadcasts(), fetchBookings()]).finally(() => setLoading(false));
  }, [fetchBroadcasts, fetchBookings]);

  // Realtime: listen for new broadcasts
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("garage-broadcasts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_broadcasts" }, () => {
        fetchBroadcasts();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "booking_broadcasts" }, () => {
        fetchBroadcasts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBroadcasts]);

  async function handleAccept(bookingId: string) {
    setAccepting(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Already taken", "Another garage accepted this request first");
        } else {
          throw new Error(data.error);
        }
        // Remove from list either way
        setBroadcasts((prev) => prev.filter((b) => b.booking.id !== bookingId));
        return;
      }
      toast.success("Request accepted!", "Customer has been notified");
      setBroadcasts((prev) => prev.filter((b) => b.booking.id !== bookingId));
      fetchBookings();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAccepting(null);
    }
  }

  const active = bookings.filter((b) => ["accepted", "dispatched", "in_progress"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 md:px-8 pt-4 pb-0">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-3">Service Requests</h1>
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                  tab === t.value ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t.label}
                {t.value === "new" && broadcasts.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                    {broadcasts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : tab === "new" ? (
          broadcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Clock className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No new requests right now</p>
              <p className="text-xs text-muted-foreground">New requests appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <BroadcastCard
                  key={b.id}
                  broadcast={b}
                  onAccept={handleAccept}
                  accepting={accepting}
                />
              ))}
            </div>
          )
        ) : tab === "active" ? (
          active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <ClipboardList className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No active jobs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          )
        ) : (
          completed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No completed jobs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function BroadcastCard({
  broadcast,
  onAccept,
  accepting,
}: {
  broadcast: BroadcastRequest;
  onAccept: (id: string) => void;
  accepting: string | null;
}) {
  const bk = broadcast.booking;
  const isAccepting = accepting === bk.id;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{bk.service?.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                New Request
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bike className="w-3.5 h-3.5" />
              <span>{bk.vehicle?.make} {bk.vehicle?.model}</span>
              {bk.vehicle?.year && <span>· {bk.vehicle.year}</span>}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {bk.customer_address.split(",").slice(0, 2).join(",")}
                {broadcast.distance_km !== null && (
                  <span className="ml-1 text-primary font-medium">
                    ({broadcast.distance_km < 1
                      ? `${Math.round(broadcast.distance_km * 1000)}m`
                      : `${broadcast.distance_km.toFixed(1)}km`} away)
                  </span>
                )}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              {new Date(bk.scheduled_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {bk.scheduled_time}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-sm font-bold text-foreground">{formatCurrency(bk.estimated_price ?? 0)}</span>
            <span className="text-xs font-mono text-muted-foreground">{bk.booking_number}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <Button
            className="w-full"
            size="sm"
            onClick={() => onAccept(bk.id)}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept This Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link href={`/garage/requests/${booking.id}`}>
      <Card className="card-hover border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{booking.service?.name}</span>
                <span className={`status-badge text-xs ${getStatusColor(booking.status)}`}>
                  <span className="status-dot bg-current" />
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(booking.customer as { user?: { name?: string } })?.user?.name} · {booking.vehicle?.make} {booking.vehicle?.model}
              </p>
              <p className="text-xs text-muted-foreground">{booking.customer_address}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(booking.scheduled_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {booking.scheduled_time}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-foreground">{formatCurrency(booking.estimated_price ?? 0)}</span>
              <span className="text-xs font-mono text-muted-foreground">{booking.booking_number}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
