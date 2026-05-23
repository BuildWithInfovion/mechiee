"use client";

import Link from "next/link";
import {
  Wrench, MapPin, Star, Shield, Clock, ChevronRight,
  Bike, Battery, Droplets, Settings, Zap, CheckCircle,
  Menu, X, Phone, MessageCircle, ArrowRight, IndianRupee,
  Building2, TrendingUp, Users,
} from "lucide-react";
import { useState } from "react";

const SERVICES = [
  { icon: Settings, label: "General Service", desc: "Full bike tune-up & checkup", price: "From ₹499" },
  { icon: Droplets, label: "Oil Change", desc: "Fresh engine oil & filter", price: "From ₹299" },
  { icon: Bike, label: "Tyre Service", desc: "Puncture repair & replacement", price: "From ₹149" },
  { icon: Battery, label: "Battery", desc: "Test, charge & replacement", price: "From ₹999" },
  { icon: Zap, label: "Electrical", desc: "Wiring, lights & ignition", price: "From ₹199" },
  { icon: Droplets, label: "Bike Wash", desc: "Deep clean & polish", price: "From ₹199" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Find a Garage",
    desc: "Browse verified garages near your location with real ratings and reviews.",
  },
  {
    step: "02",
    title: "Book a Service",
    desc: "Pick your service, vehicle, date & time. Mechanic comes to your address.",
  },
  {
    step: "03",
    title: "Relax at Home",
    desc: "Track your mechanic live. Pay securely after the service is done.",
  },
];

const WHY_MECHIEE = [
  { icon: Shield, title: "Verified Mechanics", desc: "Every garage is vetted and approved before going live on the platform." },
  { icon: MapPin, title: "Doorstep Delivery", desc: "Your mechanic comes to your home, office, or wherever you are." },
  { icon: Star, title: "Transparent Pricing", desc: "Fixed prices shown upfront. No hidden charges, ever." },
  { icon: Clock, title: "Live Tracking", desc: "Track your mechanic on the map from dispatch to doorstep." },
];

const STATS = [
  { value: "500+", label: "Verified Garages" },
  { value: "10K+", label: "Bookings Completed" },
  { value: "15+", label: "Cities Covered" },
  { value: "4.8★", label: "Average Rating" },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Mechiee" className="h-12 w-auto mix-blend-screen" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link href="#for-garages" className="text-muted-foreground hover:text-foreground transition-colors">
              For Garages
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3">
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">How it works</Link>
            <Link href="#services" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">Services</Link>
            <Link href="#for-garages" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">For Garages</Link>
            <Link href="/login" className="block w-full text-center bg-primary text-white py-2.5 rounded-xl text-sm font-medium">
              Book a Service
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(263_70%_58%/0.15),transparent_60%)]" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              Doorstep Bike Service — No workshop visit needed
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Your mechanic,{" "}
              <span className="text-primary">at your doorstep</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Book expert two-wheeler servicing online. A verified mechanic comes to your home or office — no more waiting at garages.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Book a Service <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3.5 rounded-xl font-medium hover:bg-secondary transition-colors text-sm"
              >
                How it works
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs text-primary font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1">10,000+ happy customers</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple & Fast</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Mechiee works</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From booking to your mechanic arriving — the whole process takes under 5 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px border-t border-dashed border-border z-0 -translate-x-8" />
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <span className="text-primary font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">What we offer</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Services for every bike</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              All major two-wheeler brands covered — Honda, Yamaha, TVS, Hero, Royal Enfield & more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICES.map((svc) => (
              <Link
                key={svc.label}
                href="/login"
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svc.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{svc.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{svc.desc}</p>
                <span className="text-xs font-semibold text-primary">{svc.price}</span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              View all services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Mechiee */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Why choose us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Built for India's bike owners</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {WHY_MECHIEE.map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Garages */}
      <section id="for-garages" className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">For Garage Owners</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
                Grow your garage with Mechiee
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Join 500+ garages already on Mechiee. Get verified bookings, grow your customer base, and manage everything from one dashboard.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Get bookings from customers near you",
                  "Free listing — no monthly subscription",
                  "WhatsApp notifications for every booking",
                  "Track earnings and job history",
                  "Dedicated garage portal & analytics",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href="/garage/register"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                <Building2 className="w-4 h-4" />
                Register Your Garage — Free
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: IndianRupee, title: "Earn More", desc: "New revenue stream from nearby customers who can't visit physically" },
                { icon: Users, title: "More Customers", desc: "Reach customers in a 10–25 km radius who need doorstep service" },
                { icon: TrendingUp, title: "Analytics", desc: "See your earnings, popular services, and customer feedback" },
                { icon: Shield, title: "Verified Badge", desc: "Mechiee-verified garages get higher trust and more bookings" },
              ].map((card) => (
                <div key={card.title} className="bg-card border border-border rounded-2xl p-4">
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

      {/* CTA Banner */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-10 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(263_70%_58%/0.2),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready for hassle-free bike service?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of riders who've switched to doorstep servicing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Book Your First Service <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-7 py-3.5 rounded-xl font-medium hover:bg-secondary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="Mechiee" className="h-14 w-auto mix-blend-screen mb-4" />
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                India's doorstep two-wheeler service platform. Trusted by 10,000+ bike owners.
              </p>
              <div className="flex gap-3">
                <a href="https://wa.me/919876543210" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </a>
                <a href="tel:+919876543210" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Customers</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Book a Service", href: "/login" },
                  { label: "Find Garages", href: "/login" },
                  { label: "Track Booking", href: "/login" },
                  { label: "How it Works", href: "#how-it-works" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Garages</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Register Garage", href: "/garage/register" },
                  { label: "Garage Portal", href: "/login" },
                  { label: "Partner Benefits", href: "#for-garages" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "About Us", href: "#" },
                  { label: "Contact", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Mechiee. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ♥ for India's bike owners
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
