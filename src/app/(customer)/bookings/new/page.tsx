"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Car, Wrench, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle, ServiceCatalog } from "@/types";

const STEPS = [
  { icon: Wrench, label: "Service" },
  { icon: Car, label: "Vehicle" },
  { icon: Calendar, label: "Schedule" },
  { icon: MapPin, label: "Address" },
];

const CATEGORY_LABELS: Record<string, string> = {
  general_service: "General Service",
  oil_change: "Oil Change",
  tyres: "Tyres & Wheels",
  battery: "Battery",
  electrical: "Electrical",
  washing: "Wash & Clean",
  repair: "Repairs",
  other: "Other",
};

function BookingWizardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const preCategory = params.get("service_category");
  const preLatStr = params.get("lat");
  const preLngStr = params.get("lng");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedService, setSelectedService] = useState<ServiceCatalog | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>(
    preLatStr ? parseFloat(preLatStr) : undefined
  );
  const [lng, setLng] = useState<number | undefined>(
    preLngStr ? parseFloat(preLngStr) : undefined
  );
  const [notes, setNotes] = useState("");

  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/service-catalog").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
    ]).then(([catalogData, vehicleData]) => {
      const catalog: ServiceCatalog[] = catalogData.catalog ?? [];
      setServices(catalog);
      setVehicles(vehicleData.vehicles ?? []);

      // Pre-select if category came from home screen
      if (preCategory) {
        const match = catalog.find((s) => s.category === preCategory);
        if (match) setSelectedService(match);
      }
    });

    // Try to get GPS if not passed via URL
    if (!preLatStr && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleAddVehicle() {
    if (!newVehicleMake || !newVehicleModel) return;
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ make: newVehicleMake, model: newVehicleModel, fuel_type: "petrol" }),
    });
    const data = await res.json();
    if (res.ok) {
      setVehicles((v) => [data.vehicle, ...v]);
      setSelectedVehicle(data.vehicle);
      setNewVehicleMake("");
      setNewVehicleModel("");
    }
  }

  async function handleSubmit() {
    if (!selectedService || !selectedVehicle || !date || !time || !address) {
      toast.error("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          service_id: selectedService.id,
          scheduled_date: date,
          scheduled_time: time,
          customer_address: address,
          customer_lat: lat,
          customer_lng: lng,
          customer_notes: notes || undefined,
          estimated_price: selectedService.base_price ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Booking placed!", "Finding the best mechanic near you...");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const canProceed = [
    !!selectedService,
    !!selectedVehicle,
    !!(date && time),
    !!address,
  ][step];

  // Group services by category for display
  const grouped = services.reduce<Record<string, ServiceCatalog[]>>((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 py-4">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => step === 0 ? router.back() : setStep(step - 1)}>
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground">Book a Service</h1>
              <p className="text-xs text-muted-foreground">We&apos;ll find the best mechanic near you</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`step-indicator ${i < step ? "completed" : i === step ? "active" : "inactive"} w-7 h-7`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
        {/* Step 0: Service */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Choose a Service</h2>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="space-y-2">
                  {items.map((s) => (
                    <Card
                      key={s.id}
                      className={`cursor-pointer transition-all border ${selectedService?.id === s.id ? "border-primary bg-primary/5" : "border-border card-hover"}`}
                      onClick={() => setSelectedService(s)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-foreground">{s.name}</p>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                          )}
                          {s.duration_minutes && (
                            <p className="text-xs text-muted-foreground mt-0.5">{s.duration_minutes} min</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {s.base_price && (
                            <span className="font-bold text-sm text-foreground">{formatCurrency(s.base_price)}</span>
                          )}
                          {selectedService?.id === s.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Vehicle */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Select Your Vehicle</h2>
            {vehicles.length > 0 && (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <Card
                    key={v.id}
                    className={`cursor-pointer transition-all border ${selectedVehicle?.id === v.id ? "border-primary bg-primary/5" : "border-border card-hover"}`}
                    onClick={() => setSelectedVehicle(v)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">{v.make} {v.model}</p>
                        {v.year && <p className="text-xs text-muted-foreground">{v.year} · {v.fuel_type}</p>}
                      </div>
                      {selectedVehicle?.id === v.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">+ Add New Vehicle</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Brand (e.g. Honda)" value={newVehicleMake} onChange={(e) => setNewVehicleMake(e.target.value)} />
                <Input placeholder="Model (e.g. Activa)" value={newVehicleModel} onChange={(e) => setNewVehicleModel(e.target.value)} />
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddVehicle} disabled={!newVehicleMake || !newVehicleModel}>
                Add & Select
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Pick Date & Time</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <Input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Preferred Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                        time === t ? "bg-primary text-white border-primary" : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Address + Summary */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Service Location</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Address</label>
              <textarea
                className="w-full bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                placeholder="Enter your complete address where the mechanic should come..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes (Optional)</label>
              <Input placeholder="Any special instructions?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {/* Dispatch notice */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">!</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your request will be broadcast to qualified mechanics near you. The first one to accept will come to your doorstep — you&apos;ll be notified instantly.
              </p>
            </div>

            {/* Order Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service</span>
                    <span className="text-foreground">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Vehicle</span>
                    <span className="text-foreground">{selectedVehicle?.make} {selectedVehicle?.model}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Date</span>
                    <span className="text-foreground">{date} at {time}</span>
                  </div>
                  {selectedService?.base_price && (
                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                      <span>Estimated Cost</span>
                      <span className="text-primary">{formatCurrency(selectedService.base_price)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-background/90 backdrop-blur-md border-t border-border safe-bottom">
        <div className="max-w-screen-sm mx-auto">
          {step < 3 ? (
            <Button className="w-full" size="lg" disabled={!canProceed} onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="w-full" size="lg" disabled={loading || !canProceed} onClick={handleSubmit}>
              {loading ? "Finding mechanics..." : "Find a Mechanic"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BookingWizardInner />
    </Suspense>
  );
}
