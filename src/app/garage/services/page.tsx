"use client";

import { useState, useEffect } from "react";
import { Wrench, ToggleLeft, ToggleRight, IndianRupee, Clock, Plus, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface GarageService {
  id: string;
  price: number;
  duration_minutes: number;
  is_available: boolean;
  service_catalog: {
    id: string;
    name: string;
    category: string;
  };
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  base_price: number;
  duration_minutes: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  general_service: "General Service",
  tyres: "Tyres",
  battery: "Battery",
  washing: "Washing",
  repair: "Repair",
  other: "Other",
};

export default function GarageServicesPage() {
  const [services, setServices] = useState<GarageService[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/garage/services").then((r) => r.json()),
      fetch("/api/service-catalog").then((r) => r.json()),
    ]).then(([svcData, catData]) => {
      setServices(svcData.services ?? []);
      setCatalog(catData.catalog ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(svc: GarageService) {
    const updated = { id: svc.id, is_available: !svc.is_available };
    setServices((s) => s.map((x) => x.id === svc.id ? { ...x, is_available: !x.is_available } : x));
    const res = await fetch("/api/garage/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      setServices((s) => s.map((x) => x.id === svc.id ? { ...x, is_available: svc.is_available } : x));
      toast.error("Failed to update service");
    }
  }

  async function saveEdit(svc: GarageService) {
    const price = parseInt(editPrice);
    if (!price || price < 1) { toast.error("Enter a valid price"); return; }
    setSaving(true);
    const res = await fetch("/api/garage/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: svc.id, price }),
    });
    setSaving(false);
    if (res.ok) {
      setServices((s) => s.map((x) => x.id === svc.id ? { ...x, price } : x));
      setEditId(null);
    } else {
      toast.error("Failed to save price");
    }
  }

  async function addService(cat: CatalogItem) {
    setSaving(true);
    const res = await fetch("/api/garage/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: cat.id,
        price: cat.base_price,
        duration_minutes: cat.duration_minutes ?? 30,
        is_available: true,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setServices((s) => [...s, data.service]);
      setShowAdd(false);
    } else {
      toast.error(data.error ?? "Failed to add service");
    }
  }

  async function removeService(id: string) {
    const res = await fetch(`/api/garage/services?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((s) => s.filter((x) => x.id !== id));
    } else {
      toast.error("Failed to remove service");
    }
  }

  const addedServiceIds = new Set(services.map((s) => s.service_catalog?.id));
  const availableToAdd = catalog.filter((c) => !addedServiceIds.has(c.id));

  const grouped = services.reduce<Record<string, GarageService[]>>((acc, svc) => {
    const cat = svc.service_catalog?.category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

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

        {services.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No services added yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-xl"
            >
              Add your first service
            </button>
          </div>
        ) : (
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
                          <p className="text-sm font-medium text-foreground">{svc.service_catalog?.name}</p>
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
                                <button onClick={() => saveEdit(svc)} disabled={saving} className="text-success">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditId(null)} className="text-muted-foreground">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditId(svc.id); setEditPrice(String(svc.price)); }}
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
                        <div className="flex items-center gap-2 flex-none">
                          <button
                            onClick={() => toggleAvailability(svc)}
                            title={svc.is_available ? "Disable" : "Enable"}
                          >
                            {svc.is_available ? (
                              <ToggleRight className="w-8 h-8 text-primary" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => removeService(svc.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl p-5 space-y-3 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
