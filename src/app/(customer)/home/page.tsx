"use client";

import { useState, useEffect } from "react";
import { MapPin, Bell, ChevronRight, Wrench, Droplets, Circle, Zap, Wind, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SERVICE_CATEGORIES = [
  { label: "General Service", value: "general_service", icon: Settings, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { label: "Oil Change", value: "oil_change", icon: Droplets, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { label: "Tyres & Wheels", value: "tyres", icon: Circle, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { label: "Battery", value: "battery", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { label: "Electrical", value: "electrical", icon: Wind, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { label: "Wash & Clean", value: "washing", icon: Wind, color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
];

export default function CustomerHomePage() {
  const [searchCity, setSearchCity] = useState("Locating...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchCity("Near you");
        },
        () => {
          setSearchCity("India");
          setCoords({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      setSearchCity("India");
      setCoords({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  function buildBookingUrl(category: string) {
    const base = `/bookings/new?service_category=${category}`;
    if (coords) return `${base}&lat=${coords.lat}&lng=${coords.lng}`;
    return base;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Mechiee" className="w-64 h-auto mix-blend-screen" />
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
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-5">
        {/* Hero CTA */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="relative">
            <Badge variant="default" className="mb-2 text-xs">Doorstep Service</Badge>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Bike service,<br />at your doorstep
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Book a service — we&apos;ll find the best mechanic near you
            </p>
            <Link href={coords ? `/bookings/new?lat=${coords.lat}&lng=${coords.lng}` : "/bookings/new"}>
              <Button size="sm">
                Book Now <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Service Categories */}
        <div>
          <h3 className="section-title mb-3">What do you need?</h3>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.value} href={buildBookingUrl(cat.value)}>
                  <Card className={`card-hover border ${cat.bg} cursor-pointer`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">{cat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h3 className="section-title mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Choose a service type" },
              { step: "2", text: "Add your vehicle & schedule" },
              { step: "3", text: "We broadcast to mechanics near you" },
              { step: "4", text: "First to accept comes to your doorstep" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{item.step}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick link to bookings */}
        <Link href="/bookings">
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">My Bookings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}
