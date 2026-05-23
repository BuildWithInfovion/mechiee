"use client";

import { useState, useEffect } from "react";
import { Plus, Bike, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MAKES = ["Honda", "Yamaha", "TVS", "Hero", "Bajaj", "Suzuki", "Royal Enfield", "KTM", "Other"];

interface Vehicle { id: string; make: string; model: string; year: number; color: string; registration_number: string; fuel_type: string; }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ make: "", model: "", year: "", color: "", registration_number: "", fuel_type: "Petrol" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vehicles").then((r) => r.json()).then((d) => setVehicles(d.vehicles ?? [])).finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    if (!form.make || !form.model) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ make: form.make, model: form.model, year: parseInt(form.year) || null, color: form.color, registration_number: form.registration_number, fuel_type: form.fuel_type.toLowerCase() }) });
      const data = await res.json();
      if (data.vehicle) setVehicles((v) => [data.vehicle, ...v]);
      setForm({ make: "", model: "", year: "", color: "", registration_number: "", fuel_type: "Petrol" });
      setShowForm(false);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    setVehicles((v) => v.filter((x) => x.id !== id));
    setDeleteId(null);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">My Vehicles</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="px-4 space-y-3">
        {loading && [1,2].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}

        {!loading && vehicles.length === 0 && (
          <div className="text-center py-16">
            <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No vehicles added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your bike to book services faster</p>
          </div>
        )}

        {vehicles.map((v) => (
          <div key={v.id} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-none">
                <Bike className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{v.make} {v.model}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{v.year} Â· {v.color}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-mono">{v.registration_number || "No plate"}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", v.fuel_type === "electric" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20")}>{v.fuel_type}</span>
                </div>
              </div>
              {deleteId === v.id ? (
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(v.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Check className="w-4 h-4 text-destructive" /></button>
                  <button onClick={() => setDeleteId(null)} className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ) : (
                <button onClick={() => setDeleteId(v.id)} className="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full bg-card rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Add Vehicle</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Brand *</label>
                <select value={form.make} onChange={(e) => setForm(f => ({...f, make: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select brand</option>
                  {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Model *</label>
                <input type="text" placeholder="e.g. Activa 6G" value={form.model} onChange={(e) => setForm(f => ({...f, model: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Year</label>
                  <input type="number" placeholder="2022" value={form.year} onChange={(e) => setForm(f => ({...f, year: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Fuel Type</label>
                  <select value={form.fuel_type} onChange={(e) => setForm(f => ({...f, fuel_type: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                    <option>Petrol</option><option>Electric</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Color</label>
                <input type="text" placeholder="e.g. Matte Black" value={form.color} onChange={(e) => setForm(f => ({...f, color: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Registration Number</label>
                <input type="text" placeholder="KA 01 AB 1234" value={form.registration_number} onChange={(e) => setForm(f => ({...f, registration_number: e.target.value.toUpperCase()}))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving || !form.make || !form.model} className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {saving ? "Addingâ€¦" : "Add Vehicle"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

