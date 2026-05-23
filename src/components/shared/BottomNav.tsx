"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/garages", icon: Search, label: "Garages" },
  { href: "/bookings/new", icon: PlusCircle, label: "Book", primary: true },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto">
        {navItems.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors",
                primary && "relative"
              )}
            >
              {primary ? (
                <span className="absolute -top-5 flex items-center justify-center w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30">
                  <Icon className="w-5 h-5 text-white" />
                </span>
              ) : (
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  primary ? "mt-6 text-muted-foreground" : isActive ? "text-primary" : "text-muted-foreground"
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
