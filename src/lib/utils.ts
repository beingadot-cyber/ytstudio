import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString("en-IN");
}

export function formatCurrency(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatWatchTime(minutes: number): string {
  if (minutes >= 60 * 1000) return (minutes / (60 * 1000)).toFixed(1) + "M hrs";
  if (minutes >= 1000) return (minutes / 1000).toFixed(1) + "K hrs";
  const hrs = Math.floor(minutes / 60);
  return hrs.toLocaleString("en-IN") + " hrs";
}

export function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getDateRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "28d":
      start.setDate(end.getDate() - 28);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "365d":
      start.setDate(end.getDate() - 365);
      break;
    default:
      start.setDate(end.getDate() - 28);
  }
  return { start, end };
}
