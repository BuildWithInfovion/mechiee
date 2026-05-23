"use client";

import { useState } from "react";
import { Wrench, ToggleLeft, ToggleRight, IndianRupee, Clock, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GarageService {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  is_available: boolean;
}

const INITIAL_SERVICES: GarageService[] = [
  { id: "1", name: "Full General Service", category: "general_service", price: 799, duration_minutes: 120, is_available: true },
  { id: "2", name: "Oil Change", category: "general_service", price: 299, duration_minutes: 30, is_available: true },
  { id: "3", name: "Tyre Puncture Repair", category: "tyres", price: 149, duration_minutes: 30, is_available: true },
  { id: "4", name: "Tyre Replacement", category: "tyres", price: 799, duration_minutes: 45, is_available: false },
  { id: "5", name: "Battery Replacement", category: "battery", price: 1499, duration_minutes: 30, is_available: true },
  { id: "6", name: "Bike Wash & Polish", category: "washing", price: 199, duration_minutes: 45, is_available: true },
];

const ALL_CATALOG = [
  { id: "c1", name: "Chain Lubrication", category: "general_service", base_price: 99 },
  { id: "c2", name: "Brake Adjustment", category: "repair", base_price: 149 },
  { id: "c3", name: "Air Filter Cleaning", category: "general_service", base_price: 99 },
  { id: "c4", name: "Spark Plug Replacement", category: "repair", base_price: 199 },
];

const CATEGORY_LABELS: Record<string, string> = {
  general_service: "General Service",
  tyres: "Tyres",
  battery: "Battery",
  washing: "Washing",
  repair: "Repair",
};

export default function GarageServicesPage() {
  const [services, setServices] = useState<GarageService[]>(INITIAL_SERVICES);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleAvailability(id: string) {
    setServices((s) => s.map((x) => x.id === id ? { ...x, is_available: !x.is_available } : x));
  }

  function startEdit(svc: GarageService) {
    setEditId(svc.id);
    setEditPrice(String(svc.price));
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setServices((s) => s.map((x) => x.id === id ? { ...x, price: parseInt(editPrice) || x.price } : x));
    setEditId(null);
    setSaving(false);
  }

  async function addService(cat: (typeof ALL_CATALOG)[0]) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const newSvc: GarageService = {
      id: Date.now().toString(),
      name: cat.name,
      category: cat.category,
      price: cat.base_price,
      duration_minutes: 30,
      is_available: true,
    };
    setServices((s) => [...s, newSvc]);
    setShowAdd(false);
    setSaving(false);
  }

  const availableToAdd = ALL_CATALOG.filter(
    (c) => !services.find((s) => s.name === c.name)
  );

  const grouped = services.reduce<Record<string, GarageService[]>>((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage services your garage offers</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(grouped).map(([category, svcs]) => (
            <div key={category}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="space-y-2">
                {svcs.map((svc) => (
                  <div key={svc.id} className={cn("glass-card p-4 transition-opacity", !svc.is_available && "opacity-60")}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{svc.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {editId === svc.id ? (
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-muted-foreground" />
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 bg-background border border-primary rounded-lg px-2 py-0.5 text-sm text-foreground focus:outline-none"
                                autoFocus
                              />
                              <button onClick={() => saveEdit(svc.id)} className="text-success"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(svc)}
                              className="flex items-center gap-0.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              <IndianRupee className="w-3 h-3" />
                              {svc.price.toLocaleString("en-IN")}
                            </button>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {svc.duration_minutes} min
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAvailability(svc.id)}
                        className="flex-none"
                        title={svc.is_available ? "Disable" : "Enable"}
                      >
                        {svc.is_available ? (
                          <ToggleRight className="w-8 h-8 text-primary" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add service sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Add Service</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {availableToAdd.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">All available services are already added.</p>
            ) : (
              <div className="space-y-2">
                {availableToAdd.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => addService(cat)}
                    disabled={saving}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat.category]}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">₹{cat.base_price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
