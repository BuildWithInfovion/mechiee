"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Clock, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "general_service", label: "General Service" },
  { id: "tyres", label: "Tyres" },
  { id: "battery", label: "Battery" },
  { id: "washing", label: "Washing" },
  { id: "repair", label: "Repairs" },
];

interface Garage {
  id: string;
  name: string;
  area?: string;
  city?: string;
  rating: number;
  total_reviews: number;
  distance_km?: number;
  status: string;
  logo_url?: string;
}

export default function GaragesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const fetchGarages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: String(coords.lat), lng: String(coords.lng), radius: "25" });
      if (category !== "all") params.set("category", category);
      const res = await fetch(`/api/garages?${params}`);
      const data = await res.json();
      setGarages(data.garages ?? []);
    } finally {
      setLoading(false);
    }
  }, [coords, category]);

  useEffect(() => { fetchGarages(); }, [fetchGarages]);

  const filtered = garages.filter((g) =>
    search === "" ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.area ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3 space-y-3">
        <h1 className="text-xl font-bold text-foreground">Find Garages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex-none px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                category === cat.id ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">{filtered.length} garage{filtered.length !== 1 ? "s" : ""} found near you</p>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">No garages found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((garage) => (
                  <Link key={garage.id} href={`/garages/${garage.id}`} className="block glass-card p-4 card-hover">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-none overflow-hidden">
                        {garage.logo_url
                          ? <img src={garage.logo_url} alt={garage.name} className="w-full h-full object-cover" />
                          : <Wrench className="w-6 h-6 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{garage.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{garage.area}{garage.city ? `, ${garage.city}` : ""}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-none mt-0.5" />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span className="text-xs font-medium text-foreground">{garage.rating?.toFixed(1) ?? "New"}</span>
                            {garage.total_reviews > 0 && <span className="text-xs text-muted-foreground">({garage.total_reviews})</span>}
                          </div>
                          {garage.distance_km !== undefined && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {garage.distance_km < 1 ? `${Math.round(garage.distance_km * 1000)}m` : `${garage.distance_km.toFixed(1)}km`}
                              </span>
                            </div>
                          )}
                          <span className={cn("text-xs font-medium", garage.status === "active" ? "text-success" : "text-muted-foreground")}>
                            {garage.status === "active" ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

