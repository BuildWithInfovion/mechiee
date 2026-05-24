"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Wrench, History, IndianRupee, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/garage/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/garage/requests", icon: ClipboardList, label: "Requests" },
  { href: "/garage/services", icon: Wrench, label: "Services" },
  { href: "/garage/history", icon: History, label: "History" },
  { href: "/garage/earnings", icon: IndianRupee, label: "Earnings" },
  { href: "/garage/profile", icon: Settings, label: "Settings" },
];

export function GarageBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border md:hidden safe-bottom">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto px-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-2 px-1 min-w-0 flex-1 transition-colors"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-medium transition-colors truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
