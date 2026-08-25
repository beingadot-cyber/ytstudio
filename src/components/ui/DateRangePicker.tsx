"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 28 days", value: "28d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 365 days", value: "365d" },
];

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const current = RANGES.find((r) => r.value === value);

  return (
    <div className={cn("flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1", className)}>
      <Calendar className="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" />
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            value === range.value
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
