"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Car, Wrench, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle, GarageService, Garage } from "@/types";

const STEPS = [
  { icon: Wrench, label: "Service" },
  { icon: Car, label: "Vehicle" },
  { icon: Calendar, label: "Schedule" },
  { icon: MapPin, label: "Address" },
];

function BookingWizardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const garageId = params.get("garage_id");
  const preServiceId = params.get("service_id");
  const prePrice = params.get("price");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<GarageService[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedService, setSelectedService] = useState<GarageService | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();
  const [notes, setNotes] = useState("");

  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");

  useEffect(() => {
    if (!garageId) { router.push("/garages"); return; }

    Promise.all([
      fetch(`/api/garages/${garageId}`).then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
    ]).then(([garageData, vehicleData]) => {
      setGarage(garageData.garage);
      const gs = garageData.garage?.garage_services?.filter((s: GarageService) => s.is_available) ?? [];
      setServices(gs);
      setVehicles(vehicleData.vehicles ?? []);

      if (preServiceId && prePrice) {
        const found = gs.find((s: GarageService) => s.service_id === preServiceId);
        if (found) setSelectedService(found);
      }
    });

    navigator.geolocation?.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }, [garageId, preServiceId, prePrice, router]);

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
          garage_id: garageId,
          vehicle_id: selectedVehicle.id,
          service_id: selectedService.service_id,
          scheduled_date: date,
          scheduled_time: time,
          customer_address: address,
          customer_lat: lat,
          customer_lng: lng,
          customer_notes: notes,
          estimated_price: selectedService.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Booking placed!", "The garage will confirm shortly");
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border px-4 py-4">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => step === 0 ? router.back() : setStep(step - 1)}>
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground">Book Service</h1>
              {garage && <p className="text-xs text-muted-foreground">{garage.name}</p>}
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
          <div className="space-y-3 animate-fade-in">
            <h2 className="section-title">Choose a Service</h2>
            {services.map((gs) => (
              <Card
                key={gs.id}
                className={`cursor-pointer transition-all border ${selectedService?.id === gs.id ? "border-primary bg-primary/5" : "border-border card-hover"}`}
                onClick={() => setSelectedService(gs)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{gs.service?.name}</p>
                    {gs.duration_minutes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{gs.duration_minutes} minutes</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{formatCurrency(gs.price)}</span>
                    {selectedService?.id === gs.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                </CardContent>
              </Card>
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
                        {v.year && <p className="text-xs text-muted-foreground">{v.year} Â· {v.fuel_type}</p>}
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

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="section-title">Service Location</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Address</label>
              <textarea
                className="w-full bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                placeholder="Enter your complete address where mechanic should come..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes (Optional)</label>
              <Input placeholder="Any special instructions?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {/* Order Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service</span>
                    <span className="text-foreground">{selectedService?.service?.name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Vehicle</span>
                    <span className="text-foreground">{selectedVehicle?.make} {selectedVehicle?.model}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Date</span>
                    <span className="text-foreground">{date} at {time}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                    <span>Estimated Cost</span>
                    <span className="text-primary">{formatCurrency(selectedService?.price ?? 0)}</span>
                  </div>
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
            <Button
              className="w-full"
              size="lg"
              disabled={!canProceed}
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={loading || !canProceed}
              onClick={handleSubmit}
            >
              {loading ? "Placing Booking..." : "Confirm Booking"}
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

