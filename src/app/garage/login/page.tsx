"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Wrench, IndianRupee, TrendingUp, BadgeCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const PERKS = [
  { icon: IndianRupee, label: "Earn extra revenue", desc: "Get bookings from customers within 5 km" },
  { icon: TrendingUp, label: "Real-time dashboard", desc: "Track earnings, jobs & customer ratings" },
  { icon: BadgeCheck, label: "Mechiee Verified", desc: "Verified badge builds instant customer trust" },
];

export default function GarageLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizePhone(value: string) {
    return value.replace(/\D/g, "").slice(0, 10);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
      router.push(`/verify?phone=${encodeURIComponent(`+91${phone}`)}&from=garage`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary/20 via-primary/10 to-background border-r border-border p-10 w-[45%]">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">Mechiee for Business</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3 leading-tight">
            Manage your garage,<br />earn more — online
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            Accept bookings, track jobs, and grow your customer base — all from one dashboard.
          </p>

          <div className="space-y-5">
            {PERKS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 text-center">
          {[
            { value: "500+", label: "Active Garages" },
            { value: "₹18K", label: "Avg Monthly Earn" },
            { value: "4.8★", label: "Platform Rating" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Mechiee for Business</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Garage Portal Login</h1>
            <p className="text-sm text-muted-foreground">Enter your registered mobile number to continue</p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  className="pl-14"
                  autoFocus
                  inputMode="numeric"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll send a 6-digit OTP to verify your identity
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || phone.length !== 10}
            >
              {loading ? "Sending OTP..." : (
                <>Get OTP <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">New to Mechiee?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/garage/register">
              <Phone className="w-4 h-4" />
              Register your garage — Free
            </Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Looking to book a service?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Customer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
