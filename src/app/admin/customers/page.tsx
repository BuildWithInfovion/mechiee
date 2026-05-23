"use client";

import { useState, useEffect } from "react";
import { Users, Phone, Calendar, ShoppingBag, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer { id: string; name: string; phone: string; is_active: boolean; created_at: string; booking_count: number; last_booking_at?: string; }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const matchSearch = search === "" || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchFilter = filter === "all" || (filter === "active" && c.is_active) || (filter === "inactive" && !c.is_active);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Customers</h1>
        <p className="text-muted-foreground text-sm mb-6">Manage all registered customers</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{customers.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-success">{customers.filter(c=>c.is_active).length}</p><p className="text-xs text-muted-foreground">Active</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{customers.reduce((s,c)=>s+c.booking_count,0)}</p><p className="text-xs text-muted-foreground">Bookings</p></div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>

        <div className="flex gap-2 mb-4">
          {(["all","active","inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize", filter === f ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border")}>
              {f === "all" ? `All (${customers.length})` : f === "active" ? `Active (${customers.filter(c=>c.is_active).length})` : `Inactive (${customers.filter(c=>!c.is_active).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-card rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" /><p className="text-muted-foreground text-sm">No customers found</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="glass-card p-4 flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-none", c.is_active ? "bg-primary/10" : "bg-muted/20")}>
                  <Users className={cn("w-5 h-5", c.is_active ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name || "â€”"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Phone className="w-3 h-3" /><span>+91 {c.phone.replace(/^91/,"")}</span></div>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", c.is_active ? "text-success bg-success/10 border-success/20" : "text-muted-foreground bg-muted/10 border-muted/20")}>{c.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(c.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                    <div className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{c.booking_count} booking{c.booking_count!==1?"s":""}</div>
                    {c.last_booking_at && <span>Last: {new Date(c.last_booking_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>}
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

