"use client";

import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, Bike } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, timeAgo, formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types";

type FilterTab = "all" | "active" | "completed";

const TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const ACTIVE_STATUSES = ["pending", "accepted", "dispatched", "in_progress"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (tab === "active") return ACTIVE_STATUSES.includes(b.status);
    if (tab === "completed") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border">
        <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-0">
          <h1 className="text-xl font-bold text-foreground mb-3">My Bookings</h1>
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                  tab === t.value
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CalendarDays className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No bookings yet</p>
            <Button asChild size="sm">
              <Link href="/bookings/new">Book a Service</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const isPending = booking.status === "pending" && !booking.garage_id;

  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="card-hover border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs text-muted-foreground font-mono">{booking.booking_number}</p>
              <h3 className="font-semibold text-sm text-foreground mt-0.5">
                {booking.service?.name ?? "Service"}
              </h3>
            </div>
            <span className={`status-badge ${getStatusColor(booking.status)}`}>
              <span className="status-dot bg-current" />
              {isPending ? "Searching..." : getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Bike className="w-3.5 h-3.5" />
            {booking.garage_id && booking.garage ? (
              <span>{booking.garage.name}</span>
            ) : (
              <span className="italic">Finding mechanic...</span>
            )}
            <span>·</span>
            <span>{booking.vehicle?.make} {booking.vehicle?.model}</span>
          </div>

          {(booking.status === "completed" || booking.status === "accepted") && booking.garage && (
            <div className="text-xs text-emerald-400 font-medium mb-2">
              {booking.status === "completed" ? "Serviced by" : "Assigned to"}: {booking.garage.name}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {new Date(booking.scheduled_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })} at {booking.scheduled_time}
            </div>
            <div className="flex items-center gap-2">
              {booking.estimated_price && (
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(booking.estimated_price)}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

