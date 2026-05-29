"use client";

import Link from "next/link";
import {
  MapPin, Star, Shield, Clock, Bike, Battery, Droplets,
  Settings, Zap, CheckCircle, Menu, X, Phone, MessageCircle,
  ArrowRight, IndianRupee, Building2, TrendingUp, Users,
  BadgeCheck, ThumbsUp, Award, Headphones, CalendarCheck,
  Search, LayoutDashboard,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────
   GAUGE CONSTANTS  (module-level → no hydration mismatch)
───────────────────────────────────────────────────────────────── */
const CX = 210, CY = 210, R = 158;
const START = 215, SWEEP = 290;
const MAX_KMH = 160;
const TARGET_KMH  = 150;                                    // revs into redline
const REDLINE_KMH = 120;                                    // redline starts here
const REDLINE_A   = START + (REDLINE_KMH / MAX_KMH) * SWEEP; // angle where red begins
const REDLINE_SW  = ((MAX_KMH - REDLINE_KMH) / MAX_KMH) * SWEEP; // red arc sweep
const arcLen = 2 * Math.PI * R * (SWEEP / 360);            // ≈ 863

function toXY(deg: number, r: number, ox = CX, oy = CY) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: +(ox + r * Math.cos(rad)).toFixed(1), y: +(oy + r * Math.sin(rad)).toFixed(1) };
}
function arcD(r: number, a1: number, sweep: number, ox = CX, oy = CY) {
  const p1 = toXY(a1, r, ox, oy);
  const p2 = toXY(a1 + sweep, r, ox, oy);
  return `M${p1.x},${p1.y} A${r},${r} 0 ${sweep > 180 ? 1 : 0},1 ${p2.x},${p2.y}`;
}

const TICKS = Array.from({ length: 17 }, (_, i) => {
  const deg     = START + (i / 16) * SWEEP;
  const major   = i % 2 === 0;
  const kmh     = Math.round((i / 16) * MAX_KMH);
  const redline = kmh >= REDLINE_KMH;
  return {
    outer: toXY(deg, R),
    inner: toXY(deg, R - (major ? 22 : 13)),
    lp:    toXY(deg, R - 42),
    kmh, major, label: i % 4 === 0, redline,
  };
});
const NEEDLE_START = toXY(START, R - 16); // needle tip at 0 kmh

/* ─────────────────────────────────────────────────────────────────
   SHARED HOOKS
───────────────────────────────────────────────────────────────── */
function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.2) {
  const ref  = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/* ─────────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────────────────────────────── */
function ScrollProgressBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const d = document.documentElement;
      const total = d.scrollHeight - d.clientHeight;
      setW(total > 0 ? (d.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-amber-400"
        style={{ width: `${w}%`, transition: "width 0.1s linear" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   COUNT-UP NUMBER
───────────────────────────────────────────────────────────────── */
function CountUp({ to, fmt, duration = 1600, className = "" }: {
  to: number; fmt: (n: number) => string; duration?: number; className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5);
  const [n, setN]     = useState(0);
  const done          = useRef(false);
  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{fmt(n)}</span>;
}

/* ─────────────────────────────────────────────────────────────────
   SHIMMER CARD  – fades in + one-shot light sweep on entry
───────────────────────────────────────────────────────────────── */
function ShimmerCard({ delay = 0, className = "", children }: {
  delay?: number; className?: string; children: React.ReactNode;
}) {
  const ref               = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        opacity:    entered ? 1 : 0,
        transform:  entered ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}>
      {entered && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none animate-shimmer-sweep"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)",
            animationDelay: `${delay}s`,
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const SERVICES = [
  {
    icon: Zap,
    label: "Emergency Services",
    desc: "Quick help when you need it most.",
    items: ["Bike Breakdown Assistance", "Chain Break Fix", "Puncture Repair", "Battery Jumpstart / Replacement", "Tyre Replacement", "Minor On-Spot Repairs", "Emergency Inspection Services", "Others (Custom Requests)"],
    price: "Starting ₹199/Service",
    grad: "from-amber-500/20", text: "text-amber-400", border: "border-amber-500/25",
  },
  {
    icon: Settings,
    label: "Doorstep Services",
    desc: "Quality service at your home.",
    items: ["General Servicing", "Oil & Filter Change", "Brake Services", "Chain & Sprocket Check", "Air Filter Cleaning", "Electrical Checkup", "Tappet Adjustment", "Battery Health Check", "Clutch & Cable Adjustment", "Bike Wash & Polish", "Others (Custom Requests)"],
    price: "Starting ₹299",
    grad: "from-violet-500/20", text: "text-violet-400", border: "border-violet-500/25",
  },
  {
    icon: Building2,
    label: "Garage Experience",
    desc: "Expert repairs with advanced tools.",
    items: ["Advanced Diagnostics", "Engine Overhaul", "Suspension Repair", "Accidental Repairs", "Complete Bike Restoration", "Paint Touch-Up / Coating", "Parts Replacement", "Emission Check (PUC)", "Annual Maintenance Contracts (AMC)", "Others (Custom Requests)"],
    price: "Starting ₹399",
    grad: "from-sky-500/20", text: "text-sky-400", border: "border-sky-500/25",
  },
];
const TRUST_STRIP = [
  { icon: BadgeCheck,    text: "Verified Mechanics"   },
  { icon: Shield,        text: "90-Day Warranty"       },
  { icon: IndianRupee,   text: "No Hidden Charges"     },
  { icon: Clock,         text: "On-Time Guarantee"     },
  { icon: ThumbsUp,      text: "4.8★ Rated Service"    },
  { icon: MapPin,        text: "Doorstep Delivery"     },
  { icon: Headphones,    text: "24/7 Support"           },
  { icon: Bike,          text: "500+ Partner Garages"  },
];
const TRUST_POINTS = [
  { icon: CalendarCheck, title: "Easy Booking",        desc: "Book services in just 3 clicks through our user-friendly mobile app.",          color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
  { icon: MapPin,        title: "Real-time Tracking",  desc: "Track your mechanic's live location and get real-time updates.",                 color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
  { icon: Clock,         title: "Quick Response",      desc: "Emergency services available 24/7 with average response time of 30 minutes.",    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  { icon: BadgeCheck,    title: "Trusted Mechanics",   desc: "All mechanics are verified, trained, and background-checked professionals.",     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: IndianRupee,   title: "Transparent Pricing", desc: "No hidden charges. Pay securely online with multiple payment options.",          color: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20"    },
  { icon: Award,         title: "Quality Guarantee",   desc: "100% satisfaction guarantee with warranty on all services.",                    color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20"    },
];
const TESTIMONIALS = [
  { name: "Amit Kale",        city: "Hinjewadi, Pune",     rating: 5, text: "Fast and reliable service. My bike was picked up and returned on time. Highly recommended!",            bike: "Doorstep Service",  initials: "AK", bg: "bg-violet-700"  },
  { name: "Sneha Patil",      city: "Pimple Nilakh, Pune", rating: 5, text: "Loved the doorstep service! No hassle, and the team was very professional.",                          bike: "Doorstep Service",  initials: "SP", bg: "bg-emerald-700" },
  { name: "Rahul Deshmukh",   city: "Baner, Pune",         rating: 5, text: "They fixed my bike's chain issue quickly. Impressive response time and good pricing.",                 bike: "Emergency Service", initials: "RD", bg: "bg-sky-700"     },
  { name: "Neha Jagtap",      city: "Hinjewadi, Pune",     rating: 5, text: "The staff was very polite and experienced. Explained the repairs in detail.",                          bike: "Garage Service",    initials: "NJ", bg: "bg-amber-700"   },
  { name: "Saurabh Kulkarni", city: "Wakad, Pune",         rating: 5, text: "Smooth experience overall. Booking and service were both easy and efficient.",                        bike: "Doorstep Service",  initials: "SK", bg: "bg-pink-700"    },
];
const CITIES = [
  "Hinjewadi", "Pimple Nilakh", "Baner", "Wakad", "Aundh",
  "Kothrud", "Viman Nagar", "Hadapsar", "Koregaon Park", "Shivajinagar",
  "Kharadi", "Magarpatta", "Wanowrie", "Bavdhan", "Pashan",
  "Pimpri", "Chinchwad", "Akurdi", "Deccan", "Camp",
];

const PLANS = [
  {
    name: "Starter", price: "₹999", period: "/year",
    features: [
      { label: "Included Services", value: "1 General Servicing + Oil Change" },
      { label: "Pickup / Drop",     value: "1 Free / year" },
      { label: "Emergency Help",    value: "1 / year" },
      { label: "Booking Priority",  value: "Standard" },
      { label: "Support",           value: "Chat only" },
    ],
    cta: "Choose Starter", highlight: false,
    color: "text-violet-400", border: "border-violet-500/25", bg: "bg-violet-500/10",
  },
  {
    name: "Smart-Ride", price: "₹2,249", period: "/year",
    features: [
      { label: "Included Services", value: "4 Services (3 general + 1 emergency)" },
      { label: "Pickup / Drop",     value: "2 Free / year" },
      { label: "Emergency Help",    value: "1 / year" },
      { label: "Booking Priority",  value: "1.2× priority queue" },
      { label: "Support",           value: "Priority chat / call" },
    ],
    cta: "Choose Smart-Ride", highlight: true,
    color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/10",
  },
  {
    name: "Pro-Gear", price: "₹3,599", period: "/year",
    features: [
      { label: "Included Services", value: "2 Services (incl. oil changes) + 1 Emergency" },
      { label: "Pickup / Drop",     value: "Unlimited" },
      { label: "Emergency Help",    value: "1 / year" },
      { label: "Booking Priority",  value: "2× priority + direct line" },
      { label: "Support",           value: "Dedicated advisor" },
    ],
    cta: "Choose Pro-Gear", highlight: false,
    color: "text-sky-400", border: "border-sky-500/25", bg: "bg-sky-500/10",
  },
];

/* ─────────────────────────────────────────────────────────────────
   WORD REVEAL  – each word slides up on scroll
───────────────────────────────────────────────────────────────── */
function WordReveal({
  children, baseDelay = 0, className = "",
}: { children: string; baseDelay?: number; className?: string }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline ${className}`} aria-label={children}>
      {children.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden leading-[1.1]">
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              willChange: "transform, opacity",
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(110%)",
              transition: "opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: `${baseDelay + i * 0.065}s`,
            }}>
            {word}
          </span>
          {i < children.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FADE IN  – element fades + rises when scrolled into view
───────────────────────────────────────────────────────────────── */
function FadeIn({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        willChange: "transform, opacity",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(26px)",
        transition: `opacity 0.7s ease, transform 0.7s ease`,
        transitionDelay: `${delay}s`,
      }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SPEEDOMETER SVG  (scroll-driven via parent ref)
───────────────────────────────────────────────────────────────── */
function Speedometer({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) {
  // Mini gauge helper
  function MiniGauge({ x, y, r, color, label, value, fill }: {
    x: number; y: number; r: number;
    color: string; label: string; value: string; fill: number; // 0-1
  }) {
    const mStart = 215, mSweep = 250;
    const mLen = 2 * Math.PI * r * mSweep / 360;
    const mFilled = mLen * fill;
    const mNeedleAngle = mStart + fill * mSweep;
    const tip = toXY(mNeedleAngle, r - 10, x, y);
    return (
      <g>
        <circle cx={x} cy={y} r={r + 6} fill="#060614" stroke="#151530" strokeWidth="1.5" />
        <circle cx={x} cy={y} r={r + 2} stroke="#0D0D26" strokeWidth="1" fill="none" strokeDasharray="4 6" />
        <path d={arcD(r, mStart, mSweep, x, y)} stroke="#111128" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d={arcD(r, mStart, mSweep, x, y)} stroke={color} strokeWidth="4.5" strokeLinecap="round"
          fill="none" strokeOpacity="0.8"
          strokeDasharray={`${mFilled.toFixed(1)} ${mLen.toFixed(1)}`} strokeDashoffset="0" />
        <line x1={x} y1={y} x2={tip.x} y2={tip.y} stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={x} cy={y} r={6} fill="#090918" stroke="#1E1E3C" strokeWidth="1.5" />
        <circle cx={x} cy={y} r={2.5} fill="#F59E0B" />
        <text x={x} y={y + 18} textAnchor="middle" fill="rgba(255,255,255,0.7)"
          fontSize="10" fontWeight="700" fontFamily="Inter,system-ui,sans-serif">{value}</text>
        <text x={x} y={y + 28} textAnchor="middle" fill="rgba(255,255,255,0.3)"
          fontSize="7" letterSpacing="1.5" fontFamily="Inter,system-ui,sans-serif">{label}</text>
      </g>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 420 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] select-none"
      aria-hidden="true">
      <defs>
        <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse"
          x1={toXY(START, R).x}         y1={toXY(START, R).y}
          x2={toXY(START + SWEEP, R).x} y2={toXY(START + SWEEP, R).y}>
          <stop offset="0%"   stopColor="#7C3AED" />
          <stop offset="55%"  stopColor="#A78BFA" />
          <stop offset="78%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <radialGradient id="dialBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0F0F22" />
          <stop offset="100%" stopColor="#060614" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="needleGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Dial background ── */}
      <circle cx={CX} cy={CY} r="200" fill="url(#dialBg)" />
      <circle cx={CX} cy={CY} r="198" stroke="#1C1C3A" strokeWidth="3"   fill="none" />
      <circle cx={CX} cy={CY} r="192" stroke="#101025" strokeWidth="1"   fill="none" />
      <circle cx={CX} cy={CY} r="186" stroke="#171732" strokeWidth="1.5" fill="none" strokeDasharray="6 9" />

      {/* ── Track arc (background) ── */}
      <path d={arcD(R, START, SWEEP)} stroke="#0D0D22" strokeWidth="28" strokeLinecap="round" fill="none" />
      <path d={arcD(R, START, SWEEP)} stroke="#1A1A36" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* ── Redline zone arc ── */}
      <path d={arcD(R, REDLINE_A, REDLINE_SW)} stroke="rgba(239,68,68,0.22)" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* ── Active arc — scroll-driven via JS (starts fully hidden) ── */}
      <path
        id="gauge-arc"
        d={arcD(R, START, SWEEP)}
        stroke="url(#gaugeGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
        strokeDasharray={`${arcLen.toFixed(1)} ${arcLen.toFixed(1)}`}
        strokeDashoffset={arcLen.toFixed(1)}
      />

      {/* ── Ticks ── */}
      {TICKS.map((t, i) => (
        <g key={i}>
          <line x1={t.outer.x} y1={t.outer.y} x2={t.inner.x} y2={t.inner.y}
            stroke={t.redline ? (t.major ? "#EF4444" : "#F97316") : (t.major ? "#3A3A68" : "#1E1E40")}
            strokeWidth={t.major ? 2.5 : 1.5} strokeLinecap="round" />
          {t.label && (
            <text x={t.lp.x} y={t.lp.y} textAnchor="middle" dominantBaseline="middle"
              fill={t.redline ? "rgba(239,68,68,0.75)" : "rgba(255,255,255,0.55)"} fontSize="12" fontWeight="600"
              fontFamily="Inter,system-ui,sans-serif">{t.kmh}</text>
          )}
        </g>
      ))}

      {/* ── Needle — scroll-driven via JS (starts at START angle = 0 rotation) ── */}
      <g id="gauge-needle" filter="url(#needleGlow)">
        {/* Glow trail */}
        <line x1={CX} y1={CY} x2={NEEDLE_START.x} y2={NEEDLE_START.y}
          stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.12" />
        {/* Main needle */}
        <line x1={CX} y1={CY} x2={NEEDLE_START.x} y2={NEEDLE_START.y}
          stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* ── Hub cap ── */}
      <circle cx={CX} cy={CY} r="18" fill="#090918" stroke="#1E1E3C" strokeWidth="2.5" />
      <circle cx={CX} cy={CY} r="8"  fill="#F59E0B" />
      <circle cx={CX} cy={CY} r="3"  fill="#FDE68A" />

      {/* ── Inner detail rings ── */}
      <circle cx={CX} cy={CY} r="75" stroke="#0E0E22" strokeWidth="1.5" fill="none" />
      <circle cx={CX} cy={CY} r="68" stroke="#0A0A1C" strokeWidth="1"   fill="none" strokeDasharray="4 8" />

      {/* ── Speed value — updated by JS ── */}
      <text id="speed-value" x={CX} y={CY + 32} textAnchor="middle"
        fill="white" fontSize="58" fontWeight="800" fontFamily="Inter,system-ui,sans-serif">
        0
      </text>
      <text x={CX} y={CY + 55} textAnchor="middle"
        fill="rgba(255,255,255,0.38)" fontSize="12" letterSpacing="3"
        fontFamily="Inter,system-ui,sans-serif">km/h</text>
      <image href="/logo.png" x={CX - 52} y={CY - 82} width="104" height="38"
        style={{ filter: "brightness(0) invert(1)", opacity: 0.52 }} />

      {/* ── Mini gauges (static, decorative) ── */}
      <MiniGauge x={355} y={342} r={44} color="#7C3AED" label="RPM"  value="3.2k" fill={0.52} />
      <MiniGauge x={65}  y={342} r={44} color="#10B981" label="FUEL" value="3/4"  fill={0.72} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TESTIMONIALS CAROUSEL  – swipe on mobile, 3-col grid on desktop
───────────────────────────────────────────────────────────────── */
function TestimonialsCarousel() {
  const [active, setActive]       = useState(0);
  const trackRef                  = useRef<HTMLDivElement>(null);
  const [containerRef, visible]   = useInView(0.15);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement;
    if (!card) return;
    const step = card.offsetWidth + 16; // card width + gap-4
    setActive(Math.max(0, Math.min(TESTIMONIALS.length - 1, Math.round(el.scrollLeft / step))));
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    setActive(i);
    const card = el.children[i] as HTMLElement;
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <div ref={containerRef}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none" }}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 -mx-4 px-4 [&::-webkit-scrollbar]:hidden
                   md:grid md:grid-cols-3 md:overflow-x-visible md:snap-none md:mx-0 md:px-0">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            className="snap-start shrink-0 w-[82vw] md:w-auto bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col hover:border-white/[0.12] transition-colors"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.65s ease ${i * 0.12}s, transform 0.65s ease ${i * 0.12}s`,
            }}>
            <div className="text-5xl font-serif text-primary/15 leading-none mb-2 -mt-1 select-none">&ldquo;</div>
            <p className="text-white/60 text-sm leading-relaxed flex-1 mb-5">{t.text}</p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
              <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.initials}</div>
              <div>
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-xs text-white/35">{t.bike} &middot; {t.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators — mobile only */}
      <div className="flex justify-center gap-2 mt-5 md:hidden">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to review ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === i ? "w-6 bg-violet-400" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export function LandingPage() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [mounted,  setMounted]    = useState(false);

  // Scroll-triggered section refs
  const [stepsRef, stepsInView]   = useInView<HTMLDivElement>(0.15);
  const [ctaRef,   ctaInView]     = useInView<HTMLElement>(0.2);

  // Speedometer scroll-drive refs
  const svgRef          = useRef<SVGSVGElement>(null);
  const arcRef          = useRef<SVGPathElement | null>(null);
  const needleRef       = useRef<SVGGElement | null>(null);
  const speedTextRef    = useRef<SVGTextElement | null>(null);
  const currentSpeed    = useRef(0);
  const targetSpeed     = useRef(0);
  const rafId           = useRef<number | null>(null);
  const lastDisplayed   = useRef(-1);

  /* Cache SVG element refs once on mount */
  const cacheSvgRefs = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    arcRef.current       = svg.querySelector<SVGPathElement>("#gauge-arc");
    needleRef.current    = svg.querySelector<SVGGElement>("#gauge-needle");
    speedTextRef.current = svg.querySelector<SVGTextElement>("#speed-value");
  }, []);

  /* RAF animation loop – smooth lerp toward targetSpeed */
  const startLoop = useCallback(() => {
    const tick = () => {
      const cur    = currentSpeed.current;
      const tgt    = targetSpeed.current;
      const next   = cur + (tgt - cur) * 0.055;
      const snapped = Math.abs(next - cur) < 0.04 ? tgt : next;
      currentSpeed.current = snapped;

      const progress = Math.max(0, Math.min(1, snapped / MAX_KMH));
      const offset   = arcLen * (1 - progress);
      const rotation = progress * SWEEP;
      const kmhInt   = Math.round(snapped);

      if (arcRef.current)
        arcRef.current.style.strokeDashoffset = offset.toFixed(2);
      if (needleRef.current)
        needleRef.current.setAttribute("transform", `rotate(${rotation.toFixed(2)} ${CX} ${CY})`);
      if (speedTextRef.current && kmhInt !== lastDisplayed.current) {
        speedTextRef.current.textContent = kmhInt.toString();
        lastDisplayed.current = kmhInt;
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, []);

  /* Scroll → target speed mapping */
  const onScroll = useCallback(() => {
    // Hero is ~92vh tall. Map scrollY 0 → 55%·vh to speed 0 → TARGET_KMH.
    const progress = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.60)));
    targetSpeed.current = progress * TARGET_KMH;

    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    // Slight delay so the SVG has rendered before we cache refs
    const t = setTimeout(() => {
      setMounted(true);
      cacheSvgRefs();
      startLoop();
    }, 80);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [cacheSvgRefs, startLoop, onScroll]);

  /* Inline style helper for hero text slide-up */
  const slideIn = (delay: number): React.CSSProperties => ({
    display: "block",
    willChange: "transform, opacity",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(110%)",
    transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-[#07070F] text-white overflow-x-hidden">
      <ScrollProgressBar />

      {/* ── Announcement bar ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-primary to-violet-950 py-2.5 text-center text-xs font-semibold text-white">
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 55px)" }} />
        <span className="relative inline-flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Now live in Pune — verified mechanics at your doorstep
          <span className="hidden sm:inline text-white/35">·</span>
          <a href="https://wa.me/918149297982"
            className="hidden sm:inline text-white/70 hover:text-white underline underline-offset-2 transition-colors">
            Chat on WhatsApp →
          </a>
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07070F]/94 backdrop-blur-2xl border-b border-white/[0.07] shadow-2xl shadow-black/50"
          : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Mechiee" className="h-12 w-auto"
              style={{ filter: "brightness(0) invert(1)", opacity: 0.92 }} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[["#services","Services"],["#plans","Plans"],["#how-it-works","How It Works"],["#why-us","Why Us"],["#cities","Areas"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-white/48 hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/garage/login"
              className="text-sm text-white/55 hover:text-white border border-white/[0.1] hover:border-white/25 rounded-lg px-4 py-2.5 transition-all flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Garage Portal
            </Link>
            <Link href="/login"
              className="text-sm bg-primary hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-0.5">
              Book a Service →
            </Link>
          </div>
          <button className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0C0C1A] border-t border-white/[0.07] px-4 pb-6 pt-3">
            {[["#services","Services"],["#plans","Plans"],["#how-it-works","How It Works"],["#why-us","Why Us"],["#cities","Areas"]].map(([href, label]) => (
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

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] lg:min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#07070F]" />
        {/* Violet studio glow — centered on mobile, shifted right on desktop */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 120% 60% at 50% 35%, rgba(109,40,217,0.20) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none lg:hidden"
          style={{ background: "radial-gradient(ellipse 90% 45% at 50% 75%, rgba(109,40,217,0.12) 0%, transparent 60%)" }} />
        {/* Warm amber accent — below speedometer */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 35% at 50% 90%, rgba(251,146,60,0.06) 0%, transparent 55%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        {/* Perspective floor grid */}
        <div className="absolute bottom-0 left-0 right-0 h-56 lg:h-44 pointer-events-none overflow-hidden">
          <div className="w-full h-full" style={{
            backgroundImage: "linear-gradient(rgba(124,58,237,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.08) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
            transform: "perspective(260px) rotateX(60deg)",
            transformOrigin: "50% 100%",
          }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />


        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 lg:gap-12 items-center">

            {/* TEXT BLOCK */}
            <div className="w-full">
              {/* Badge */}
              <div style={slideIn(0)} className="mb-6 lg:mb-9">
                <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.09] text-xs text-white/65 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Available Now in Pune &middot; 4.9&#9733; Rated Service
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-[2.6rem] leading-[1.05] sm:text-5xl md:text-6xl xl:text-[4.75rem] font-extrabold tracking-tight mb-5 lg:mb-6">
                <span className="block overflow-hidden">
                  <span style={slideIn(0.08)}>Your Bike</span>
                </span>
                <span className="block overflow-hidden">
                  <span style={slideIn(0.2)}>Our</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent"
                    style={slideIn(0.33)}>
                    Service.
                  </span>
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-white/52 text-base sm:text-lg lg:text-xl leading-relaxed mb-7 lg:mb-10 max-w-md"
                style={{
                  opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
                  transition: "opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s",
                }}>
                Mechiee is a smart bike servicing platform offering instant, reliable, and transparent two-wheeler care — at your doorstep, in emergencies, or at trusted partner garages. Book, track, and relax — we&apos;ve got your ride covered.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8 lg:mb-14"
                style={{
                  opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
                  transition: "opacity 0.8s ease 0.65s, transform 0.8s ease 0.65s",
                }}>
                <Link href="/login"
                  className="group flex items-center justify-center gap-2.5 bg-primary hover:bg-violet-500 text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/55 hover:-translate-y-0.5">
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:+918149297982"
                  className="flex items-center justify-center gap-2 border border-white/12 hover:border-white/28 hover:bg-white/[0.04] text-white/68 hover:text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl font-medium text-sm sm:text-base transition-all">
                  <Phone className="w-4 h-4" /> +91 81492 97982
                </a>
              </div>

              {/* Stats — 2×2 card grid on mobile, divider row on desktop */}
              <div style={{
                opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)",
                transition: "opacity 0.8s ease 0.82s, transform 0.8s ease 0.82s",
              }}>
                {/* Mobile grid */}
                <div className="grid grid-cols-3 gap-2.5 sm:hidden">
                  {[{v:"100%",l:"Satisfaction"},{v:"24/7",l:"Emergency Service"},{v:"4.9★",l:"Average Rating"}].map((s) => (
                    <div key={s.l} className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
                      <div className="text-xl font-extrabold text-white">{s.v}</div>
                      <div className="text-[11px] text-white/38 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Desktop divider row */}
                <div className="hidden sm:flex items-stretch divide-x divide-white/10">
                  {[{v:"100%",l:"Satisfaction"},{v:"24/7",l:"Emergency Service"},{v:"4.9★",l:"Average Rating"}].map((s) => (
                    <div key={s.l} className="px-5 first:pl-0">
                      <div className="text-2xl font-extrabold text-white">{s.v}</div>
                      <div className="text-xs text-white/35 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SPEEDOMETER — visible on all screens, centered on mobile */}
            <div className="relative flex flex-col items-center justify-center mt-4 lg:mt-0">
              {/* Glow behind gauge */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-primary/14 blur-3xl rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 bg-amber-500/6 blur-2xl rounded-full" />
              </div>

              {/* Scroll hint */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 1.2s" }}>
                <span className="text-white/25 text-[9px] sm:text-[10px] font-medium tracking-widest uppercase">scroll to rev</span>
                <div className="w-px h-5 bg-gradient-to-b from-white/18 to-transparent" />
              </div>

              <div className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] lg:max-w-full"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "scale(0.9)",
                  transition: "opacity 0.9s ease 0.4s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s" }}>
                <Speedometer svgRef={svgRef} />
              </div>

              {/* Floating badges — desktop only */}
              <div className="hidden lg:block absolute -left-14 top-10 z-20 bg-[#0C0C1E]/90 backdrop-blur-sm border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl"
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.9s" }}>
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

              <div className="hidden lg:block absolute -right-10 top-1/4 z-20 bg-[#0C0C1E]/90 backdrop-blur-sm border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl"
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 1.0s" }}>
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white text-sm font-bold">4.8 / 5.0</p>
                <p className="text-white/40 text-[10px]">2,400+ reviews</p>
              </div>

              <div className="hidden lg:block absolute -right-8 bottom-20 z-20 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl"
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 1.1s" }}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <p className="text-white text-xs font-bold">Mechanic En Route</p>
                </div>
                <p className="text-white/40 text-[10px] mt-0.5">Arrives in 18 min &middot; ★4.9 Rajesh</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust marquee ─────────────────────────────────────────────── */}
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

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 80% at 50% 50%, rgba(109,40,217,0.07) 0%, transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02]">
            {[
              { to: 10000, fmt: (n: number) => n >= 10000 ? "10,000+" : n >= 1000 ? `${Math.floor(n / 1000)}K+` : n.toString(), label:"Services Completed", sub:"And growing every day",  icon:CheckCircle, color:"text-violet-400"  },
              { to: 500,   fmt: (n: number) => n >= 500 ? "500+" : n.toString(),                                                  label:"Partner Garages",    sub:"Verified & trained",      icon:BadgeCheck,  color:"text-emerald-400" },
              { to: 15,    fmt: (n: number) => n >= 15  ? "15+"  : n.toString(),                                                  label:"Cities Active",      sub:"Expanding monthly",       icon:MapPin,      color:"text-sky-400"     },
              { to: 48,    fmt: (n: number) => `${(n / 10).toFixed(1)}★`,                                                        label:"Customer Rating",    sub:"From 2,400+ reviews",     icon:Star,        color:"text-amber-400"   },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}
                className="flex flex-col p-7 lg:p-9 hover:bg-white/[0.02] transition-colors">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1">
                  <CountUp to={stat.to} fmt={stat.fmt} />
                </div>
                <div className="text-sm font-semibold text-white/72">{stat.label}</div>
                <div className="text-xs text-white/28 mt-1">{stat.sub}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,#07070F,#0C0B1A,#07070F)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <FadeIn>
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Simple Process</p>
            </FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              <WordReveal baseDelay={0.05}>Booked and at your door</WordReveal>
              <br />
              <span className="text-white/30">
                <WordReveal baseDelay={0.2}>in under 2 minutes.</WordReveal>
              </span>
            </h2>
            <FadeIn delay={0.35}>
              <p className="text-white/46 text-lg">No calls. No confusion. Select, schedule, and relax.</p>
            </FadeIn>
          </div>
          <div ref={stepsRef} className="grid md:grid-cols-5 gap-5">
            {[
              { step:"01", icon:Phone,          title:"Book Service",   desc:"Choose your service type and schedule a convenient time slot.",   grad:"from-violet-500/15", border:"border-violet-500/20", ic:"text-violet-400",  ib:"bg-violet-500/15"  },
              { step:"02", icon:Search,         title:"Find Garage",    desc:"We match you with the best verified garage in your area.",        grad:"from-sky-500/15",    border:"border-sky-500/20",    ic:"text-sky-400",     ib:"bg-sky-500/15"     },
              { step:"03", icon:CalendarCheck,  title:"Schedule",       desc:"Confirm your booking and get ready for professional service.",    grad:"from-amber-500/15",  border:"border-amber-500/20",  ic:"text-amber-400",   ib:"bg-amber-500/15"   },
              { step:"04", icon:Settings,       title:"Service",        desc:"Expert mechanics service your bike with genuine parts.",          grad:"from-emerald-500/15",border:"border-emerald-500/20",ic:"text-emerald-400", ib:"bg-emerald-500/15" },
              { step:"05", icon:Star,           title:"Review",         desc:"Rate your experience and help us improve our service.",           grad:"from-pink-500/15",   border:"border-pink-500/20",   ic:"text-pink-400",    ib:"bg-pink-500/15"    },
            ].map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1} className="relative group">
                {i < 4 && (
                  <div
                    className="hidden md:block absolute top-10 left-[calc(100%-0.5rem)] h-px z-0 origin-left"
                    style={{
                      width: "calc(100% - 1rem)",
                      background: "linear-gradient(90deg, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.1) 60%, transparent 100%)",
                      transform: stepsInView ? "scaleX(1)" : "scaleX(0)",
                      transition: `transform 1s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.25}s`,
                    }}
                  />
                )}
                <div className={`relative z-10 bg-gradient-to-b ${step.grad} to-transparent border ${step.border} rounded-2xl p-6 h-full transition-all group-hover:-translate-y-1.5`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 ${step.ib} rounded-xl flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 ${step.ic}`} />
                    </div>
                    <span className="text-5xl font-black text-white/[0.04]">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{step.title}</h3>
                  <p className="text-white/42 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 55% at 5% 55%, rgba(59,130,246,0.04) 0%, transparent 55%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <FadeIn><p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Services & Pricing</p></FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              <WordReveal>Services We Offer</WordReveal>
              <br />
              <span className="text-white/30"><WordReveal baseDelay={0.25}>Three convenient ways to get your bike serviced.</WordReveal></span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map((svc, i) => (
              <ShimmerCard key={svc.label} delay={i * 0.1}
                className="relative group bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-6 transition-all hover:-translate-y-1.5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${svc.grad} to-transparent border ${svc.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <svc.icon className={`w-6 h-6 ${svc.text}`} />
                  </div>
                  <h3 className="font-bold text-white text-lg">{svc.label}</h3>
                </div>
                <p className="text-sm text-white/50 mb-5">{svc.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/45">
                      <CheckCircle className={`w-3.5 h-3.5 ${svc.text} mt-0.5 flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
                  <span className={`font-bold text-sm ${svc.text}`}>{svc.price}</span>
                  <Link href="/login"
                    className={`flex items-center gap-1.5 border border-white/[0.08] hover:border-primary/50 hover:bg-primary/10 ${svc.text} hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all`}>
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </ShimmerCard>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <p className="text-xs text-white/22 text-center mt-8">
              * Starting prices. Final price may vary by bike model. You are informed before any additional work begins.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────────────────── */}
      <section id="why-us" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,#07070F,#0A0918,#07070F)" }} />
        <div className="absolute inset-y-0 left-0 right-0 border-y border-white/[0.04]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <FadeIn><p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Why Choose Mechiee</p></FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              <WordReveal>Why Customers Love Mechiee</WordReveal>
            </h2>
            <FadeIn delay={0.35}>
              <p className="text-white/42 text-lg">Experience the difference with our customer-first approach.</p>
            </FadeIn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRUST_POINTS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}
                className={`group flex gap-4 p-6 bg-white/[0.025] border ${item.border} hover:bg-white/[0.04] rounded-2xl transition-all hover:-translate-y-1`}>
                <div className={`w-12 h-12 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-white/38 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────────── */}
      <section id="plans" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,#07070F,#0C0B1A,#07070F)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <FadeIn><p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Membership Plans</p></FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              <WordReveal>Ride Smarter,</WordReveal>
              <br />
              <span className="text-white/30"><WordReveal baseDelay={0.2}>Choose Your Plan.</WordReveal></span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}
                className={`relative rounded-2xl p-6 flex flex-col border transition-all hover:-translate-y-1.5 ${
                  plan.highlight
                    ? "bg-white/[0.06] border-emerald-500/30 shadow-xl shadow-emerald-900/20"
                    : "bg-white/[0.025] border-white/[0.08]"
                }`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-900/40">Most Popular</span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-extrabold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.color}`}>{plan.price}</span>
                    <span className="text-white/35 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.label} className="text-sm text-white/60">
                      <span className="font-semibold text-white/80">{f.label}:</span> {f.value}
                    </li>
                  ))}
                </ul>
                <Link href="/login"
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/30"
                      : `border ${plan.border} ${plan.color} hover:bg-white/[0.04]`
                  }`}>
                  {plan.cta}
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 70% at 82% 50%, rgba(109,40,217,0.07) 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <FadeIn><p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Real Reviews</p></FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              <WordReveal>What Our Customers Say</WordReveal>
            </h2>
            <FadeIn delay={0.2}>
              <p className="text-white/42 text-lg">Real stories from Pune. Real satisfaction.</p>
            </FadeIn>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── For garages ───────────────────────────────────────────────── */}
      <section id="for-garages" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.11) 0%,rgba(59,130,246,0.04) 50%,transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" /> For Garage Owners
                </div>
              </FadeIn>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                <WordReveal>Partner with Mechiee.</WordReveal>
                <br />
                <span className="text-white/30"><WordReveal baseDelay={0.2}>Grow your business.</WordReveal></span>
              </h2>
              <FadeIn delay={0.3}>
                <p className="text-white/48 text-lg mb-8 leading-relaxed">
                  Join 500+ garages already earning with Mechiee. Get verified bookings from nearby customers — no marketing spend, no cold calls.
                </p>
              </FadeIn>
              <ul className="space-y-4 mb-10">
                {[
                  "Get bookings from customers within 10–25 km radius",
                  "100% free registration — no monthly or annual fees",
                  "Instant WhatsApp notifications for every new booking",
                  "Full dashboard: earnings, history, reviews & analytics",
                  "Dedicated partner support and onboarding assistance",
                ].map((point, i) => (
                  <FadeIn key={point} delay={0.35 + i * 0.07}
                    className="flex items-start gap-3 text-sm text-white/60">
                    <div className="w-5 h-5 bg-primary/15 border border-primary/25 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    {point}
                  </FadeIn>
                ))}
              </ul>
              <FadeIn delay={0.7} className="flex flex-col sm:flex-row gap-3">
                <Link href="/garage/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-violet-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-0.5">
                  <Building2 className="w-4 h-4" /> Register Your Garage — Free
                </Link>
                <Link href="/garage/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/22 text-white/60 hover:text-white px-7 py-3.5 rounded-xl font-medium transition-all">
                  <LayoutDashboard className="w-4 h-4" /> Existing Partner Login
                </Link>
              </FadeIn>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon:IndianRupee, title:"Extra Revenue",       desc:"Avg ₹15K–40K/month in additional income from nearby doorstep bookings.",    color:"text-amber-400",  bg:"bg-amber-500/10",  border:"border-amber-500/20"  },
                { icon:Users,       title:"More Customers",      desc:"Access thousands of app users in your city actively searching for service.",  color:"text-sky-400",    bg:"bg-sky-500/10",    border:"border-sky-500/20"    },
                { icon:TrendingUp,  title:"Analytics Dashboard", desc:"Track earnings, ratings, and job history in real time. Know your numbers.",   color:"text-emerald-400",bg:"bg-emerald-500/10",border:"border-emerald-500/20"},
                { icon:BadgeCheck,  title:"Verified Badge",      desc:"Verified garages earn 3× more bookings and deeper customer trust.",           color:"text-violet-400", bg:"bg-violet-500/10", border:"border-violet-500/20" },
              ].map((card, i) => (
                <FadeIn key={card.title} delay={0.3 + i * 0.1}
                  className={`bg-white/[0.03] border ${card.border} rounded-2xl p-5 hover:bg-white/[0.05] transition-all hover:-translate-y-1`}>
                  <div className={`w-10 h-10 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center mb-4`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">{card.title}</h4>
                  <p className="text-xs text-white/38 leading-relaxed">{card.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-violet-900/65 via-primary/42 to-purple-950/65"
          style={{
            clipPath: ctaInView ? "circle(150% at 50% 50%)" : "circle(0% at 50% 50%)",
            transition: "clip-path 1.1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block" style={{ width:520, height:520 }}>
          <div className="absolute inset-0 rounded-full" style={{ border:"52px solid rgba(255,255,255,0.04)" }} />
          <div className="absolute rounded-full" style={{ inset:68, border:"2px solid rgba(255,255,255,0.06)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn><p className="text-white/55 text-xs font-bold uppercase tracking-[0.2em] mb-4">Ready to Experience Mechiee?</p></FadeIn>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            <WordReveal>Ready to Book Your</WordReveal>
            <br />
            <WordReveal baseDelay={0.2}>First Service?</WordReveal>
          </h2>
          <FadeIn delay={0.3}>
            <p className="text-white/55 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
              Join thousands of satisfied customers and experience hassle-free bike servicing today.
            </p>
          </FadeIn>
          <FadeIn delay={0.45} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login"
              className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-white/92 text-primary px-10 py-4 rounded-xl font-bold text-base transition-all shadow-2xl shadow-black/20 hover:-translate-y-0.5 relative overflow-hidden">
              <span aria-hidden="true"
                className="absolute inset-0 pointer-events-none animate-shimmer-loop"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(109,40,217,0.15) 50%, transparent 60%)" }}
              />
              Book a Service Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/918149297982"
              className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-emerald-900/28 hover:-translate-y-0.5">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── Cities ───────────────────────────────────────────────────── */}
      <section id="cities" className="py-20 md:py-28 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <FadeIn><p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Coverage · Pune</p></FadeIn>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              <WordReveal>Areas we serve in Pune</WordReveal>
            </h2>
            <FadeIn delay={0.2}>
              <p className="text-white/40 text-lg">
                Serving all major areas across Pune. Don&apos;t see your area?{" "}
                <a href="https://wa.me/918149297982" className="text-primary hover:text-violet-300 underline underline-offset-4 transition-colors">WhatsApp us</a>
                {" "}— we&apos;ll add it soon.
              </p>
            </FadeIn>
          </div>
          <div className="flex flex-wrap gap-3">
            {CITIES.map((city, i) => (
              <FadeIn key={city} delay={0.04 + i * 0.03}>
                <div className="relative group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] rounded-xl px-5 py-3 transition-all cursor-default">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl border border-primary/40 animate-ping-once pointer-events-none"
                    style={{ animationDelay: `${0.04 + i * 0.03}s` }}
                  />
                  <MapPin className="w-3.5 h-3.5 text-primary group-hover:text-violet-300 transition-colors" />
                  <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{city}</span>
                </div>
              </FadeIn>
            ))}
            <FadeIn delay={0.04 + CITIES.length * 0.03}>
              <div className="flex items-center gap-2 bg-primary/[0.08] border border-primary/20 rounded-xl px-5 py-3">
                <span className="text-sm font-semibold text-primary">+ More coming soon</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] bg-[#04040A] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/16 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2">
              <img src="/logo.png" alt="Mechiee" className="h-10 w-auto mb-5"
                style={{ filter:"brightness(0) invert(1)", opacity:0.85 }} />
              <p className="text-sm text-white/32 leading-relaxed mb-6 max-w-xs">
                Your trusted partner for professional two-wheeler servicing. We connect riders with verified garages across the city for reliable service experiences.
              </p>
              <div className="space-y-3">
                <a href="tel:+918149297982" className="flex items-center gap-2.5 text-sm text-white/35 hover:text-white transition-colors"><Phone className="w-4 h-4 text-primary" /> +91 8149297982</a>
                <a href="mailto:mechiee.info@mechiee.in" className="flex items-center gap-2.5 text-sm text-white/35 hover:text-white transition-colors"><MessageCircle className="w-4 h-4 text-emerald-500" /> mechiee.info@mechiee.in</a>
                <div className="flex items-center gap-2.5 text-sm text-white/35"><MapPin className="w-4 h-4 text-primary" /> Pune, Maharashtra</div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/42 uppercase tracking-[0.18em] mb-5">Services</h4>
              <ul className="space-y-3">{SERVICES.map((s) => (<li key={s.label}><Link href="/login" className="text-sm text-white/30 hover:text-white transition-colors">{s.label}</Link></li>))}</ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/42 uppercase tracking-[0.18em] mb-5">Company</h4>
              <ul className="space-y-3">{[["About Us","#"],["For Garages","#for-garages"],["Partner Program","#"],["Careers","#"],["Blog","#"],["Contact","#"]].map(([l,h]) => (<li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition-colors">{l}</Link></li>))}</ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white/42 uppercase tracking-[0.18em] mb-5">Legal</h4>
              <ul className="space-y-3">{["Privacy Policy","Terms of Service","Refund Policy","Cookie Policy"].map((l) => (<li key={l}><Link href="#" className="text-sm text-white/30 hover:text-white transition-colors">{l}</Link></li>))}</ul>
              <div className="mt-8">
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.15em] mb-3">Payments</p>
                <div className="flex flex-wrap gap-2">{["UPI","Cards","Net Banking","Cash"].map((p) => (<span key={p} className="text-xs bg-white/[0.04] border border-white/[0.07] px-3 py-1 rounded-lg text-white/35">{p}</span>))}</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/22">&copy; {new Date().getFullYear()} Mechiee Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="text-xs text-white/22">Made with &#9829; in India &#127470;&#127475;</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ─────────────────────────────────────────── */}
      <a href="https://wa.me/918149297982" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 transition-all hover:scale-110 hover:-translate-y-1"
        title="Chat on WhatsApp">
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}
