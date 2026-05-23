"use client";

import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, CheckCircle, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface Booking { id: string; booking_number: string; status: string; final_price?: number; estimated_price?: number; created_at: string; service?: { name: string }; customer?: { user?: { name?: string } }; }

export default function EarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings ?? [])).finally(() => setLoading(false));
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");
  const pending = bookings.filter((b) => b.status === "pending");
  const totalEarnings = completed.reduce((s, b) => s + (b.final_price ?? b.estimated_price ?? 0), 0);
  const pendingPayout = pending.reduce((s, b) => s + (b.estimated_price ?? 0), 0);
  const avgOrder = completed.length > 0 ? Math.round(totalEarnings / completed.length) : 0;

  // Group by month for chart
  const monthlyMap: Record<string, number> = {};
  completed.forEach((b) => {
    const month = new Date(b.created_at).toLocaleString("en-IN", { month: "short" });
    monthlyMap[month] = (monthlyMap[month] ?? 0) + (b.final_price ?? b.estimated_price ?? 0);
  });
  const chartData = Object.entries(monthlyMap).map(([month, earnings]) => ({ month, earnings })).slice(-6);

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Earnings</h1>
        <p className="text-muted-foreground text-sm mb-6">Track your revenue and payouts</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Total Earned", value: `₹${totalEarnings.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-success" },
            { label: "Pending Payout", value: `₹${pendingPayout.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-warning" },
            { label: "Jobs Done", value: String(completed.length), icon: CheckCircle, color: "text-primary" },
            { label: "Avg. Order", value: `₹${avgOrder}`, icon: TrendingUp, color: "text-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2"><Icon className={cn("w-4 h-4", color)} /><span className="text-xs text-muted-foreground">{label}</span></div>
              <p className="text-2xl font-bold text-foreground">{loading ? "…" : value}</p>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="glass-card p-4 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D35" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A1F", border: "1px solid #2D2D35", borderRadius: 8, color: "#F4F4F5" }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Earnings"]} />
                <Bar dataKey="earnings" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Completed Jobs</h2>
          {loading ? <div className="h-40 bg-card rounded-xl animate-pulse" /> : completed.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No completed jobs yet</div>
          ) : (
            <div className="space-y-2">
              {completed.slice(0, 10).map((b) => (
                <div key={b.id} className="glass-card p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center flex-none">
                    <IndianRupee className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{(b.customer as { user?: { name?: string } })?.user?.name ?? "Customer"}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.service?.name} · {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="text-right flex-none">
                    <p className="text-sm font-semibold text-foreground">₹{(b.final_price ?? b.estimated_price ?? 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-success">Paid</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
