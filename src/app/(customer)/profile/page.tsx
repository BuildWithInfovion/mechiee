"use client";

import { useState, useEffect } from "react";
import { User, Phone, Edit2, LogOut, ChevronRight, Bell, Shield, HelpCircle, Star, Bike } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("users").select("name, phone").eq("id", user.id).single();
      if (profile) { setName(profile.name ?? ""); setPhone(profile.phone ?? ""); setEditName(profile.name ?? ""); }

      const [{ count: bc }, { count: vc }] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
      ]);
      setBookingCount(bc ?? 0);
      setVehicleCount(vc ?? 0);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("users").update({ name: editName }).eq("id", user.id);
    setName(editName);
    setEditing(false);
    setSaving(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="flex flex-col items-center px-4 pb-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>

        {editing ? (
          <div className="w-full max-w-xs space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-card border border-primary rounded-xl px-4 py-2.5 text-center text-foreground focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-border text-muted-foreground text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground">{name || "Your Name"}</h2>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 {phone.replace(/^91/, "")}</span>
            </div>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 mt-3 text-primary text-sm font-medium">
              <Edit2 className="w-3.5 h-3.5" /> Edit Name
            </button>
          </>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{bookingCount}</p><p className="text-xs text-muted-foreground">Bookings</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{vehicleCount}</p><p className="text-xs text-muted-foreground">Vehicles</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">—</p><p className="text-xs text-muted-foreground">Reviews</p></div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <a href="/vehicles" className="glass-card p-4 flex items-center gap-3 card-hover">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bike className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">My Vehicles</p>
            <p className="text-xs text-muted-foreground">{vehicleCount} vehicle{vehicleCount !== 1 ? "s" : ""} saved</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>

      <div className="px-4 space-y-2 mb-4">
        {[
          { icon: Bell, label: "Notifications", href: "#" },
          { icon: Star, label: "My Reviews", href: "#" },
          { icon: Shield, label: "Privacy & Security", href: "#" },
          { icon: HelpCircle, label: "Help & Support", href: "#" },
        ].map(({ icon: Icon, label, href }) => (
          <a key={label} href={href} className="glass-card p-4 flex items-center gap-3 card-hover">
            <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-sm text-foreground">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ))}
      </div>

      <div className="px-4">
        <button onClick={handleLogout} className="w-full glass-card p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-6">Mechiee v1.0.0</p>
    </div>
  );
}
