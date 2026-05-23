import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.startsWith("91") && digits.length === 12)
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return phone;
}

export function generateBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MEK-${ts}-${rand}`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    accepted: "text-blue-400 bg-blue-400/10",
    dispatched: "text-purple-400 bg-purple-400/10",
    in_progress: "text-orange-400 bg-orange-400/10",
    completed: "text-emerald-400 bg-emerald-400/10",
    cancelled: "text-red-400 bg-red-400/10",
    active: "text-emerald-400 bg-emerald-400/10",
    suspended: "text-red-400 bg-red-400/10",
    paid: "text-emerald-400 bg-emerald-400/10",
    refunded: "text-orange-400 bg-orange-400/10",
  };
  return map[status] ?? "text-zinc-400 bg-zinc-400/10";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    dispatched: "On the way",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    suspended: "Suspended",
    paid: "Paid",
    refunded: "Refunded",
  };
  return map[status] ?? status;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
