"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Wrench, History,
  IndianRupee, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/garage/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/garage/requests", icon: ClipboardList, label: "Requests" },
  { href: "/garage/services", icon: Wrench, label: "Services" },
  { href: "/garage/history", icon: History, label: "History" },
  { href: "/garage/earnings", icon: IndianRupee, label: "Earnings" },
  { href: "/garage/profile", icon: Settings, label: "Settings" },
];

export function GarageSidebar() {
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
        <img src="/logo.png" alt="Mechiee" className="w-52 h-auto mix-blend-screen" />
        <span className="text-xs text-muted-foreground ml-auto">Garage</span>
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
