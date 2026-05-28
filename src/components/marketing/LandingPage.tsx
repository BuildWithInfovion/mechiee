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

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA  (deterministic — no Math.random to avoid hydration mismatch)
// ─────────────────────────────────────────────────────────────────────────────

const SPARKS = [
  { dx:  52, dy: -44, delay: 0.00, dur: 0.90, size: 3.0, color: "#FCD34D" },
  { dx:  34, dy: -66, delay: 0.12, dur: 1.10, size: 2.0, color: "#F59E0B" },
  { dx:  65, dy: -22, delay: 0.25, dur: 0.80, size: 2.5, color: "#FDE68A" },
  { dx: -28, dy: -68, delay: 0.08, dur: 1.00, size: 2.0, color: "#FCD34D" },
  { dx:  72, dy:  -8, delay: 0.40, dur: 0.70, size: 3.0, color: "#F59E0B" },
  { dx:  22, dy: -78, delay: 0.18, dur: 1.20, size: 2.0, color: "#FDE68A" },
  { dx: -55, dy: -40, delay: 0.30, dur: 0.95, size: 2.5, color: "#FCD34D" },
  { dx:  58, dy: -50, delay: 0.50, dur: 0.85, size: 2.0, color: "#F59E0B" },
  { dx: -38, dy: -62, delay: 0.15, dur: 1.05, size: 3.0, color: "#FDE68A" },
  { dx:  44, dy: -65, delay: 0.35, dur: 0.90, size: 2.0, color: "#FCD34D" },
  { dx: -62, dy: -28, delay: 0.22, dur: 1.10, size: 2.5, color: "#F59E0B" },
  { dx:  16, dy: -82, delay: 0.45, dur: 0.75, size: 2.0, color: "#FDE68A" },
];

const SMOKE_PUFFS = [
  { sx: -6, delay: 0.0, dur: 2.2, size: 14 },
  { sx:  5, delay: 0.8, dur: 2.6, size: 11 },
  { sx: -10, delay: 1.5, dur: 2.0, size:  9 },
];

const FLOATING_TOOLS: {
  Icon: typeof Wrench; top?: string; right?: string; left?: string; bottom?: string;
  size: number; delay: number; dur: number; r0: number; r1: number; spin?: boolean;
}[] = [
  { Icon: Wrench,   top: "9%",  right: "6%",  size: 30, delay: 0.0, dur: 4.5, r0: -22, r1:  8 },
  { Icon: Settings, top: "22%", right: "1%",  size: 24, delay: 1.0, dur: 7.0, r0:   0, r1: 360, spin: true },
  { Icon: Zap,      top: "56%", right: "4%",  size: 20, delay: 0.6, dur: 3.8, r0: -12, r1: 14 },
  { Icon: Droplets, top: "76%", right:"14%",  size: 18, delay: 1.4, dur: 4.2, r0:   0, r1:  0 },
  { Icon: Battery,  top: "36%", left:  "2%",  size: 22, delay: 0.3, dur: 5.0, r0:  14, r1: -8 },
  { Icon: Wrench,   top: "68%", left:  "4%",  size: 17, delay: 1.7, dur: 3.5, r0:  22, r1: -4 },
  { Icon: Settings, top: "82%", left:  "12%", size: 19, delay: 0.8, dur: 6.5, r0:   0, r1: 360, spin: true },
];

const SERVICES = [
  { icon: Settings, label: "General Service",   desc: "Full tune-up, oil change, chain lube, brake check, air filter cleaning", price: "₹499", time: "2–3 hrs", popular: true,  grad: "from-violet-500/20", text: "text-violet-400", border: "border-violet-500/25" },
  { icon: Droplets, label: "Oil Change",         desc: "Drain old oil, replace filter, fill fresh engine oil of your grade",    price: "₹299", time: "30 min",   popular: false, grad: "from-amber-500/20",  text: "text-amber-400",  border: "border-amber-500/25"  },
  { icon: Bike,     label: "Tyre Service",        desc: "Puncture repair, tyre pressure check, replacement (MRF/CEAT/Apollo)",  price: "₹149", time: "30–45 min",popular: false, grad: "from-sky-500/20",    text: "text-sky-400",    border: "border-sky-500/25"    },
  { icon: Battery,  label: "Battery Service",     desc: "Battery testing, charging, warranty-backed battery replacement",       price: "₹999", time: "30 min",   popular: false, grad: "from-emerald-500/20",text: "text-emerald-400",border: "border-emerald-500/25"},
  { icon: Zap,      label: "Electrical Repair",   desc: "Wiring, headlight, indicators, horn, self-start motor repair",        price: "₹199", time: "1–2 hrs",  popular: false, grad: "from-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/25" },
  { icon: Droplets, label: "Bike Wash & Polish",  desc: "Pressure wash, engine degreasing, chain cleaning, body polish",       price: "₹199", time: "45 min",   popular: false, grad: "from-cyan-500/20",   text: "text-cyan-400",   border: "border-cyan-500/25"   },
];

const TRUST_STRIP = [
  { icon: BadgeCheck, text: "Verified Mechanics" },
  { icon: Shield,     text: "90-Day Warranty"    },
  { icon: IndianRupee,text: "No Hidden Charges"  },
  { icon: Clock,      text: "On-Time Guarantee"  },
  { icon: ThumbsUp,   text: "4.8★ Rated Service" },
  { icon: MapPin,     text: "Doorstep Delivery"  },
  { icon: Headphones, text: "24/7 Support"        },
  { icon: Bike,       text: "500+ Garages"        },
];

const TRUST_POINTS = [
  { icon: BadgeCheck,   title: "Verified Mechanics",   desc: "Background-checked, trained & certified before onboarding.",         color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
  { icon: Shield,       title: "Transparent Pricing",  desc: "Price shown upfront. What you see is what you pay — always.",        color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
  { icon: Award,        title: "90-Day Warranty",      desc: "All services covered under a 90-day quality guarantee.",             color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  { icon: Headphones,   title: "24/7 Support",         desc: "Reach us anytime via WhatsApp, call or in-app chat.",               color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: CalendarCheck,title: "Doorstep Service",     desc: "Mechanic comes to your home, office, or anywhere you say.",         color: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20"    },
  { icon: ThumbsUp,     title: "Zero Advance Payment", desc: "Parts cost shown before replacement. You approve. Pay after job.",   color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20"    },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", city: "Bengaluru", rating: 5, text: "Got my Activa serviced at home. Mechanic arrived on time and did a thorough job. Saved me a full day at the workshop.",         bike: "Honda Activa 6G",         initials: "RS", bg: "bg-violet-700" },
  { name: "Priya Menon",  city: "Hyderabad", rating: 5, text: "Battery replaced in 30 minutes outside my apartment. Mechanic even checked the wiring for free. Highly recommended.",          bike: "TVS Jupiter",             initials: "PM", bg: "bg-emerald-700"},
  { name: "Karthik R",    city: "Chennai",   rating: 5, text: "Transparent pricing, zero hidden charges. They showed me every part before replacing it. That level of honesty is rare.",       bike: "Royal Enfield Classic 350",initials: "KR", bg: "bg-sky-700"    },
];

const CITIES = [
  "Bengaluru","Hyderabad","Chennai","Pune","Mumbai",
  "Delhi NCR","Ahmedabad","Jaipur","Coimbatore","Kochi",
  "Nagpur","Indore","Bhopal","Visakhapatnam","Mysuru",
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED SCOOTER SVG  (Honda Activa-style Indian scooter, left-facing)
// ─────────────────────────────────────────────────────────────────────────────

function ScooterSVG() {
  const spokeAngles = [0, 45, 90, 135];

  function Wheel({ cx, cy, speed }: { cx: number; cy: number; speed: string }) {
    return (
      <g transform={`translate(${cx} ${cy})`}>
        {/* Spinning group */}
        <g style={{ animation: `wheel-spin ${speed} linear infinite`, transformOrigin: "0 0" }}>
          {/* Outer tyre */}
          <circle r="56" stroke="#161626" strokeWidth="13" fill="none" />
          {/* Tyre highlight */}
          <circle r="56" stroke="#1E1E38" strokeWidth="2" fill="none" strokeDasharray="20 12" strokeDashoffset="0" />
          {/* Alloy rim ring */}
          <circle r="41" stroke="#222240" strokeWidth="4" fill="none" />
          {/* Inner rim detail */}
          <circle r="33" stroke="#1A1A32" strokeWidth="1.5" fill="none" strokeDasharray="8 5" />
          {/* 8 spokes */}
          {spokeAngles.map((a) => {
            const r = (a * Math.PI) / 180;
            const x2 = 39 * Math.cos(r), y2 = 39 * Math.sin(r);
            return (
              <g key={a}>
                <line x1="0" y1="0" x2={x2}  y2={y2}  stroke="#222240" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="0" x2={-x2} y2={-y2} stroke="#222240" strokeWidth="3" strokeLinecap="round" />
              </g>
            );
          })}
          {/* Valve stem */}
          <rect x="-3" y="-57" width="6" height="11" rx="2.5" fill="#252548" />
        </g>
        {/* Static hub cap (does NOT spin) */}
        <circle r="11" fill="#0E0E20" stroke="#252548" strokeWidth="2" />
        <circle r="5"  fill="#161630" stroke="#1E1E3A" strokeWidth="1" />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 600 275" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[580px]" aria-hidden="true">

      <defs>
        {/* Headlight glow gradient */}
        <radialGradient id="hlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#A78BFA" stopOpacity="1"   />
          <stop offset="45%"  stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"   />
        </radialGradient>
        {/* Headlight beam */}
        <linearGradient id="hlBeam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#A78BFA" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0"    />
        </linearGradient>
        {/* Ground glow */}
        <radialGradient id="gndGlow" cx="50%" cy="20%" r="80%">
          <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"   />
        </radialGradient>
        {/* Body gradient */}
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#141428" />
          <stop offset="100%" stopColor="#0A0A18" />
        </linearGradient>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx="290" cy="268" rx="252" ry="9" fill="url(#gndGlow)" />

      {/* ── Headlight forward beam ── */}
      <path d="M 548,110 L 600,72 M 550,135 L 600,135 M 548,160 L 600,198"
        stroke="url(#hlBeam)" strokeWidth="20" strokeLinecap="round"
        style={{ animation: "headlight-beam 2.5s ease-in-out infinite" }} />

      {/* ══ BODY PANELS ══════════════════════════════════════════════════════ */}

      {/* Rear fender (arch over rear wheel at 112,210) */}
      <path d="M 56,207 A 60,60 0 0,1 172,207 L 165,185 A 50,50 0 0,0 63,185 Z"
        fill="#0C0C1E" stroke="#181832" strokeWidth="1.5" />

      {/* Main rear body + engine mount */}
      <path d="M 65,185 L 68,142 Q 72,110 96,94 L 106,89 Q 105,79 114,70 L 210,67 Q 240,65 256,88 L 263,185 Z"
        fill="url(#bodyGrad)" stroke="#181832" strokeWidth="1.5" />

      {/* Rear body lower accent panel */}
      <path d="M 78,160 L 82,128 Q 86,108 104,96 L 114,89 Q 130,85 160,85 L 200,85"
        stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />

      {/* Seat */}
      <path d="M 102,70 Q 118,50 155,43 L 212,43 Q 238,45 250,63 L 250,73 Q 218,88 174,90 Q 143,89 102,77 Z"
        fill="#08081A" stroke="#161630" strokeWidth="1.5" />
      {/* Seat cushion stitching */}
      <path d="M 112,57 Q 162,47 240,57"
        stroke="#1E1E38" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
      {/* Seat chrome trim */}
      <path d="M 106,63 Q 160,52 244,63"
        stroke="#222240" strokeWidth="2.5" fill="none" />

      {/* Footboard platform */}
      <path d="M 152,185 L 394,185 L 392,164 L 154,164 Z"
        fill="#0C0C1C" stroke="#181830" strokeWidth="1.5" />
      {/* Footboard grip lines */}
      <line x1="158" y1="174" x2="388" y2="174" stroke="#141428" strokeWidth="1" />
      <line x1="172" y1="168" x2="172" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="200" y1="168" x2="200" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="228" y1="168" x2="228" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="256" y1="168" x2="256" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="284" y1="168" x2="284" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="312" y1="168" x2="312" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="340" y1="168" x2="340" y2="181" stroke="#141428" strokeWidth="1" />
      <line x1="368" y1="168" x2="368" y2="181" stroke="#141428" strokeWidth="1" />

      {/* Front legshield / apron */}
      <path d="M 263,185 L 281,116 Q 302,60 344,37 Q 376,20 408,35 L 410,63 Q 381,75 366,97 L 359,185 Z"
        fill="url(#bodyGrad)" stroke="#181832" strokeWidth="1.5" />
      {/* Front body accent */}
      <path d="M 294,140 Q 322,100 372,68"
        stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />

      {/* Front fender */}
      <path d="M 416,208 A 58,58 0 0,0 524,208 L 515,186 A 48,48 0 0,1 425,186 Z"
        fill="#0C0C1E" stroke="#181832" strokeWidth="1.5" />

      {/* ══ CHASSIS / FORK ══════════════════════════════════════════════════ */}

      {/* Front fork — two parallel tubes */}
      <line x1="381" y1="57" x2="471" y2="190"
        stroke="#101020" strokeWidth="12" strokeLinecap="round" />
      <line x1="393" y1="55" x2="483" y2="190"
        stroke="#0A0A18" strokeWidth="9"  strokeLinecap="round" />
      {/* Fork chrome highlight */}
      <line x1="385" y1="57" x2="475" y2="190"
        stroke="#1E1E3A" strokeWidth="2" strokeLinecap="round" />

      {/* Rear shock absorber */}
      <line x1="185" y1="150" x2="130" y2="192"
        stroke="#101020" strokeWidth="9" strokeLinecap="round" />
      <line x1="181" y1="148" x2="126" y2="190"
        stroke="#1A1A30" strokeWidth="3" strokeLinecap="round" />
      {/* Spring coils */}
      <path d="M 143,188 Q 150,183 157,188 Q 164,193 171,188 Q 178,183 185,188"
        stroke="#202038" strokeWidth="2.5" fill="none" />

      {/* ══ HANDLEBAR ══════════════════════════════════════════════════════ */}

      {/* Main bar */}
      <rect x="320" y="36" width="118" height="13" rx="5.5"
        fill="#181830" stroke="#242448" strokeWidth="1.5" />
      {/* Left grip */}
      <rect x="312" y="33" width="24" height="19" rx="7"
        fill="#0E0E20" stroke="#1E1E38" strokeWidth="1.5" />
      {/* Right grip */}
      <rect x="422" y="33" width="24" height="19" rx="7"
        fill="#0E0E20" stroke="#1E1E38" strokeWidth="1.5" />
      {/* Brake lever left */}
      <path d="M 324,44 L 312,57" stroke="#202038" strokeWidth="3" strokeLinecap="round" />
      {/* Throttle lever right */}
      <path d="M 433,44 L 445,57" stroke="#202038" strokeWidth="3" strokeLinecap="round" />
      {/* Instrument cluster center */}
      <rect x="365" y="30" width="28" height="22" rx="4"
        fill="#0A0A18" stroke="#1A1A32" strokeWidth="1.5" />
      <circle cx="379" cy="41" r="7" stroke="#7C3AED" strokeWidth="1" strokeOpacity="0.5" fill="none" />

      {/* ── Mirrors ── */}
      <line x1="330" y1="42" x2="308" y2="26" stroke="#181830" strokeWidth="3" strokeLinecap="round" />
      <rect x="284" y="15" width="30" height="20" rx="4"
        fill="#0A0A18" stroke="#1A1A30" strokeWidth="1.5" />
      <rect x="286" y="17" width="26" height="16" rx="3" fill="#101022" />

      <line x1="440" y1="42" x2="464" y2="26" stroke="#181830" strokeWidth="3" strokeLinecap="round" />
      <rect x="464" y="15" width="30" height="20" rx="4"
        fill="#0A0A18" stroke="#1A1A30" strokeWidth="1.5" />
      <rect x="466" y="17" width="26" height="16" rx="3" fill="#101022" />

      {/* ══ HEADLIGHT ASSEMBLY ═════════════════════════════════════════════ */}

      {/* Outer housing */}
      <circle cx="530" cy="136" r="38" fill="#0A0A1C" stroke="#181832" strokeWidth="2" />
      {/* Reflector bezel */}
      <circle cx="530" cy="136" r="32" fill="#080818" stroke="#1E1E38" strokeWidth="2" />
      {/* Lens */}
      <circle cx="530" cy="136" r="25" fill="#0C0C22" />
      {/* LED element */}
      <circle cx="530" cy="136" r="15" fill="#101028" stroke="#252550" strokeWidth="1.5" />
      {/* Animated inner glow */}
      <circle cx="530" cy="136" r="12" fill="url(#hlGlow)"
        style={{ animation: "headlight-glow 2s ease-in-out infinite" }} />
      {/* DRL strip (left side of headlight) */}
      <path d="M 494,114 Q 490,136 494,158"
        stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Turn signal */}
      <rect x="490" y="100" width="14" height="8" rx="3" fill="#1A1010" stroke="#2A1818" strokeWidth="1" />

      {/* ══ DETAILS ════════════════════════════════════════════════════════ */}

      {/* Taillight */}
      <rect x="46" y="108" width="26" height="18" rx="5"
        fill="#180010" stroke="#280018" strokeWidth="1.5" />
      <rect x="48" y="110" width="22" height="14" rx="4" fill="#200018" />
      {/* Taillight lens detail */}
      <line x1="57" y1="110" x2="57" y2="124" stroke="#2A0020" strokeWidth="1" />

      {/* Fuel cap */}
      <circle cx="158" cy="83" r="10" fill="#0E0E20" stroke="#1E1E38" strokeWidth="1.5" />
      <line x1="152" y1="83" x2="164" y2="83" stroke="#242445" strokeWidth="2" />
      <line x1="158" y1="77" x2="158" y2="89" stroke="#242445" strokeWidth="2" />

      {/* Engine block (beneath footboard) */}
      <path d="M 135,185 Q 128,210 145,218 L 228,218 Q 240,212 240,202 L 235,185 Z"
        fill="#08081A" stroke="#121224" strokeWidth="1.5" />
      {/* Engine cooling fins */}
      <line x1="148" y1="202" x2="232" y2="202" stroke="#121224" strokeWidth="1" />
      <line x1="150" y1="208" x2="232" y2="208" stroke="#121224" strokeWidth="1" />
      <line x1="153" y1="214" x2="230" y2="214" stroke="#121224" strokeWidth="1" />
      <circle cx="185" cy="200" r="4" fill="none" stroke="#1A1A30" strokeWidth="1.5" />

      {/* Exhaust pipe */}
      <path d="M 132,212 Q 110,224 86,221 Q 66,218 58,210"
        stroke="#101020" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 132,212 Q 110,224 86,221 Q 66,218 58,210"
        stroke="#1A1A30" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Exhaust tip */}
      <ellipse cx="57" cy="210" rx="6" ry="8" fill="#0C0C1E" stroke="#1A1A30" strokeWidth="1.5" />

      {/* Kickstand */}
      <path d="M 168,185 L 150,228 L 162,228 L 172,185"
        fill="#0C0C1E" stroke="#161630" strokeWidth="1.5" />

      {/* Brand accent ring on body */}
      <circle cx="188" cy="130" r="16" fill="none" stroke="#7C3AED"
        strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="188" cy="130" r="10" fill="#7C3AED" fillOpacity="0.07" />

      {/* ══ WHEELS ═════════════════════════════════════════════════════════ */}
      <Wheel cx={112} cy={210} speed="2.8s" />
      <Wheel cx={468} cy={210} speed="2.4s" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERLOCKING GEAR MESH  (three gears that rotate in sync)
// ─────────────────────────────────────────────────────────────────────────────

function GearMesh({ className }: { className?: string }) {
  function Gear({
    cx, cy, r, teeth, toothH, cw, speed,
  }: { cx:number; cy:number; r:number; teeth:number; toothH:number; cw:boolean; speed:string }) {
    return (
      <g transform={`translate(${cx} ${cy})`}
        style={{ animation: `${cw ? "wheel-spin" : "gear-ccw"} ${speed} linear infinite`, transformOrigin: "0 0" }}>
        {Array.from({ length: teeth }).map((_, i) => (
          <rect key={i} x="-5" y={-(r + toothH)} width="10" height={toothH + 2} rx="2.5"
            fill="currentColor" transform={`rotate(${(i / teeth) * 360})`} />
        ))}
        <circle r={r}      stroke="currentColor" strokeWidth="5" />
        <circle r={r * 0.46} stroke="currentColor" strokeWidth="10" />
        <circle r={r * 0.18} fill="currentColor" />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 240 160" fill="none" className={className} aria-hidden="true">
      <Gear cx={60}  cy={80} r={48} teeth={14} toothH={12} cw={true}  speed="8s"  />
      <Gear cx={154} cy={80} r={34} teeth={10} toothH={9}  cw={false} speed="5.7s"/>
      <Gear cx={210} cy={42} r={22} teeth={6}  toothH={7}  cw={true}  speed="3.7s"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DECORATIVE TIRE  (for section backgrounds)
// ─────────────────────────────────────────────────────────────────────────────

function TireDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="12" />
      <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="3"  strokeDasharray="10 7" />
      <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="20" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a) => (
        <rect key={a} x="92" y="4" width="16" height="22" rx="4"
          fill="currentColor" transform={`rotate(${a} 100 100)`} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARK PARTICLES  (flying from rear wheel area)
// ─────────────────────────────────────────────────────────────────────────────

function SparkParticles() {
  return (
    <div className="absolute pointer-events-none" style={{ bottom: "30%", left: "11%" }}>
      {SPARKS.map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width:  `${s.size}px`,
          height: `${s.size}px`,
          top: "0", left: "0",
          backgroundColor: s.color,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          ["--spark-x" as string]: `${s.dx}px`,
          ["--spark-y" as string]: `${s.dy}px`,
          animationName: "spark-fly",
          animationDuration: `${s.dur}s`,
          animationDelay: `${s.delay}s`,
          animationTimingFunction: "ease-out",
          animationIterationCount: "infinite",
          animationFillMode: "both",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXHAUST SMOKE PUFFS
// ─────────────────────────────────────────────────────────────────────────────

function SmokePuffs() {
  return (
    <div className="absolute pointer-events-none" style={{ bottom: "28%", left: "8%" }}>
      {SMOKE_PUFFS.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white/[0.06] border border-white/[0.04]" style={{
          width:  `${s.size}px`,
          height: `${s.size}px`,
          bottom: 0, left: 0,
          ["--sx" as string]: `${s.sx}px`,
          animationName: "smoke-rise",
          animationDuration: `${s.dur}s`,
          animationDelay: `${s.delay}s`,
          animationTimingFunction: "ease-out",
          animationIterationCount: "infinite",
          animationFillMode: "both",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING TOOL ICONS
// ─────────────────────────────────────────────────────────────────────────────

function FloatingTools() {
  return (
    <>
      {FLOATING_TOOLS.map((t, i) => {
        const posStyle: React.CSSProperties = {
          position: "absolute",
          pointerEvents: "none",
          width: `${t.size}px`,
          height: `${t.size}px`,
          ...(t.top    && { top:    t.top    }),
          ...(t.right  && { right:  t.right  }),
          ...(t.left   && { left:   t.left   }),
          ...(t.bottom && { bottom: t.bottom }),
        };
        const animStyle: React.CSSProperties = t.spin ? {
          animationName: "wheel-spin",
          animationDuration: `${t.dur}s`,
          animationDelay: `${t.delay}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        } : {
          ["--r0" as string]: `${t.r0}deg`,
          ["--r1" as string]: `${t.r1}deg`,
          animationName: "tool-bob",
          animationDuration: `${t.dur}s`,
          animationDelay: `${t.delay}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationFillMode: "both",
        };
        return (
          <div key={i} style={posStyle}>
            <t.Icon style={{ ...animStyle, width: "100%", height: "100%", color: "rgba(124,58,237,0.25)" }} />
          </div>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BEACON PULSE  (live indicator ring)
// ─────────────────────────────────────────────────────────────────────────────

function BeaconPulse({ className }: { className?: string }) {
  return (
    <span className={`relative flex ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#06060B] text-white overflow-x-hidden">

      {/* ══ ANNOUNCEMENT BAR ════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-violet-950 via-primary to-violet-950 py-2.5 text-center text-xs font-medium text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(255,255,255,0.4) 0,rgba(255,255,255,0.4) 1px,transparent 1px,transparent 60px)" }} />
        <span className="relative inline-flex items-center gap-3">
          <BeaconPulse />
          Now serving 15+ cities across India — doorstep two-wheeler service by verified mechanics
          <span className="hidden sm:inline text-white/30">·</span>
          <a href="https://wa.me/919876543210" className="hidden sm:inline text-white/75 hover:text-white underline underline-offset-2 transition-colors">
            Chat on WhatsApp →
          </a>
        </span>
      </div>

      {/* ══ NAVIGATION ══════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#06060B]/92 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/40"
                 : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Mechiee" className="h-9 w-auto mix-blend-screen" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[["#services","Services"],["#how-it-works","How It Works"],["#why-us","Why Us"],["#for-garages","For Garages"],["#cities","Cities"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-white/50 hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/garage/login"
              className="text-sm text-white/55 hover:text-white border border-white/[0.1] hover:border-white/25 rounded-lg px-4 py-2.5 transition-all flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Garage Portal
            </Link>
            <Link href="/login"
              className="text-sm bg-primary hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-0.5">
              Book a Service →
            </Link>
          </div>

          <button className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0C0C18] border-t border-white/[0.07] px-4 pb-6 pt-3">
            {[["#services","Services"],["#how-it-works","How It Works"],["#why-us","Why Us"],["#for-garages","For Garages"],["#cities","Cities"]].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3.5 text-sm text-white/65 border-b border-white/[0.06] hover:text-white">
                {label} <ArrowRight className="w-3.5 h-3.5 text-white/25" />
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2.5 pt-5">
              <Link href="/garage/login" className="flex items-center justify-center gap-1.5 text-sm border border-white/10 text-white/65 rounded-xl py-3 font-medium">
                <LayoutDashboard className="w-3.5 h-3.5" /> Garage
              </Link>
              <Link href="/login" className="flex items-center justify-center bg-primary text-white text-sm rounded-xl py-3 font-bold shadow-lg shadow-primary/30">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* ── Background atmosphere ── */}
        <div className="absolute inset-0 bg-[#06060B]" />

        {/* Warm workshop spotlight on the right (where the bike is) */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 55% 65% at 72% 60%, rgba(251,146,60,0.07) 0%, transparent 55%)"
        }} />
        {/* Cool violet studio light */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 75% 65% at 55% 38%, rgba(109,40,217,0.20) 0%, transparent 62%)"
        }} />
        {/* Ceiling work light from above-right */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 35% 25% at 68% 0%, rgba(255,255,255,0.05) 0%, transparent 100%)",
                   animation: "work-light-sway 6s ease-in-out infinite" }} />

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }} />

        {/* Perspective garage floor grid (bottom portion) */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
          <div className="w-full h-full"
            style={{
              backgroundImage: "linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              transform: "perspective(280px) rotateX(58deg)",
              transformOrigin: "50% 100%",
              animation: "floor-breathe 5s ease-in-out infinite",
            }} />
        </div>

        {/* Top edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

        {/* Floating tool icons (behind content) */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <FloatingTools />
        </div>

        {/* ── Content ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-[1fr_520px] gap-10 items-center">

            {/* Left: Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.09] text-xs text-white/65 px-4 py-2 rounded-full mb-9 backdrop-blur-sm">
                <BeaconPulse />
                Available Now &middot; 15+ Cities &middot; 10,000+ Services Completed
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight mb-6">
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
                  className="group flex items-center justify-center gap-2.5 bg-primary hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5">
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:+919876543210"
                  className="flex items-center justify-center gap-2.5 border border-white/12 hover:border-white/25 hover:bg-white/[0.04] text-white/70 hover:text-white px-8 py-4 rounded-xl font-medium text-base transition-all">
                  <Phone className="w-4 h-4" /> +91 98765 43210
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-stretch divide-x divide-white/10">
                {[{v:"10,000+",l:"Services Done"},{v:"500+",l:"Verified Garages"},{v:"15+",l:"Cities"},{v:"4.8★",l:"Avg Rating"}].map((s) => (
                  <div key={s.l} className="px-5 first:pl-0">
                    <div className="text-2xl font-extrabold text-white">{s.v}</div>
                    <div className="text-xs text-white/38 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Animated scooter scene */}
            <div className="relative hidden lg:flex flex-col items-center justify-center">
              {/* Glow behind scooter */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-72 bg-primary/12 blur-3xl rounded-full" />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-20 bg-orange-500/6 blur-2xl rounded-full" />
              </div>

              {/* Floating metric badges */}
              <div className="absolute top-6 right-0 bg-[#0D0D1C] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl z-10">
                <div className="flex items-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white text-sm font-bold">4.8 / 5.0</p>
                <p className="text-white/38 text-[10px]">2,400+ reviews</p>
              </div>

              <div className="absolute bottom-16 right-2 bg-[#0D0D1C] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-white text-xs font-bold">Zero Advance</p>
                    <p className="text-white/38 text-[10px]">Pay after service</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 left-0 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 shadow-2xl z-10">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-white text-xs font-bold">500+ Garages</p>
                    <p className="text-white/38 text-[10px]">Across 15 cities</p>
                  </div>
                </div>
              </div>

              {/* THE SCOOTER */}
              <div className="relative z-10 w-full">
                <ScooterSVG />
              </div>

              {/* Spark particles near rear wheel */}
              <SparkParticles />
              {/* Exhaust smoke */}
              <SmokePuffs />
            </div>

          </div>
        </div>
      </section>

      {/* ══ TRUST MARQUEE ═══════════════════════════════════════════════════ */}
      <div className="border-y border-white/[0.05] bg-white/[0.015] py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center flex-shrink-0">
              {TRUST_STRIP.map((item, i) => (
                <div key={i} className="flex items-center px-8 gap-2.5 flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-white/42 text-sm font-medium">{item.text}</span>
                  <span className="text-white/10 ml-6">◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS BAR ═══════════════════════════════════════════════════════ */}
      <section className="relative py-16 overflow-hidden">
        {/* Gear mesh decoration */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-56 h-40 text-violet-700/[0.12] pointer-events-none">
          <GearMesh className="w-full h-full" />
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 80% at 50% 50%, rgba(109,40,217,0.07) 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02]">
            {[
              { value: "10,000+", label: "Services Completed", sub: "And growing every day",   icon: CheckCircle,  color: "text-violet-400" },
              { value: "500+",    label: "Partner Garages",    sub: "Verified & trained",        icon: BadgeCheck,   color: "text-emerald-400"},
              { value: "15+",     label: "Cities Active",      sub: "Expanding monthly",         icon: MapPin,       color: "text-sky-400"    },
              { value: "4.8★",   label: "Customer Rating",    sub: "From 2,400+ reviews",       icon: Star,         color: "text-amber-400"  },
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

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #06060B, #0B0A18, #06060B)" }} />
        {/* Gear mesh background decoration */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-80 h-56 text-violet-800/[0.14] pointer-events-none">
          <GearMesh className="w-full h-full" />
        </div>
        {/* Tire decoration left */}
        <div className="absolute -left-20 top-1/4 w-[320px] h-[320px] text-violet-900/[0.08] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Booked & at your door<br />
              <span className="text-white/32">in under 2 minutes.</span>
            </h2>
            <p className="text-white/48 text-lg">No calls, no confusion. Select, schedule, and relax — we handle everything else.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step:"01", icon:Search,        title:"Choose Your Service",desc:"Browse 20+ services with clear, upfront pricing. No surprises, ever.",                            grad:"from-violet-500/15",border:"border-violet-500/20",ic:"text-violet-400",ib:"bg-violet-500/15"},
              { step:"02", icon:CalendarCheck,  title:"Pick Date & Time",  desc:"Schedule at your convenience — same day or advance booking available.",                           grad:"from-sky-500/15",   border:"border-sky-500/20",   ic:"text-sky-400",   ib:"bg-sky-500/15"   },
              { step:"03", icon:Bike,           title:"Mechanic Arrives",  desc:"Your verified mechanic reaches your location. Track them live in the app.",                       grad:"from-amber-500/15", border:"border-amber-500/20", ic:"text-amber-400", ib:"bg-amber-500/15" },
              { step:"04", icon:IndianRupee,    title:"Pay After Service", desc:"Inspect the completed work. Pay via UPI, card, or cash. Zero advance needed.",                    grad:"from-emerald-500/15",border:"border-emerald-500/20",ic:"text-emerald-400",ib:"bg-emerald-500/15"},
            ].map((step, i) => (
              <div key={step.step} className="relative group">
                {i < 3 && <div className="hidden md:block absolute top-10 left-[calc(100%-0.75rem)] w-[calc(100%-1.5rem)] h-px border-t border-dashed border-white/[0.08] z-0" />}
                <div className={`relative z-10 bg-gradient-to-b ${step.grad} to-transparent border ${step.border} rounded-2xl p-6 h-full transition-all group-hover:-translate-y-1.5`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 ${step.ib} rounded-xl flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 ${step.ic}`} />
                    </div>
                    <span className="text-5xl font-black text-white/[0.05]">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2.5">{step.title}</h3>
                  <p className="text-white/43 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 8% 60%, rgba(59,130,246,0.04) 0%, transparent 55%)" }} />
        {/* Tire bg decoration */}
        <div className="absolute -right-16 bottom-10 w-[420px] h-[420px] text-violet-900/[0.07] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Services & Pricing</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Transparent prices,<br />
                <span className="text-white/32">zero surprises.</span>
              </h2>
            </div>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed md:text-right">
              All-inclusive: labour + consumables. Parts cost shown before replacement — you approve, always.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.label}
                className="relative group bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-6 transition-all hover:-translate-y-1.5">
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
                <p className="text-xs text-white/40 leading-relaxed mb-5">{svc.desc}</p>
                <Link href="/login"
                  className={`flex items-center justify-center gap-1.5 w-full border border-white/[0.08] hover:border-primary/50 hover:bg-primary/10 ${svc.text} hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all`}>
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/25 text-center mt-8">
            * Starting prices. Final price may vary by bike model. You are always informed before any additional work begins.
          </p>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ═══════════════════════════════════════════════════ */}
      <section id="why-us" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #06060B, #090918, #06060B)" }} />
        <div className="absolute inset-y-0 left-0 right-0 border-y border-white/[0.04]" />
        {/* Gear decoration */}
        <div className="absolute -left-10 bottom-0 w-[280px] h-48 text-violet-800/[0.12] pointer-events-none">
          <GearMesh className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Why Choose Mechiee</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Built on trust.<br />Backed by quality.
            </h2>
            <p className="text-white/43 text-lg">
              Every decision we make is designed around giving you a stress-free, transparent, and reliable service experience.
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
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 75% at 80% 50%, rgba(109,40,217,0.07) 0%, transparent 60%)" }} />
        <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] text-violet-900/[0.07] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Real Reviews</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Don&apos;t take our word.<br />
              <span className="text-white/32">Ask our customers.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col hover:border-white/[0.12] transition-all hover:-translate-y-1">
                <div className="text-5xl font-serif text-primary/18 leading-none mb-2 -mt-1 select-none">&ldquo;</div>
                <p className="text-white/62 text-sm leading-relaxed flex-1 mb-5">{t.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                  <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
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

      {/* ══ FOR GARAGES ═════════════════════════════════════════════════════ */}
      <section id="for-garages" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.11) 0%, rgba(59,130,246,0.04) 50%, transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/22 to-transparent" />
        {/* Gear + tire decoration */}
        <div className="absolute -right-10 -bottom-10 w-[380px] h-[260px] text-violet-800/[0.12] pointer-events-none">
          <GearMesh className="w-full h-full" />
        </div>
        <div className="absolute -left-24 -top-24 w-[380px] h-[380px] text-violet-900/[0.06] pointer-events-none">
          <TireDecor className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> For Garage Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Partner with Mechiee.<br />
                <span className="text-white/32">Grow your business.</span>
              </h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
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
                  <li key={point} className="flex items-start gap-3 text-sm text-white/62">
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
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/22 text-white/62 hover:text-white px-7 py-3.5 rounded-xl font-medium transition-all">
                  <LayoutDashboard className="w-4 h-4" /> Existing Partner Login
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon:IndianRupee, title:"Extra Revenue Stream",   desc:"Avg ₹15K–40K/month in additional income from nearby doorstep bookings.",       color:"text-amber-400",  bg:"bg-amber-500/10",  border:"border-amber-500/20"  },
                { icon:Users,       title:"Larger Customer Base",   desc:"Access thousands of app users in your city actively looking for service.",        color:"text-sky-400",    bg:"bg-sky-500/10",    border:"border-sky-500/20"    },
                { icon:TrendingUp,  title:"Analytics Dashboard",    desc:"Track earnings, ratings, and job history in real time. Know your numbers.",       color:"text-emerald-400",bg:"bg-emerald-500/10",border:"border-emerald-500/20"},
                { icon:BadgeCheck,  title:"Mechiee Verified Badge", desc:"Verified garages earn 3× more bookings and deeper customer trust.",               color:"text-violet-400", bg:"bg-violet-500/10", border:"border-violet-500/20" },
              ].map((card) => (
                <div key={card.title}
                  className={`bg-white/[0.03] border ${card.border} rounded-2xl p-5 hover:bg-white/[0.05] transition-all hover:-translate-y-1`}>
                  <div className={`w-10 h-10 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center mb-4`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">{card.title}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/65 via-primary/42 to-purple-950/70" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        {/* Gear + tire in banner */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-64 h-44 text-white/[0.06] pointer-events-none">
          <GearMesh className="w-full h-full" />
        </div>
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-[300px] h-[300px] text-white/[0.05] pointer-events-none">
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
              className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-white/92 text-primary px-10 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-black/25 hover:-translate-y-0.5">
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

      {/* ══ CITIES ══════════════════════════════════════════════════════════ */}
      <section id="cities" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(14,116,144,0.04) 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Coverage</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Cities we serve</h2>
            <p className="text-white/40 text-lg">
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
                <span className="text-sm font-medium text-white/62 group-hover:text-white transition-colors">{city}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-primary/[0.08] border border-primary/20 rounded-xl px-5 py-3">
              <span className="text-sm font-semibold text-primary">+ More coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.07] bg-[#04040A] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
        <div className="absolute -right-20 -bottom-16 w-[320px] h-[320px] text-white/[0.015] pointer-events-none">
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
                <a href="tel:+919876543210" className="flex items-center gap-2.5 text-sm text-white/38 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-primary" /> +91 98765 43210
                </a>
                <a href="https://wa.me/919876543210" className="flex items-center gap-2.5 text-sm text-white/38 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp Support
                </a>
                <div className="flex items-center gap-2.5 text-sm text-white/38">
                  <MapPin className="w-4 h-4 text-primary" /> Bengaluru, Karnataka
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-[0.18em] mb-5">Services</h4>
              <ul className="space-y-3">
                {SERVICES.map((s) => (
                  <li key={s.label}>
                    <Link href="/login" className="text-sm text-white/32 hover:text-white transition-colors">{s.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-[0.18em] mb-5">Company</h4>
              <ul className="space-y-3">
                {[{label:"About Us",href:"#"},{label:"For Garages",href:"#for-garages"},{label:"Partner Program",href:"#"},{label:"Careers",href:"#"},{label:"Blog",href:"#"},{label:"Contact Us",href:"#"}].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/32 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-[0.18em] mb-5">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy","Terms of Service","Refund Policy","Cookie Policy"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-white/32 hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <p className="text-[10px] font-bold text-white/38 uppercase tracking-[0.15em] mb-3">Payments Accepted</p>
                <div className="flex flex-wrap gap-2">
                  {["UPI","Cards","Net Banking","Cash"].map((p) => (
                    <span key={p} className="text-xs bg-white/[0.04] border border-white/[0.07] px-3 py-1 rounded-lg text-white/38">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} Mechiee Technologies Pvt. Ltd. All rights reserved. &nbsp;GST: 29XXXXX1234Z1ZX
            </p>
            <p className="text-xs text-white/25">Made with &#9829; in India &#127470;&#127475;</p>
          </div>
        </div>
      </footer>

      {/* ══ FLOATING WHATSAPP ═══════════════════════════════════════════════ */}
      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 transition-all hover:scale-110 hover:-translate-y-1"
        title="Chat on WhatsApp">
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}
