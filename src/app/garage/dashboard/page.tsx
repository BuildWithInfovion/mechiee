"use client";

import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, IndianRupee, Star, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Booking } from "@/types";

export default function GarageDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) => ["accepted", "dispatched", "in_progress"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const revenue = completed.reduce((sum, b) => sum + (b.final_price ?? b.estimated_price ?? 0), 0);

  const stats = [
    { label: "Pending", value: pending.length, icon: Clock, color: "text-yellow-400" },
    { label: "Active", value: active.length, icon: TrendingUp, color: "text-blue-400" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Revenue", value: formatCurrency(revenue), icon: IndianRupee, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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
                <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0">New Requests</h2>
              <Link href="/garage/requests">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {pending.slice(0, 3).map((b) => <BookingRow key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Active */}
        {active.length > 0 && (
          <div>
            <h2 className="section-title">Active Jobs</h2>
            <div className="space-y-3">
              {active.map((b) => <BookingRow key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {pending.length === 0 && active.length === 0 && !loading && (
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
                <p className="text-sm font-semibold text-foreground truncate">
                  {booking.service?.name}
                </p>
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
