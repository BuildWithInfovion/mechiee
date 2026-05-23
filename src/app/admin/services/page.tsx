"use client";

import { useState } from "react";
import { Wrench, Plus, ToggleLeft, ToggleRight, IndianRupee, Clock, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["general_service", "repair", "tyres", "battery", "washing", "other"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<Category, string> = {
  general_service: "General Service",
  repair: "Repair",
  tyres: "Tyres",
  battery: "Battery",
  washing: "Washing",
  other: "Other",
};

interface Service {
  id: string;
  name: string;
  category: Category;
  base_price: number;
  max_price: number;
  duration_minutes: number;
  is_active: boolean;
  description: string;
}

const INITIAL_SERVICES: Service[] = [
  { id: "1", name: "Full General Service", category: "general_service", base_price: 499, max_price: 999, duration_minutes: 120, is_active: true, description: "Complete bike check-up and tune-up" },
  { id: "2", name: "Oil Change", category: "general_service", base_price: 199, max_price: 399, duration_minutes: 30, is_active: true, description: "Engine oil + oil filter replacement" },
  { id: "3", name: "Tyre Puncture Repair", category: "tyres", base_price: 99, max_price: 199, duration_minutes: 30, is_active: true, description: "Tubeless or tube puncture fix" },
  { id: "4", name: "Tyre Replacement", category: "tyres", base_price: 499, max_price: 1499, duration_minutes: 45, is_active: true, description: "Front or rear tyre replacement" },
  { id: "5", name: "Battery Check & Jump Start", category: "battery", base_price: 99, max_price: 199, duration_minutes: 30, is_active: true, description: "Battery health check and jump-start" },
  { id: "6", name: "Battery Replacement", category: "battery", base_price: 999, max_price: 2499, duration_minutes: 30, is_active: true, description: "New battery fitting" },
  { id: "7", name: "Bike Wash", category: "washing", base_price: 99, max_price: 199, duration_minutes: 30, is_active: true, description: "Full exterior wash" },
  { id: "8", name: "Bike Wash & Polish", category: "washing", base_price: 149, max_price: 299, duration_minutes: 45, is_active: true, description: "Wash + polish + detailing" },
  { id: "9", name: "Brake Adjustment", category: "repair", base_price: 99, max_price: 299, duration_minutes: 30, is_active: true, description: "Front and rear brake tightening" },
  { id: "10", name: "Chain Lubrication", category: "general_service", base_price: 49, max_price: 99, duration_minutes: 15, is_active: false, description: "Chain cleaning and lubrication" },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Service>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "general_service" as Category, base_price: "", max_price: "", duration_minutes: "", description: "" });
  const [saving, setSaving] = useState(false);

  function toggleActive(id: string) {
    setServices((s) => s.map((x) => x.id === id ? { ...x, is_active: !x.is_active } : x));
  }

  function startEdit(svc: Service) {
    setEditId(svc.id);
    setEditData({ base_price: svc.base_price, max_price: svc.max_price, duration_minutes: svc.duration_minutes });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setServices((s) => s.map((x) => x.id === id ? { ...x, ...editData } : x));
    setEditId(null);
    setSaving(false);
  }

  async function addService() {
    if (!newService.name || !newService.base_price) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const svc: Service = {
      id: Date.now().toString(),
      name: newService.name,
      category: newService.category,
      base_price: parseInt(newService.base_price) || 0,
      max_price: parseInt(newService.max_price) || parseInt(newService.base_price) || 0,
      duration_minutes: parseInt(newService.duration_minutes) || 30,
      is_active: true,
      description: newService.description,
    };
    setServices((s) => [...s, svc]);
    setNewService({ name: "", category: "general_service", base_price: "", max_price: "", duration_minutes: "", description: "" });
    setShowAdd(false);
    setSaving(false);
  }

  const grouped = services.reduce<Record<Category, Service[]>>((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {} as Record<Category, Service[]>);

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Catalog</h1>
            <p className="text-muted-foreground text-sm mt-1">Platform-wide services that garages can offer</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        <div className="flex gap-3 mb-6 text-sm">
          <div className="glass-card px-4 py-2 text-center">
            <p className="font-bold text-foreground">{services.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <p className="font-bold text-success">{services.filter(s => s.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <p className="font-bold text-muted-foreground">{services.filter(s => !s.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </div>
        </div>

        <div className="space-y-6">
          {(Object.keys(grouped) as Category[]).map((cat) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="space-y-2">
                {grouped[cat].map((svc) => (
                  <div key={svc.id} className={cn("glass-card p-4 transition-opacity", !svc.is_active && "opacity-60")}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>

                        {editId === svc.id ? (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Min ₹</label>
                              <input
                                type="number"
                                value={editData.base_price ?? svc.base_price}
                                onChange={(e) => setEditData((d) => ({ ...d, base_price: parseInt(e.target.value) }))}
                                className="w-full bg-background border border-primary rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Max ₹</label>
                              <input
                                type="number"
                                value={editData.max_price ?? svc.max_price}
                                onChange={(e) => setEditData((d) => ({ ...d, max_price: parseInt(e.target.value) }))}
                                className="w-full bg-background border border-primary rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Min</label>
                              <input
                                type="number"
                                value={editData.duration_minutes ?? svc.duration_minutes}
                                onChange={(e) => setEditData((d) => ({ ...d, duration_minutes: parseInt(e.target.value) }))}
                                className="w-full bg-background border border-primary rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none mt-0.5"
                              />
                            </div>
                            <div className="col-span-3 flex gap-2 mt-1">
                              <button onClick={() => saveEdit(svc.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary/10 text-primary rounded-lg text-xs">
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button onClick={() => setEditId(null)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-muted/10 text-muted-foreground rounded-lg text-xs">
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(svc)} className="flex items-center gap-3 mt-2 hover:opacity-70 transition-opacity">
                            <div className="flex items-center gap-0.5 text-xs font-semibold text-foreground">
                              <IndianRupee className="w-3 h-3" />
                              {svc.base_price}–{svc.max_price}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {svc.duration_minutes} min
                            </div>
                          </button>
                        )}
                      </div>

                      <button onClick={() => toggleActive(svc.id)} className="flex-none">
                        {svc.is_active ? (
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

      {/* Add service modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">New Service</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Service Name *</label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                placeholder="e.g. Chain Cleaning"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select
                value={newService.category}
                onChange={(e) => setNewService((s) => ({ ...s, category: e.target.value as Category }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Price (₹)</label>
                <input type="number" value={newService.base_price} onChange={(e) => setNewService((s) => ({ ...s, base_price: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Price (₹)</label>
                <input type="number" value={newService.max_price} onChange={(e) => setNewService((s) => ({ ...s, max_price: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Duration (minutes)</label>
              <input type="number" value={newService.duration_minutes} onChange={(e) => setNewService((s) => ({ ...s, duration_minutes: e.target.value }))} placeholder="30" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea value={newService.description} onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))} rows={2} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
            </div>

            <button
              onClick={addService}
              disabled={saving || !newService.name || !newService.base_price}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add to Catalog"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
