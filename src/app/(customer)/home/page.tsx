"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, Bell, Bike, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Garage } from "@/types";

const SERVICE_CHIPS = [
  { label: "General Service", value: "general_service" },
  { label: "Oil Change", value: "oil_change" },
  { label: "Tyres", value: "tyres" },
  { label: "Battery", value: "battery" },
  { label: "Wash", value: "washing" },
];

export default function CustomerHomePage() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState("Locating...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(pos.coords);
          setSearchCity("Near you");
          fetchGarages(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setSearchCity("India");
          fetchGarages(12.9716, 77.5946); // Bangalore fallback
        }
      );
    } else {
      fetchGarages(12.9716, 77.5946);
      setSearchCity("India");
    }
  }, []);

  async function fetchGarages(lat: number, lng: number, category?: string | null) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (category) params.set("category", category);
      const res = await fetch(`/api/garages?${params}`);
      const data = await res.json();
      setGarages(data.garages ?? []);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterClick(value: string) {
    const next = activeFilter === value ? null : value;
    setActiveFilter(next);
    const lat = location?.latitude ?? 12.9716;
    const lng = location?.longitude ?? 77.5946;
    fetchGarages(lat, lng, next);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Mechiee" className="h-8 w-auto invert" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{searchCity}</span>
              </div>
            </div>
            <Link href="/notifications">
              <Button variant="ghost" size="icon-sm">
                <Bell className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Search bar */}
          <Link href="/garages">
            <div className="flex items-center gap-3 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/50 transition-colors">
              <Search className="w-4 h-4" />
              <span>Search garages, services...</span>
            </div>
          </Link>
        </div>

        {/* Filter chips */}
        <div className="max-w-screen-sm mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {SERVICE_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleFilterClick(chip.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeFilter === chip.value
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
        {/* Hero CTA */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="relative">
            <Badge variant="default" className="mb-2 text-xs">Doorstep Service</Badge>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Bike service,<br />at your doorstep
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Book from {garages.length > 0 ? `${garages.length}+ garages` : "nearby garages"} near you
            </p>
            <Link href="/bookings/new">
              <Button size="sm">
                Book Now <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Nearby Garages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">Nearby Garages</h3>
            <Link href="/garages" className="text-xs text-primary font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : garages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No garages found nearby</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {garages.slice(0, 8).map((garage) => (
                <GarageCard key={garage.id} garage={garage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GarageCard({ garage }: { garage: Garage }) {
  return (
    <Link href={`/garages/${garage.id}`}>
      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {garage.logo_url ? (
                <img src={garage.logo_url} alt={garage.name} className="w-full h-full object-cover" />
              ) : (
                <Bike className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm text-foreground truncate">{garage.name}</h4>
                <Badge variant={garage.status === "active" ? "success" : "secondary"} className="text-xs flex-shrink-0">
                  {garage.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{garage.area ?? garage.city ?? garage.address}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-foreground">{garage.rating?.toFixed(1) ?? "New"}</span>
                  {garage.total_reviews > 0 && (
                    <span className="text-xs text-muted-foreground">({garage.total_reviews})</span>
                  )}
                </div>
                {garage.distance_km !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {garage.distance_km < 1
                      ? `${Math.round(garage.distance_km * 1000)}m away`
                      : `${garage.distance_km.toFixed(1)}km away`}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

