"use client";

import Link from "next/link";
import {
  Wrench, MapPin, Star, Shield, Clock,
  Bike, Battery, Droplets, Settings, Zap, CheckCircle,
  Menu, X, Phone, MessageCircle, ArrowRight, IndianRupee,
  Building2, TrendingUp, Users, BadgeCheck, ThumbsUp, Award,
  Headphones, CalendarCheck, Search, LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";

// ── Decorative SVGs ───────────────────────────────────────────────────────────

function GearDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x="92" y="6" width="16" height="30" rx="5" fill="currentColor"
          transform={`rotate(${angle} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="7" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="14" />
    </svg>
  );
}

function TireDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="12" />
      <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="3" strokeDasharray="10 7" />
      <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="20" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <rect key={angle} x="92" y="4" width="16" height="22" rx="4" fill="currentColor"
          transform={`rotate(${angle} 100 100)`} />
      ))}
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Settings, label: "General Service", desc: "Full tune-up, oil change, chain lube, brake check, air filter cleaning", price: "₹499", time: "2–3 hrs", popular: true, grad: "from-violet-500/20", text: "text-violet-400", border: "border-violet-500/25" },
  { icon: Droplets, label: "Oil Change", desc: "Drain old oil, replace filter, fill fresh engine oil of your grade", price: "₹299", time: "30 min", popular: false, grad: "from-amber-500/20", text: "text-amber-400", border: "border-amber-500/25" },
  { icon: Bike, label: "Tyre Service", desc: "Puncture repair, tyre pressure check, replacement (MRF/CEAT/Apollo)", price: "₹149", time: "30–45 min", popular: false, grad: "from-sky-500/20", text: "text-sky-400", border: "border-sky-500/25" },
  { icon: Battery, label: "Battery Service", desc: "Battery testing, charging, warranty-backed battery replacement", price: "₹999", time: "30 min", popular: false, grad: "from-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/25" },
  { icon: Zap, label: "Electrical Repair", desc: "Wiring, headlight, indicators, horn, self-start motor repair", price: "₹199", time: "1–2 hrs", popular: false, grad: "from-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/25" },
  { icon: Droplets, label: "Bike Wash & Polish", desc: "Pressure wash, engine degreasing, chain cleaning, body polish", price: "₹199", time: "45 min", popular: false, grad: "from-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/25" },
];

const TRUST_STRIP = [
  { icon: BadgeCheck, text: "Verified Mechanics" },
  { icon: Shield, text: "90-Day Warranty" },
  { icon: IndianRupee, text: "No Hidden Charges" },
  { icon: Clock, text: "On-Time Guarantee" },
  { icon: ThumbsUp, text: "4.8★ Rated Service" },
  { icon: MapPin, text: "Doorstep Delivery" },
  { icon: Headphones, text: "24/7 Support" },
  { icon: Bike, text: "500+ Partner Garages" },
];

const TRUST_POINTS = [
  { icon: BadgeCheck, title: "Verified Mechanics", desc: "Background-checked, trained & certified before they are onboarded to Mechiee.", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { icon: Shield, title: "Transparent Pricing", desc: "Price shown upfront. What you see is what you pay — always.", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { icon: Award, title: "90-Day Warranty", desc: "All services covered under a 90-day quality guarantee. No questions asked.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { icon: Headphones, title: "24/7 Customer Support", desc: "Reach us anytime via WhatsApp, call or in-app chat.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: CalendarCheck, title: "Doorstep Service", desc: "Mechanic comes to your home, office, or anywhere you say.", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { icon: ThumbsUp, title: "No Advance Payment", desc: "Parts cost shown before replacement. You approve. You pay after the job.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", city: "Bengaluru", rating: 5, text: "Got my Activa serviced at home. Mechanic arrived on time, thorough job. Saved me a full day of waiting at the workshop.", bike: "Honda Activa 6G", initials: "RS", avatarBg: "bg-violet-600" },
  { name: "Priya Menon", city: "Hyderabad", rating: 5, text: "Battery replacement done in 30 minutes outside my apartment. Mechanic checked the wiring for free too. Highly recommend Mechiee.", bike: "TVS Jupiter", initials: "PM", avatarBg: "bg-emerald-700" },
  { name: "Karthik R", city: "Chennai", rating: 5, text: "Transparent pricing, zero hidden charges. They showed me the parts before replacing. That level of professionalism is rare.", bike: "Royal Enfield Classic 350", initials: "KR", avatarBg: "bg-sky-700" },
];

const CITIES = [
  "Bengaluru", "Hyderabad", "Chennai", "Pune", "Mumbai",
  "Delhi NCR", "Ahmedabad", "Jaipur", "Coimbatore", "Kochi",
  "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Mysuru",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070D] text-white overflow-x-hidden">

      {/* ══ ANNOUNCEMENT BAR ══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-primary to-violet-950 py-2.5 text-center text-xs font-medium text-white">
        <span className="inline-flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
          Now serving 15+ cities across India — doorstep two-wheeler service by verified mechanics
          <span className="hidden sm:inline text-white/30">·</span>
          <a href="https://wa.me/919876543210" className="hidden sm:inline text-white/70 hover:text-white underline underline-offset-2 transition-colors">
            Chat on WhatsApp →
          </a>
          <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
        </span>
      </div>

      {/* ══ NAVIGATION ════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[#07070D]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/40"
        : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">

          <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Mechiee" className="h-9 w-auto mix-blend-screen" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              ["#services", "Services"],
              ["#how-it-works", "How It Works"],
              ["#why-us", "Why Choose Us"],
              ["#for-garages", "For Garages"],
              ["#cities", "Cities"],
            ].map(([href, label]) => (
              <Link key={href} href={href}
                className="text-white/50 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/garage/login"
              className="text-sm text-white/55 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-4 py-2.5 transition-all flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Garage Portal
            </Link>
            <Link href="/login"
              className="text-sm bg-primary hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
              Book a Service →
            </Link>
          </div>

          <button className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0D0D18] border-t border-white/[0.07] px-4 pb-6 pt-3">
            {[
              ["#services", "Services"],
              ["#how-it-works", "How It Works"],
              ["#why-us", "Why Choose Us"],
              ["#for-garages", "For Garages"],
              ["#cities", "Cities"],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3.5 text-sm text-white/65 border-b border-white/[0.06] hover:text-white">
                {label}
                <ArrowRight className="w-3.5 h-3.5 text-white/25" />
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2.5 pt-5">
              <Link href="/garage/login"
                className="flex items-center justify-center gap-1.5 text-sm border border-white/10 text-white/65 rounded-xl py-3 font-medium">
                <LayoutDashboard className="w-3.5 h-3.5" /> Garage
              </Link>
              <Link href="/login"
                className="flex items-center justify-center bg-primary text-white text-sm rounded-xl py-3 font-bold shadow-lg shadow-primary/30">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 bg-[#07070D]" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 70% at 65% 45%, rgba(109,40,217,0.22) 0%, transparent 65%), radial-gradient(ellipse 40% 50% at 5% 80%, rgba(59,130,246,0.07) 0%, transparent 55%)"
        }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.022]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Decorative gear — top right */}
        <div className="absolute -top-16 -right-16 w-[640px] h-[640px] text-violet-700/[0.07] pointer-events-none animate-spin-slow">
          <GearDecor className="w-full h-full" />
        </div>
        {/* Decorative tire — bottom left */}
        <div className="absolute -bottom-28 -left-28 w-[560px] h-[560px] text-violet-700/[0.06] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>
        {/* Small gear — mid */}
        <div className="absolute top-1/2 left-[38%] w-32 h-32 text-white/[0.018] pointer-events-none">
          <GearDecor className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-[1fr_430px] gap-16 items-center">

            {/* Left: Copy */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.09] text-xs text-white/65 px-4 py-2 rounded-full mb-9 backdrop-blur-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Available Now · 15+ Cities · 10,000+ Services Completed
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-[4.75rem] font-extrabold leading-[1.05] tracking-tight mb-6">
                <span className="text-white">Expert Bike</span><br />
                <span className="text-white">Servicing,</span><br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                  At Your Doorstep.
                </span>
              </h1>

              <p className="text-white/55 text-xl leading-relaxed mb-10 max-w-lg">
                Verified mechanics dispatched to your home, office, or anywhere in the city. No workshop visits. Transparent pricing. Pay only after the job is done.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link href="/login"
                  className="group flex items-center justify-center gap-2.5 bg-primary hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0">
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:+919876543210"
                  className="flex items-center justify-center gap-2.5 border border-white/12 hover:border-white/25 hover:bg-white/[0.04] text-white/70 hover:text-white px-8 py-4 rounded-xl font-medium text-base transition-all">
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
              </div>

              {/* Mini stats row */}
              <div className="flex items-stretch divide-x divide-white/10">
                {[
                  { v: "10,000+", l: "Services Done" },
                  { v: "500+", l: "Verified Garages" },
                  { v: "15+", l: "Cities" },
                  { v: "4.8★", l: "Avg Rating" },
                ].map((s) => (
                  <div key={s.l} className="px-5 first:pl-0">
                    <div className="text-2xl font-extrabold text-white">{s.v}</div>
                    <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live app preview card */}
            <div className="relative hidden lg:block">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-90" />

              {/* Main card */}
              <div className="relative bg-[#0D0D1C] border border-white/[0.09] rounded-3xl overflow-hidden shadow-2xl shadow-black/60 animate-float-up">
                {/* Header */}
                <div className="relative p-6 pb-7"
                  style={{ background: "linear-gradient(135deg, #5B21B6 0%, #2E1065 100%)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white/55 text-[10px] font-semibold uppercase tracking-widest">Active Booking</p>
                      <p className="text-white font-bold text-lg mt-0.5">Honda Activa 6G</p>
                    </div>
                    <span className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/[0.09] backdrop-blur-sm rounded-xl p-3">
                    <div className="w-10 h-10 bg-primary/60 border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">Rajesh Kumar</p>
                      <p className="text-white/55 text-xs">En route · Arrives in 18 min</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-0.5 justify-end">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-white text-xs font-bold">4.9</span>
                      </div>
                      <p className="text-white/40 text-[10px]">124 jobs</p>
                    </div>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="p-5 space-y-2.5">
                  {[
                    { label: "Booking Confirmed", done: true, active: false },
                    { label: "Mechanic Assigned", done: true, active: false },
                    { label: "En Route to You", done: true, active: true },
                    { label: "Service in Progress", done: false, active: false },
                    { label: "Completed & Pay", done: false, active: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.active ? "bg-primary shadow-lg shadow-primary/50" : step.done ? "bg-primary/35" : "bg-white/8"}`}>
                        {step.done
                          ? <CheckCircle className="w-3 h-3 text-white" />
                          : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                      </div>
                      <span className={`text-xs flex-1 ${step.active ? "text-white font-semibold" : step.done ? "text-white/45" : "text-white/22"}`}>
                        {step.label}
                      </span>
                      {step.active && <span className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Total row */}
                <div className="px-5 pb-5">
                  <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-white/45 text-xs">Estimated Total</p>
                      <p className="text-white font-extrabold text-xl mt-0.5">₹499</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/45 text-xs">Payment Mode</p>
                      <p className="text-emerald-400 text-xs font-bold mt-0.5">After Service Only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge — no advance */}
              <div className="absolute -left-14 top-12 bg-[#0D0D1C] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Zero Advance</p>
                    <p className="text-white/40 text-[10px]">Pay after service</p>
                  </div>
                </div>
              </div>

              {/* Floating badge — rating */}
              <div className="absolute -right-10 top-1/3 bg-[#0D0D1C] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl">
                <div className="flex items-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white text-sm font-bold">4.8 / 5.0</p>
                <p className="text-white/40 text-[10px]">2,400+ reviews</p>
              </div>

              {/* Floating badge — garages */}
              <div className="absolute -right-8 bottom-14 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 shadow-2xl">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-white text-xs font-bold">500+ Garages</p>
                    <p className="text-white/40 text-[10px]">Across 15 cities</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ TRUST MARQUEE ════════════════════════════════════════════════════ */}
      <div className="border-y border-white/[0.05] bg-white/[0.015] py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center flex-shrink-0">
              {TRUST_STRIP.map((item, i) => (
                <div key={i} className="flex items-center px-8 gap-2.5 flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-white/45 text-sm font-medium">{item.text}</span>
                  <span className="text-white/10 ml-6 text-base">◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(109,40,217,0.08) 0%, transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02]">
            {[
              { value: "10,000+", label: "Services Completed", sub: "And growing every day", icon: CheckCircle, color: "text-violet-400" },
              { value: "500+", label: "Partner Garages", sub: "Verified & trained", icon: BadgeCheck, color: "text-emerald-400" },
              { value: "15+", label: "Cities Active", sub: "Expanding monthly", icon: MapPin, color: "text-sky-400" },
              { value: "4.8★", label: "Customer Rating", sub: "From 2,400+ reviews", icon: Star, color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col p-7 lg:p-9 hover:bg-white/[0.02] transition-colors">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-white/75">{stat.label}</div>
                <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #07070D, #0B0A18, #07070D)" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[460px] h-[460px] text-violet-900/15 pointer-events-none">
          <GearDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Booked & at your door<br />
              <span className="text-white/35">in under 2 minutes.</span>
            </h2>
            <p className="text-white/50 text-lg">No calls. No confusion. Select, schedule, and relax — we handle everything else.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step: "01", icon: Search, title: "Choose Your Service", desc: "Browse 20+ services with clear, upfront pricing. No surprises, ever.", grad: "from-violet-500/15", border: "border-violet-500/20", icon2Color: "text-violet-400", iconBg: "bg-violet-500/15" },
              { step: "02", icon: CalendarCheck, title: "Pick Date & Time", desc: "Schedule at your convenience — same day or advance booking available.", grad: "from-sky-500/15", border: "border-sky-500/20", icon2Color: "text-sky-400", iconBg: "bg-sky-500/15" },
              { step: "03", icon: Bike, title: "Mechanic Arrives", desc: "Your verified mechanic reaches your location. Track them live in the app.", grad: "from-amber-500/15", border: "border-amber-500/20", icon2Color: "text-amber-400", iconBg: "bg-amber-500/15" },
              { step: "04", icon: IndianRupee, title: "Pay After Service", desc: "Inspect the work. Pay via UPI, card, or cash. Zero advance ever needed.", grad: "from-emerald-500/15", border: "border-emerald-500/20", icon2Color: "text-emerald-400", iconBg: "bg-emerald-500/15" },
            ].map((step, i) => (
              <div key={step.step} className="relative group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%-0.75rem)] w-[calc(100%-1.5rem)] h-px border-t border-dashed border-white/[0.08] z-0" />
                )}
                <div className={`relative z-10 bg-gradient-to-b ${step.grad} to-transparent border ${step.border} rounded-2xl p-6 h-full transition-all group-hover:border-opacity-70 group-hover:-translate-y-1.5`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 ${step.iconBg} rounded-xl flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 ${step.icon2Color}`} />
                    </div>
                    <span className="text-5xl font-black text-white/[0.05]">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2.5">{step.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ═════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 8% 60%, rgba(59,130,246,0.05) 0%, transparent 55%)" }} />
        <div className="absolute -left-16 top-1/4 w-[380px] h-[380px] text-sky-900/10 pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Services & Pricing</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Transparent prices,<br />
                <span className="text-white/35">zero surprises.</span>
              </h2>
            </div>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed md:text-right">
              All-inclusive: labour + consumables. Parts cost is shown before replacement — you approve before we proceed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.label}
                className="relative group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-6 transition-all hover:-translate-y-1.5">
                {svc.popular && (
                  <div className="absolute -top-3 left-5">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-primary/40">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 bg-gradient-to-br ${svc.grad} to-transparent border ${svc.border} rounded-xl flex items-center justify-center`}>
                    <svc.icon className={`w-6 h-6 ${svc.text}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-white">{svc.price}</div>
                    <div className="text-xs text-white/35 mt-0.5 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {svc.time}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{svc.label}</h3>
                <p className="text-xs text-white/42 leading-relaxed mb-5">{svc.desc}</p>
                <Link href="/login"
                  className={`flex items-center justify-center gap-1.5 w-full border border-white/[0.08] hover:border-primary/50 hover:bg-primary/10 ${svc.text} hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all`}>
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/25 text-center mt-8">
            * Starting prices. Final price may vary by bike model and condition. You are always informed before any additional work begins.
          </p>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ════════════════════════════════════════════════════ */}
      <section id="why-us" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #07070D, #090918, #07070D)" }} />
        <div className="absolute inset-y-0 left-0 right-0 border-y border-white/[0.04]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Why Choose Mechiee</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Built on trust.<br />Backed by quality.
            </h2>
            <p className="text-white/45 text-lg">
              Every decision at Mechiee is made to give you a stress-free, transparent, and reliable service experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRUST_POINTS.map((item) => (
              <div key={item.title}
                className={`group flex gap-4 p-6 bg-white/[0.02] border ${item.border} hover:bg-white/[0.04] rounded-2xl transition-all hover:-translate-y-1`}>
                <div className={`w-12 h-12 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-white/42 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 65% 80% at 80% 50%, rgba(109,40,217,0.08) 0%, transparent 60%)" }} />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] text-violet-900/10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <GearDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Real Reviews</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Don&apos;t take our word.<br />
              <span className="text-white/35">Ask our customers.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col hover:border-white/[0.12] transition-all hover:-translate-y-1">
                <div className="text-5xl font-serif text-primary/20 leading-none mb-2 -mt-1 select-none">&ldquo;</div>
                <p className="text-white/65 text-sm leading-relaxed flex-1 mb-5">{t.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                  <div className={`w-10 h-10 ${t.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-white/35">{t.bike} &middot; {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOR GARAGES ══════════════════════════════════════════════════════ */}
      <section id="for-garages" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(59,130,246,0.04) 50%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute -right-20 -bottom-20 w-[520px] h-[520px] text-violet-900/12 pointer-events-none">
          <GearDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> For Garage Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Partner with Mechiee.<br />
                <span className="text-white/35">Grow your business.</span>
              </h2>
              <p className="text-white/52 text-lg mb-8 leading-relaxed">
                Join 500+ garages already earning with Mechiee. Get verified bookings from nearby customers — no marketing spend, no cold calls.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Get bookings from customers within 10–25 km radius",
                  "100% free registration — no monthly or annual fees",
                  "Instant WhatsApp notifications for every new booking",
                  "Full dashboard: earnings, job history, reviews & analytics",
                  "Dedicated partner support and onboarding assistance",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/65">
                    <div className="w-5 h-5 bg-primary/15 border border-primary/25 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/garage/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-violet-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-0.5">
                  <Building2 className="w-4 h-4" /> Register Your Garage — Free
                </Link>
                <Link href="/garage/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/22 text-white/65 hover:text-white px-7 py-3.5 rounded-xl font-medium transition-all">
                  <LayoutDashboard className="w-4 h-4" /> Existing Partner Login
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: IndianRupee, title: "Extra Revenue Stream", desc: "Avg ₹15K–40K/month in additional income from nearby doorstep bookings.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { icon: Users, title: "Larger Customer Base", desc: "Access thousands of app users in your city actively looking for service.", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
                { icon: TrendingUp, title: "Analytics Dashboard", desc: "Track earnings, ratings, and job history in real time. Know your business.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { icon: BadgeCheck, title: "Mechiee Verified Badge", desc: "Verified garages earn 3× more bookings and customer trust.", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
              ].map((card) => (
                <div key={card.title}
                  className={`bg-white/[0.03] border ${card.border} rounded-2xl p-5 hover:bg-white/[0.05] transition-all hover:-translate-y-1`}>
                  <div className={`w-10 h-10 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center mb-4`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">{card.title}</h4>
                  <p className="text-xs text-white/42 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/70 via-primary/45 to-purple-950/70" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-[420px] h-[420px] text-white/[0.04] pointer-events-none">
          <GearDecor className="w-full h-full" />
        </div>
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[360px] h-[360px] text-white/[0.04] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-white/55 text-xs font-bold uppercase tracking-[0.2em] mb-4">Ready to Experience Mechiee?</p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Your bike deserves<br />better care.
          </h2>
          <p className="text-white/55 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            Join 10,000+ bike owners who stopped wasting hours at garages. Book in 2 minutes, mechanic at your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login"
              className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-white/92 text-primary px-10 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-black/30 hover:-translate-y-0.5">
              Book a Service Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/919876543210"
              className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-emerald-900/30 hover:-translate-y-0.5">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══ CITIES ═══════════════════════════════════════════════════════════ */}
      <section id="cities" className="py-20 md:py-28 relative">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(14,116,144,0.04) 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Coverage</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Cities we serve</h2>
            <p className="text-white/42 text-lg">
              Expanding every month. Don&apos;t see your city?{" "}
              <a href="https://wa.me/919876543210" className="text-primary hover:text-violet-300 underline underline-offset-4 transition-colors">
                WhatsApp us
              </a>{" "}
              — we&apos;ll notify you when we launch near you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {CITIES.map((city) => (
              <div key={city}
                className="group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] rounded-xl px-5 py-3 transition-all cursor-default">
                <MapPin className="w-3.5 h-3.5 text-primary group-hover:text-violet-300 transition-colors" />
                <span className="text-sm font-medium text-white/65 group-hover:text-white transition-colors">{city}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-primary/[0.08] border border-primary/20 rounded-xl px-5 py-3">
              <span className="text-sm font-semibold text-primary">+ More coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.07] bg-[#05050A] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute -right-24 -bottom-20 w-[380px] h-[380px] text-white/[0.018] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">

            <div className="col-span-2">
              <img src="/logo.png" alt="Mechiee" className="h-9 w-auto mix-blend-screen mb-5" />
              <p className="text-sm text-white/35 leading-relaxed mb-6 max-w-xs">
                India&apos;s trusted doorstep two-wheeler service platform. Expert mechanics, transparent pricing, zero hassle.
              </p>
              <div className="space-y-3">
                <a href="tel:+919876543210" className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-primary" /> +91 98765 43210
                </a>
                <a href="https://wa.me/919876543210" className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp Support
                </a>
                <div className="flex items-center gap-2.5 text-sm text-white/40">
                  <MapPin className="w-4 h-4 text-primary" /> Bengaluru, Karnataka
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-5">Services</h4>
              <ul className="space-y-3">
                {SERVICES.map((s) => (
                  <li key={s.label}>
                    <Link href="/login" className="text-sm text-white/35 hover:text-white transition-colors">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-5">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "#" },
                  { label: "For Garages", href: "#for-garages" },
                  { label: "Partner Program", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Contact Us", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/35 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-5">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-white/35 hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-3">Payments Accepted</p>
                <div className="flex flex-wrap gap-2">
                  {["UPI", "Cards", "Net Banking", "Cash"].map((p) => (
                    <span key={p} className="text-xs bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-lg text-white/40">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} Mechiee Technologies Pvt. Ltd. All rights reserved. &nbsp;GST: 29XXXXX1234Z1ZX
            </p>
            <p className="text-xs text-white/25">Made with ♥ in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* ══ FLOATING WHATSAPP ════════════════════════════════════════════════ */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 transition-all hover:scale-110 hover:-translate-y-1"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>

    </div>
  );
}
