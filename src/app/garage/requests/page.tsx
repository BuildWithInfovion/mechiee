"use client";

import { useState, useEffect } from "react";
import { ClipboardList, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

type FilterTab = "pending" | "active" | "completed" | "all";
const TABS: { label: string; value: FilterTab }[] = [
  { label: "New", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Done", value: "completed" },
  { label: "All", value: "all" },
];

export default function GarageRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("pending");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (tab === "pending") return b.status === "pending";
    if (tab === "active") return ["accepted", "dispatched", "in_progress"].includes(b.status);
    if (tab === "completed") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
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
                {t.value === "pending" && bookings.filter((b) => b.status === "pending").length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                    {bookings.filter((b) => b.status === "pending").length}
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
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No requests here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => <RequestCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ booking }: { booking: Booking }) {
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
                {(booking.customer as { user?: { name?: string } })?.user?.name} &middot; {booking.vehicle?.make} {booking.vehicle?.model}
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
