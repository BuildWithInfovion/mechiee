"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, CalendarDays,
  Wrench, BarChart3, LogOut, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/garages", icon: Building2, label: "Garages" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/admin/services", icon: Wrench, label: "Services" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border p-4 gap-1 fixed left-0 top-0">
      <div className="flex items-center gap-2 px-3 py-4 mb-2">
        <img src="/logo.png" alt="Mechiee" className="h-8 w-auto brightness-0 invert" />
        <span className="flex items-center gap-1 text-xs text-primary ml-auto">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-item", isActive && "active")}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="sidebar-item text-destructive hover:text-destructive hover:bg-destructive/10 mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </aside>
  );
}
