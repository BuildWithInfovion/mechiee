"use client";

import { useState, useEffect } from "react";
import {
  Building2, Users, CalendarDays, IndianRupee,
  Clock, CheckCircle2, TrendingUp, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface AdminStats {
  total_garages: number;
  pending_garages: number;
  total_customers: number;
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<object[]>([]);
  const [pendingGarages, setPendingGarages] = useState<object[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
      fetch("/api/garages?status=pending").then((r) => r.json()).catch(() => ({ garages: [] })),
    ]).then(([statsData, bookingsData, garagesData]) => {
      setStats(statsData ?? {
        total_garages: 0, pending_garages: 0, total_customers: 0,
        total_bookings: 0, completed_bookings: 0, pending_bookings: 0, total_revenue: 0,
      });
      setRecentBookings((bookingsData.bookings ?? []).slice(0, 5));
      setPendingGarages((garagesData.garages ?? []).filter((g: { status: string }) => g.status === "pending").slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Garages", value: stats?.total_garages ?? 0, icon: Building2, sub: `${stats?.pending_garages ?? 0} pending approval`, color: "text-blue-400" },
    { label: "Customers", value: stats?.total_customers ?? 0, icon: Users, color: "text-purple-400" },
    { label: "Total Bookings", value: stats?.total_bookings ?? 0, icon: CalendarDays, sub: `${stats?.completed_bookings ?? 0} completed`, color: "text-emerald-400" },
    { label: "Platform Revenue", value: formatCurrency(stats?.total_revenue ?? 0), icon: IndianRupee, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Mechiee Platform Overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border stat-card">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {s.sub && <p className="text-xs text-muted-foreground/60">{s.sub}</p>}
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Pending Garage Approvals */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Pending Approvals
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/garages">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingGarages.length === 0 ? (
                <div className="flex items-center gap-2 py-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <p className="text-sm text-muted-foreground">All garages reviewed</p>
                </div>
              ) : (
                pendingGarages.map((g: object) => {
                  const garage = g as { id: string; name: string; city?: string; area?: string };
                  return (
                    <Link key={garage.id} href={`/admin/garages/${garage.id}`}>
                      <div className="flex items-center justify-between py-2 hover:bg-secondary/40 rounded-lg px-2 -mx-2 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-foreground">{garage.name}</p>
                          <p className="text-xs text-muted-foreground">{garage.area ?? garage.city}</p>
                        </div>
                        <Badge variant="pending">Review</Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Recent Bookings
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/bookings">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No bookings yet</p>
              ) : (
                recentBookings.map((b: object) => {
                  const booking = b as { id: string; booking_number: string; status: string; estimated_price?: number; service?: { name?: string } };
                  return (
                    <div key={booking.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">{booking.booking_number}</p>
                        <p className="text-sm text-foreground">{booking.service?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{formatCurrency(booking.estimated_price ?? 0)}</p>
                        <span className={`text-xs font-medium ${booking.status === "completed" ? "text-emerald-400" : booking.status === "pending" ? "text-yellow-400" : "text-blue-400"}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
