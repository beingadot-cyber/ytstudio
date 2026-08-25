"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Award, BarChart3, Play } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart,
} from "recharts";

interface RevenueData {
  summary: {
    totalRevenue: number;
    periodRevenue: number;
    rpm: number;
    topEarning: { id: number; title: string; revenue: number } | null;
  };
  chartData: Array<{ date: string; revenue: number; views: number }>;
  byVideo: Array<{
    id: number; title: string; thumbnailUrl: string | null;
    views: number; revenue: number; rpm: number;
  }>;
}

export default function RevenuePage() {
  const [range, setRange] = useState("28d");
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revenue?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summaryCards = [
    {
      title: "Estimated Revenue",
      value: formatCurrency(data?.summary.totalRevenue ?? 0),
      subtitle: `${formatCurrency(data?.summary.periodRevenue ?? 0)} this period`,
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      bg: "bg-emerald-500/15",
      change: 12.6,
    },
    {
      title: "RPM (per 1K Views)",
      value: formatCurrency(data?.summary.rpm ?? 0),
      subtitle: "Revenue per 1,000 views",
      icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
      bg: "bg-indigo-500/15",
      change: 4.2,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data?.summary.totalRevenue ?? 0),
      subtitle: "All time fictional earnings",
      icon: <BarChart3 className="w-4 h-4 text-violet-400" />,
      bg: "bg-violet-500/15",
      change: 18.9,
    },
    {
      title: "Top Earning Video",
      value: data?.summary.topEarning?.title
        ? data.summary.topEarning.title.length > 30
          ? data.summary.topEarning.title.substring(0, 30) + "..."
          : data.summary.topEarning.title
        : "—",
      subtitle: data?.summary.topEarning
        ? formatCurrency(data.summary.topEarning.revenue)
        : "No data",
      icon: <Award className="w-4 h-4 text-amber-400" />,
      bg: "bg-amber-500/15",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Revenue</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fictional estimated earnings — all values are demo data</p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {/* Demo disclaimer */}
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
          <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300/80">
            <span className="font-semibold">Fictional Revenue Data:</span> All monetary values shown are generated for demonstration purposes only. They do not represent real earnings or verified platform statistics.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-[#12121a] border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <div className={`p-2 rounded-xl ${card.bg}`}>{card.icon}</div>
              </div>
              <p className="text-xl font-bold text-slate-100 tabular-nums">{card.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500">{card.subtitle}</p>
                {card.change && (
                  <span className="text-xs text-emerald-400 font-medium">+{card.change}%</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">Revenue Over Time</h2>
          <p className="text-xs text-slate-500 mb-5">Daily fictional earnings (₹)</p>
          {loading ? (
            <div className="h-56 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chartData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getDate()} ${d.toLocaleDateString("en", { month: "short" })}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => `₹${formatNumber(v)}`}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  formatter={(val) => [formatCurrency(Number(val ?? 0)), "Revenue"]}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by video table */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="text-sm font-semibold text-slate-100">Revenue by Video</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fictional earnings breakdown per video</p>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">RPM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Revenue %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="skeleton h-4 w-full rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  data?.byVideo.map((video) => {
                    const totalRev = data.summary.totalRevenue;
                    const pct = totalRev > 0 ? ((video.revenue / totalRev) * 100).toFixed(1) : "0";
                    return (
                      <tr key={video.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                  <Play className="w-3 h-3 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-200 truncate max-w-xs">{video.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-300 tabular-nums">
                          {formatNumber(video.views)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-emerald-400 font-semibold tabular-nums">
                          {formatCurrency(video.revenue)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-400 tabular-nums hidden md:table-cell">
                          {formatCurrency(video.rpm)}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500/60 rounded-full"
                                style={{ width: `${Math.min(100, parseFloat(pct))}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 tabular-nums w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
