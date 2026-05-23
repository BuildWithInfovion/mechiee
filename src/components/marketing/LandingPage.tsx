"use client";

import Link from "next/link";
import {
  Wrench, MapPin, Star, Shield, Clock, ChevronRight,
  Bike, Battery, Droplets, Settings, Zap, CheckCircle,
  Menu, X, Phone, MessageCircle, ArrowRight, IndianRupee,
  Building2, TrendingUp, Users, BadgeCheck, ThumbsUp, Award,
  Headphones, CalendarCheck, Search,
} from "lucide-react";
import { useState } from "react";

const SERVICES = [
  {
    icon: Settings,
    label: "General Service",
    desc: "Complete tune-up, oil change, chain lube, brake check, air filter cleaning",
    price: "₹499",
    time: "2–3 hrs",
    popular: true,
  },
  {
    icon: Droplets,
    label: "Oil Change",
    desc: "Drain old oil, replace oil filter, fill fresh engine oil of your grade",
    price: "₹299",
    time: "30 min",
    popular: false,
  },
  {
    icon: Bike,
    label: "Tyre Service",
    desc: "Puncture repair, tyre pressure check, tyre replacement (MRF/CEAT/Apollo)",
    price: "₹149",
    time: "30–45 min",
    popular: false,
  },
  {
    icon: Battery,
    label: "Battery Service",
    desc: "Battery testing, charging, replacement with warranty-backed battery",
    price: "₹999",
    time: "30 min",
    popular: false,
  },
  {
    icon: Zap,
    label: "Electrical Repair",
    desc: "Wiring check, headlight, indicators, horn, self-start motor repair",
    price: "₹199",
    time: "1–2 hrs",
    popular: false,
  },
  {
    icon: Droplets,
    label: "Bike Wash & Polish",
    desc: "Pressure wash, engine degreasing, chain cleaning, body polish",
    price: "₹199",
    time: "45 min",
    popular: false,
  },
];

const CITIES = [
  "Bengaluru", "Hyderabad", "Chennai", "Pune", "Mumbai",
  "Delhi NCR", "Ahmedabad", "Jaipur", "Coimbatore", "Kochi",
  "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Mysuru",
];

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    city: "Bengaluru",
    rating: 5,
    text: "Got my Activa serviced at home. Mechanic arrived on time, did a thorough job. Saved me a full day of waiting at the workshop.",
    bike: "Honda Activa 6G",
  },
  {
    name: "Priya Menon",
    city: "Hyderabad",
    rating: 5,
    text: "Battery replacement done in 30 minutes right outside my apartment. The mechanic even checked the wiring for free. Highly recommend.",
    bike: "TVS Jupiter",
  },
  {
    name: "Karthik R",
    city: "Chennai",
    rating: 5,
    text: "Transparent pricing, no hidden charges. They showed me what parts were used before replacing. Very professional.",
    bike: "Royal Enfield Classic 350",
  },
];

const TRUST_POINTS = [
  { icon: BadgeCheck, title: "Verified Mechanics", desc: "Background-checked, trained & certified before onboarding" },
  { icon: Shield, title: "Transparent Pricing", desc: "Price shown upfront. What you see is what you pay" },
  { icon: Award, title: "90-Day Service Warranty", desc: "All services covered under 90-day quality guarantee" },
  { icon: Headphones, title: "24/7 Support", desc: "Customer support via WhatsApp, phone & in-app chat" },
  { icon: CalendarCheck, title: "Doorstep Delivery", desc: "Mechanic comes to your home, office or anywhere" },
  { icon: ThumbsUp, title: "No Hidden Charges", desc: "Parts cost shown before replacement, customer approves" },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 hidden md:block">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>🔧 Doorstep two-wheeler servicing across 15+ cities in India</span>
          <div className="flex items-center gap-6">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Phone className="w-3 h-3" /> +91 98765 43210
            </a>
            <a href="https://wa.me/919876543210" className="flex items-center gap-1.5 hover:text-foreground transition-colors text-green-400">
              <MessageCircle className="w-3 h-3" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Mechiee" className="w-72 h-auto mix-blend-screen" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services & Pricing</Link>
            <Link href="#cities" className="text-muted-foreground hover:text-foreground transition-colors">Cities</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#for-garages" className="text-muted-foreground hover:text-foreground transition-colors">For Garages</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors">
              <Phone className="w-3.5 h-3.5" /> Call Now
            </a>
            <Link href="/login" className="text-sm bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Book Service
            </Link>
          </div>

          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-card border-t border-border px-4 pb-4 pt-2 space-y-2">
            {[
              { href: "#services", label: "Services & Pricing" },
              { href: "#cities", label: "Cities" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#for-garages", label: "For Garages" },
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground border-b border-border">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <a href="tel:+919876543210" className="flex-1 flex items-center justify-center gap-1.5 text-sm border border-border rounded-lg py-2.5">
                <Phone className="w-4 h-4" /> Call
              </a>
              <Link href="/login" className="flex-1 flex items-center justify-center bg-primary text-white text-sm rounded-lg py-2.5 font-semibold">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Available Now
                </span>
                <span className="inline-flex items-center gap-1.5 bg-secondary text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border border-border">
                  15+ Cities
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Expert Bike Servicing<br />
                <span className="text-primary">At Your Doorstep</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Professional two-wheeler servicing by verified mechanics — at your home, office, or anywhere in your city. No garage visit needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/login" className="flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Book a Service <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="tel:+919876543210" className="flex items-center justify-center gap-2 border border-border text-foreground px-7 py-3.5 rounded-lg font-medium hover:bg-secondary transition-colors">
                  <Phone className="w-4 h-4" /> +91 98765 43210
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { value: "10,000+", label: "Services Done" },
                  { value: "500+", label: "Garages" },
                  { value: "4.8 / 5", label: "Avg Rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - quick booking card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-foreground mb-1">Book a Service</h3>
              <p className="text-sm text-muted-foreground mb-5">Takes less than 2 minutes</p>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter your city or area"
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select your bike brand</option>
                  {["Honda", "Yamaha", "TVS", "Hero", "Bajaj", "Royal Enfield", "Suzuki", "KTM"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select service type</option>
                  {SERVICES.map((s) => (
                    <option key={s.label}>{s.label} — {s.price}</option>
                  ))}
                </select>
                <Link href="/login" className="block w-full bg-primary text-white text-center py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Check Availability & Book
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> No advance payment
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Free cancellation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-border bg-secondary/30 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: BadgeCheck, text: "Verified Mechanics" },
              { icon: Shield, text: "90-Day Warranty" },
              { icon: IndianRupee, text: "No Hidden Charges" },
              { icon: Clock, text: "On-Time Service" },
              { icon: ThumbsUp, text: "4.8★ Rated" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services & Pricing */}
      <section id="services" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Services & Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Transparent prices, no surprises</h2>
          <p className="text-muted-foreground max-w-xl">All prices are all-inclusive — labour + consumables. Parts cost (if any) is shown before replacement.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((svc) => (
            <div key={svc.label} className={`relative bg-card border rounded-xl p-5 hover:border-primary/50 transition-all ${svc.popular ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}>
              {svc.popular && (
                <span className="absolute -top-2.5 left-4 bg-primary text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svc.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{svc.price}</div>
                  <div className="text-xs text-muted-foreground">{svc.time}</div>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{svc.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{svc.desc}</p>
              <Link href="/login" className="flex items-center justify-center gap-1 w-full border border-primary/40 text-primary text-sm font-medium py-2 rounded-lg hover:bg-primary hover:text-white transition-all">
                Book Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          * Prices are starting prices. Final price may vary based on bike model and condition. You will be informed before any additional work.
        </p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Mechiee works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: Search, title: "Select Service", desc: "Choose your service type and enter your location" },
              { step: "2", icon: CalendarCheck, title: "Pick a Slot", desc: "Select a convenient date and time that works for you" },
              { step: "3", icon: Bike, title: "Mechanic Arrives", desc: "Our verified mechanic reaches your location on time" },
              { step: "4", icon: IndianRupee, title: "Pay After Service", desc: "Inspect the work, then pay. No upfront payment needed" },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px border-t-2 border-dashed border-border -translate-x-4 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Why Choose Mechiee</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Built on trust & quality</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {TRUST_POINTS.map((item) => (
            <div key={item.title} className="flex gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Customer Reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">What our customers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div className="border-t border-border pt-3">
                  <div className="font-semibold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.bike} · {t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Coverage</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Cities we serve</h2>
          <p className="text-muted-foreground">Expanding every month. Don't see your city? <a href="https://wa.me/919876543210" className="text-primary hover:underline">WhatsApp us</a> — we'll let you know when we launch.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {CITIES.map((city) => (
            <div key={city} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5 hover:border-primary/40 transition-colors cursor-default">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">{city}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-primary">+ More coming soon</span>
          </div>
        </div>
      </section>

      {/* For Garages */}
      <section id="for-garages" className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">For Garage Owners</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">Partner with Mechiee — Grow your business</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Join 500+ garages already earning from Mechiee. Get verified bookings delivered to you. No marketing spend needed.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Get bookings from customers within 10–25 km radius",
                  "100% free registration — no monthly fees",
                  "Instant WhatsApp notification for every booking",
                  "Full dashboard: earnings, history, reviews",
                  "Dedicated support for garage owners",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/garage/register" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  <Building2 className="w-4 h-4" /> Register Your Garage — Free
                </Link>
                <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors">
                  <Phone className="w-4 h-4" /> Speak to Our Team
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: IndianRupee, title: "Extra Revenue", desc: "New income stream from nearby customers who need doorstep service" },
                { icon: Users, title: "Larger Customer Base", desc: "Access to thousands of app users in your city" },
                { icon: TrendingUp, title: "Analytics Dashboard", desc: "Track earnings, ratings and job history in real time" },
                { icon: BadgeCheck, title: "Mechiee Verified Badge", desc: "Build trust — verified garages get 3x more bookings" },
              ].map((card) => (
                <div key={card.title} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <card.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Ready to book your bike service?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join 10,000+ bike owners who've stopped wasting time at garages.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-base">
            Book a Service Now <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://wa.me/919876543210" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-base">
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="Mechiee" className="w-80 h-auto mix-blend-screen mb-3" />
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                India's trusted doorstep two-wheeler service platform. Expert mechanics at your home.
              </p>
              <div className="space-y-1.5">
                <a href="tel:+919876543210" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary" /> +91 98765 43210
                </a>
                <a href="https://wa.me/919876543210" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp Support
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Bengaluru, Karnataka
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Services</h4>
              <ul className="space-y-2">
                {SERVICES.map((s) => (
                  <li key={s.label}>
                    <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: "About Us", href: "#" },
                  { label: "For Garages", href: "#for-garages" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Contact Us", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Accepted Payments</p>
                <div className="flex flex-wrap gap-1.5">
                  {["UPI", "Cards", "Net Banking", "Cash"].map((p) => (
                    <span key={p} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Mechiee. All rights reserved. GST: 29XXXXX1234Z1ZX</p>
            <p className="text-xs text-muted-foreground">Made with ♥ in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}
