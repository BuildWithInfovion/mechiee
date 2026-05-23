"use client";

import { useState, useEffect } from "react";
import { Building2, CheckCircle2, XCircle, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";
import type { Garage, GarageStatus } from "@/types";

type Filter = GarageStatus | "all";
const TABS: { label: string; value: Filter }[] = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "All", value: "all" },
];

export default function AdminGaragesPage() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/garages")
      .then((r) => r.json())
      .then((d) => setGarages(d.garages ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = garages
    .filter((g) => filter === "all" || g.status === filter)
    .filter((g) =>
      search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.city ?? "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 md:px-8 pt-4 pb-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-3">Garages</h1>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search garages..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-1">
            {TABS.map((t) => {
              const count = t.value !== "all" ? garages.filter((g) => g.status === t.value).length : garages.length;
              return (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${filter === t.value ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {t.label}
                  {count > 0 && <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${t.value === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Building2 className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No garages found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((garage) => (
              <Link key={garage.id} href={`/admin/garages/${garage.id}`}>
                <Card className="card-hover border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{garage.name}</p>
                          <span className={`status-badge text-xs ${getStatusColor(garage.status)}`}>
                            <span className="status-dot bg-current" />
                            {garage.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{garage.area ?? garage.city} Â· {garage.pincode}</p>
                        <p className="text-xs text-muted-foreground">{garage.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">â˜… {garage.rating?.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">{garage.total_jobs} jobs</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

