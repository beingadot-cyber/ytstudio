import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

export function MetricCard({
  title, value, change, changeLabel, icon, iconBg = "bg-indigo-500/15",
  trend, subtitle,
}: MetricCardProps) {
  const isPositive = (change ?? 0) > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={cn("p-2 rounded-xl", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-100 tabular-nums leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium mt-2",
            isNeutral ? "text-slate-500" : isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isPositive ? "+" : ""}{change}%</span>
            {changeLabel && <span className="text-slate-500 font-normal">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
