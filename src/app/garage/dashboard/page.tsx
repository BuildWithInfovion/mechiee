"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, CheckCircle2, IndianRupee, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";

interface BroadcastSummary {
  id: string;
  booking: {
    id: string;
    booking_number: string;
    scheduled_date: string;
    scheduled_time: string;
    estimated_price: number | null;
    service: { name: string } | null;
    vehicle: { make: string; model: string } | null;
  };
  distance_km: number | null;
}

export default function GarageDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetch("/api/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings ?? [])),
      fetch("/api/garage/available-requests").then((r) => r.json()).then((d) => setBroadcasts(d.requests ?? [])),
    ]);
  }, []);

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  // Realtime for new broadcasts
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-broadcasts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_broadcasts" }, () => {
        fetch("/api/garage/available-requests").then((r) => r.json()).then((d) => setBroadcasts(d.requests ?? []));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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
        setBroadcasts((prev) => prev.filter((b) => b.booking.id !== bookingId));
        return;
      }
      toast.success("Request accepted!", "Customer has been notified");
      setBroadcasts((prev) => prev.filter((b) => b.booking.id !== bookingId));
      fetch("/api/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings ?? []));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAccepting(null);
    }
  }

  const active = bookings.filter((b) => ["accepted", "dispatched", "in_progress"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const revenue = completed.reduce((sum, b) => sum + (b.final_price ?? b.estimated_price ?? 0), 0);

  const stats = [
    { label: "New Requests", value: broadcasts.length, icon: Clock, color: "text-yellow-400" },
    { label: "Active", value: active.length, icon: TrendingUp, color: "text-blue-400" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Revenue", value: formatCurrency(revenue), icon: IndianRupee, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 md:pl-68">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your garage operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="stat-card border-border">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Pending Broadcasts */}
        {broadcasts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0">
                New Requests
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">{broadcasts.length}</span>
              </h2>
              <Link href="/garage/requests">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {broadcasts.slice(0, 3).map((b) => (
                <Card key={b.id} className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{b.booking.service?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.booking.vehicle?.make} {b.booking.vehicle?.model}
                          {b.distance_km !== null && (
                            <span className="ml-1 text-primary">
                              · {b.distance_km < 1
                                ? `${Math.round(b.distance_km * 1000)}m`
                                : `${b.distance_km.toFixed(1)}km`} away
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.booking.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {b.booking.scheduled_time}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(b.booking.estimated_price ?? 0)}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(b.booking.id)}
                          disabled={accepting === b.booking.id}
                          className="text-xs h-7"
                        >
                          {accepting === b.booking.id ? "..." : "Accept"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        {active.length > 0 && (
          <div>
            <h2 className="section-title">Active Jobs</h2>
            <div className="space-y-3">
              {active.map((b) => <BookingRow key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {broadcasts.length === 0 && active.length === 0 && !loading && (
          <Card className="border-dashed border-border">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <ClipboardList className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No active requests right now</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link href={`/garage/requests/${booking.id}`}>
      <Card className="card-hover border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{booking.service?.name}</p>
                <span className={`status-badge text-xs ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(booking.customer as { user?: { name?: string } })?.user?.name} · {booking.vehicle?.make} {booking.vehicle?.model}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(booking.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {booking.scheduled_time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{formatCurrency(booking.estimated_price ?? 0)}</p>
              <p className="text-xs font-mono text-muted-foreground">{booking.booking_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
