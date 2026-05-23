"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Star, IndianRupee, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking { id: string; booking_number: string; status: string; final_price?: number; estimated_price?: number; scheduled_date: string; scheduled_time: string; service?: { name: string }; vehicle?: { make: string; model: string }; customer?: { user?: { name?: string } }; }

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => <Star key={i} className={cn("w-3 h-3", i <= rating ? "text-warning fill-warning" : "text-muted-foreground")} />)}
    </div>
  );
}

export default function GarageHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/bookings").then((r) => r.json()).then((d) => {
      const done = (d.bookings ?? []).filter((b: Booking) => b.status === "completed" || b.status === "cancelled");
      setBookings(done);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) =>
    search === "" ||
    b.booking_number.toLowerCase().includes(search.toLowerCase()) ||
    (b.customer as { user?: { name?: string } })?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.service?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.final_price ?? b.estimated_price ?? 0), 0);

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Job History</h1>
        <p className="text-muted-foreground text-sm mb-5">All completed service jobs</p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{bookings.filter(b=>b.status==="completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">₹{(totalRevenue/1000).toFixed(1)}k</p><p className="text-xs text-muted-foreground">Revenue</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{bookings.filter(b=>b.status==="cancelled").length}</p><p className="text-xs text-muted-foreground">Cancelled</p></div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by customer, service, or booking ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" /><p className="text-muted-foreground text-sm">{search ? "No jobs match your search" : "No completed jobs yet"}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div key={job.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={cn("w-4 h-4", job.status === "completed" ? "text-success" : "text-muted-foreground")} />
                      <span className="text-xs text-muted-foreground font-mono">{job.booking_number}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-1">{(job.customer as { user?: { name?: string } })?.user?.name ?? "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{job.vehicle?.make} {job.vehicle?.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-sm font-bold text-foreground"><IndianRupee className="w-3.5 h-3.5" />{(job.final_price ?? job.estimated_price ?? 0).toLocaleString("en-IN")}</div>
                    <p className={cn("text-xs mt-0.5", job.status === "completed" ? "text-success" : "text-muted-foreground")}>{job.status === "completed" ? "Paid" : "Cancelled"}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{job.service?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{new Date(job.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {job.scheduled_time}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
