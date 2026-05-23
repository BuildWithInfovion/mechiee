"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, MapPin, Phone, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const SERVICES = [
  "general_service", "repair", "tyres", "battery", "washing", "other"
];
const SERVICE_LABELS: Record<string, string> = {
  general_service: "General Service",
  repair: "Repairs",
  tyres: "Tyres",
  battery: "Battery",
  washing: "Washing",
  other: "Other",
};

export default function GarageRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp_number: "",
    address: "",
    lat: 12.9716,
    lng: 77.5946,
    city: "",
    area: "",
    pincode: "",
    services: [] as string[],
  });

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  }

  function useGps() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      update("lat", pos.coords.latitude);
      update("lng", pos.coords.longitude);
      toast.success("Location captured!");
    });
  }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/garages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(3);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Application Submitted!</h1>
          <p className="text-muted-foreground text-sm">
            Our team will review your garage registration within 24 hours. We will notify you via WhatsApp once approved.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 py-4">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bike className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Register Your Garage</span>
          </div>
          <div className="flex gap-1">
            {["Details", "Location", "Services"].map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-secondary"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
        {/* Step 0: Basic Details */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Garage Information</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Garage Name *</Label>
                <Input placeholder="e.g. Kumar Auto Service" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea
                  className="w-full bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                  placeholder="Brief description of your garage..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input placeholder="98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp *</Label>
                  <Input placeholder="98765 43210" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Garage Location</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Address *</Label>
                <textarea
                  className="w-full bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                  placeholder="Shop No, Street, Locality..."
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <Input placeholder="Bengaluru" value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Area</Label>
                  <Input placeholder="Koramangala" value={form.area} onChange={(e) => update("area", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input placeholder="560001" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
              </div>
              <Button variant="outline" onClick={useGps} className="w-full">
                <MapPin className="w-4 h-4" />
                Use My Current Location (GPS)
              </Button>
              {form.lat !== 12.9716 && (
                <p className="text-xs text-emerald-400">GPS location captured: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Services Offered</h2>
            <p className="text-sm text-muted-foreground">Select all services your garage provides:</p>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                    form.services.includes(s)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{SERVICE_LABELS[s]}</span>
                    {form.services.includes(s) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-background/90 backdrop-blur-md border-t border-border safe-bottom">
        <div className="max-w-screen-sm mx-auto">
          {step < 2 ? (
            <Button className="w-full" size="lg" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || form.services.length === 0}
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
