"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const SERVICE_TYPES = [
  { value: "general_service", label: "General Service" },
  { value: "oil_change", label: "Oil Change" },
  { value: "tyres", label: "Tyres & Wheels" },
  { value: "battery", label: "Battery" },
  { value: "electrical", label: "Electrical" },
  { value: "washing", label: "Wash & Detailing" },
  { value: "repair", label: "Major Repairs" },
];

const VEHICLE_BRANDS = [
  { value: "honda", label: "Honda" },
  { value: "yamaha", label: "Yamaha" },
  { value: "tvs", label: "TVS" },
  { value: "hero", label: "Hero" },
  { value: "bajaj", label: "Bajaj" },
  { value: "royal_enfield", label: "Royal Enfield" },
  { value: "suzuki", label: "Suzuki" },
  { value: "kawasaki", label: "Kawasaki" },
  { value: "other", label: "Other" },
];

const STEP_LABELS = ["Details", "Location", "Services", "Specialties"];

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
    vehicle_specialties: [] as string[],
    service_specialties: [] as string[],
  });

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleArray(key: "services" | "vehicle_specialties" | "service_specialties", val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
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
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone,
          whatsapp_number: form.whatsapp_number,
          address: form.address,
          lat: form.lat,
          lng: form.lng,
          city: form.city,
          area: form.area,
          pincode: form.pincode,
          services: form.services,
          vehicle_specialties: form.vehicle_specialties,
          service_specialties: form.service_specialties,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(4);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 4) {
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
            {STEP_LABELS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-full h-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-secondary"}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{STEP_LABELS[step]}</p>
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

        {/* Step 2: Services Offered */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Services Offered</h2>
            <p className="text-sm text-muted-foreground">Select all services your garage provides:</p>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => toggleArray("services", s.value)}
                  className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                    form.services.includes(s.value)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{s.label}</span>
                    {form.services.includes(s.value) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Specialties */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="section-title">Vehicle Specialties</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Which bike brands does your garage specialize in? Leave all unchecked to accept all brands.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_BRANDS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => toggleArray("vehicle_specialties", b.value)}
                    className={`p-2.5 rounded-xl text-center text-sm font-medium transition-all border ${
                      form.vehicle_specialties.includes(b.value)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {form.vehicle_specialties.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No selection = accepts all brands</p>
              )}
            </div>

            <div>
              <h2 className="section-title">Service Specialties</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Which types of services does your garage specialize in? Leave all unchecked to accept all.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleArray("service_specialties", s.value)}
                    className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                      form.service_specialties.includes(s.value)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{s.label}</span>
                      {form.service_specialties.includes(s.value) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
              {form.service_specialties.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No selection = accepts all service types</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-background/90 backdrop-blur-md border-t border-border safe-bottom">
        <div className="max-w-screen-sm mx-auto">
          {step < 3 ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && form.services.length === 0}
            >
              Continue
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
