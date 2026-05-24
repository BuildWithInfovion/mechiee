"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, MessageCircle, Clock, Save, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

interface DayHours {
  open: string;
  close: string;
  is_open: boolean;
}

const DEFAULT_HOURS: Record<string, DayHours> = {
  Monday:    { open: "09:00", close: "19:00", is_open: true },
  Tuesday:   { open: "09:00", close: "19:00", is_open: true },
  Wednesday: { open: "09:00", close: "19:00", is_open: true },
  Thursday:  { open: "09:00", close: "19:00", is_open: true },
  Friday:    { open: "09:00", close: "19:00", is_open: true },
  Saturday:  { open: "09:00", close: "17:00", is_open: true },
  Sunday:    { open: "09:00", close: "13:00", is_open: false },
};

export default function GarageProfilePage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp_number: "",
    address: "",
    city: "",
    area: "",
    pincode: "",
  });
  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS);
  const [vehicleSpecialties, setVehicleSpecialties] = useState<string[]>([]);
  const [serviceSpecialties, setServiceSpecialties] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/garage/profile")
      .then((r) => r.json())
      .then(({ garage }) => {
        if (garage) {
          setForm({
            name: garage.name ?? "",
            description: garage.description ?? "",
            phone: (garage.phone ?? "").replace("+91", ""),
            whatsapp_number: (garage.whatsapp_number ?? "").replace("+91", ""),
            address: garage.address ?? "",
            city: garage.city ?? "",
            area: garage.area ?? "",
            pincode: garage.pincode ?? "",
          });
          if (garage.operating_hours) {
            setHours({ ...DEFAULT_HOURS, ...garage.operating_hours });
          }
          if (garage.vehicle_specialties) setVehicleSpecialties(garage.vehicle_specialties);
          if (garage.service_specialties) setServiceSpecialties(garage.service_specialties);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleDay(day: string) {
    setHours((h) => ({ ...h, [day]: { ...h[day], is_open: !h[day].is_open } }));
  }

  function updateHour(day: string, field: "open" | "close", value: string) {
    setHours((h) => ({ ...h, [day]: { ...h[day], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/garage/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone ? `+91${form.phone}` : undefined,
          whatsapp_number: form.whatsapp_number ? `+91${form.whatsapp_number}` : undefined,
          address: form.address,
          city: form.city,
          area: form.area,
          pincode: form.pincode,
          operating_hours: hours,
          vehicle_specialties: vehicleSpecialties,
          service_specialties: serviceSpecialties,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      toast.success("Profile saved!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background md:pl-60 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pl-60 pb-10">
      <div className="p-4 md:p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Garage Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">Update your garage profile and operating hours</p>

        {/* Banner + Logo */}
        <div className="glass-card mb-5 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10 relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 text-primary/80 text-sm">
              <Camera className="w-4 h-4" />
              Upload Banner
            </div>
          </div>
          <div className="px-4 pb-4 -mt-6 flex items-end gap-3">
            <div className="w-14 h-14 rounded-xl bg-card border-2 border-background flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Upload logo</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="glass-card p-4 mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground mb-1">Basic Information</h2>

          {[
            { label: "Garage Name", field: "name", placeholder: "Your Garage Name" },
            { label: "City", field: "city", placeholder: "Bengaluru" },
            { label: "Area / Locality", field: "area", placeholder: "Koramangala" },
            { label: "Pincode", field: "pincode", placeholder: "560034" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input
                type="text"
                value={form[field as keyof typeof form]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Full Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Tell customers about your garage..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card p-4 mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground mb-1">Contact</h2>

          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
              <span className="text-muted-foreground text-sm">+91</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> WhatsApp Number
            </label>
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
              <span className="text-muted-foreground text-sm">+91</span>
              <input
                type="tel"
                value={form.whatsapp_number}
                onChange={(e) => handleChange("whatsapp_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operating hours */}
        <div className="glass-card p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Operating Hours
          </h2>

          <div className="space-y-2">
            {DAYS.map((day) => {
              const d = hours[day];
              return (
                <div key={day} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-5 rounded-full transition-colors flex-none relative ${d.is_open ? "bg-primary" : "bg-muted/30"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${d.is_open ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-foreground w-24 flex-none">{day.slice(0, 3)}</span>
                  {d.is_open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={d.open}
                        onChange={(e) => updateHour(day, "open", e.target.value)}
                        className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={d.close}
                        onChange={(e) => updateHour(day, "close", e.target.value)}
                        className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle Specialties */}
        <div className="glass-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">Vehicle Specialties</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Select bike brands you specialize in. Leave all unchecked to accept all brands.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLE_BRANDS.map((b) => (
              <button
                key={b.value}
                onClick={() => setVehicleSpecialties((prev) =>
                  prev.includes(b.value) ? prev.filter((x) => x !== b.value) : [...prev, b.value]
                )}
                className={`p-2.5 rounded-xl text-center text-xs font-medium transition-all border ${
                  vehicleSpecialties.includes(b.value)
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span>{b.label}</span>
                {vehicleSpecialties.includes(b.value) && <CheckCircle2 className="w-3 h-3 text-primary mx-auto mt-0.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Service Specialties */}
        <div className="glass-card p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Service Specialties</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Select service types you specialize in. Leave all unchecked to accept all.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setServiceSpecialties((prev) =>
                  prev.includes(s.value) ? prev.filter((x) => x !== s.value) : [...prev, s.value]
                )}
                className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                  serviceSpecialties.includes(s.value)
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{s.label}</span>
                  {serviceSpecialties.includes(s.value) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
