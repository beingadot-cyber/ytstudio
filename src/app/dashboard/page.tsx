"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { formatNumber, formatCurrency, formatWatchTime, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  Eye, Clock, Users, DollarSign, ThumbsUp, MessageSquare,
  Play, BarChart3, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, AreaChart,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  totals: {
    views: number; likes: number; comments: number; watchTime: number;
    revenue: number; subscribersGained: number; subscribers: number; videoCount: number;
  };
  period: {
    views: number; likes: number; comments: number; watchTime: number; revenue: number; subscribers: number;
  };
  chartData: Array<{
    date: string; views: number; likes: number; comments: number;
    revenue: number; watchTime: number; subscribersGained: number;
  }>;
  recentVideos: Array<{
    id: number; title: string; thumbnailUrl: string | null; visibility: string;
    status: string; uploadDate: string; views: number | null; likes: number | null;
    comments: number | null; revenue: number | null;
  }>;
}

const CHART_TABS = [
  { key: "views", label: "Views", color: "#6366f1" },
  { key: "watchTime", label: "Watch Time", color: "#8b5cf6" },
  { key: "subscribersGained", label: "Subscribers", color: "#06b6d4" },
  { key: "revenue", label: "Revenue", color: "#10b981" },
] as const;

type ChartTabKey = (typeof CHART_TABS)[number]["key"];

function CustomTooltip({ active, payload, label, activeTab, currency }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string;
  activeTab: ChartTabKey; currency: string;
}) {
  if (!active || !payload?.[0]) return null;
  const val = payload[0].value;
  const d = payload.find((p: { name?: string; value: number }) => p.name === "revenue");

  const format = (key: ChartTabKey, v: number) => {
    if (key === "revenue") return formatCurrency(v, currency);
    if (key === "watchTime") return formatWatchTime(v);
    return formatNumber(v);
  };

  return (
    <div className="bg-[#1a1a28] border border-white/15 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((item: { name?: string; value: number }, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-slate-500 capitalize">{item.name}</span>
          <span className="text-slate-200 font-semibold tabular-nums">{format(activeTab, item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState("28d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChartTabKey>("views");
  const [currency] = useState("INR");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?range=${range}`);
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

  const tabInfo = CHART_TABS.find((t) => t.key === activeTab)!;

  const formatChartValue = (val: number) => {
    if (activeTab === "revenue") return formatCurrency(val, currency);
    if (activeTab === "watchTime") return formatWatchTime(val);
    return formatNumber(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back — here&apos;s your fictional channel overview
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : (
            <>
              <MetricCard
                title="Total Views"
                value={formatNumber(data?.period.views ?? 0)}
                subtitle={`Total: ${formatNumber(data?.totals.views ?? 0)}`}
                icon={<Eye className="w-4 h-4 text-indigo-400" />}
                iconBg="bg-indigo-500/15"
                change={24.8}
                changeLabel=" vs prev period"
              />
              <MetricCard
                title="Watch Time"
                value={formatWatchTime(data?.period.watchTime ?? 0)}
                subtitle={`Total: ${formatWatchTime(data?.totals.watchTime ?? 0)}`}
                icon={<Clock className="w-4 h-4 text-violet-400" />}
                iconBg="bg-violet-500/15"
                change={31.4}
                changeLabel=" vs prev period"
              />
              <MetricCard
                title="Subscribers"
                value={formatNumber(data?.totals.subscribers ?? 248000)}
                subtitle={`+${formatNumber(data?.period.subscribers ?? 0)} this period`}
                icon={<Users className="w-4 h-4 text-cyan-400" />}
                iconBg="bg-cyan-500/15"
                change={18.2}
                changeLabel=" vs prev period"
              />
              <MetricCard
                title="Est. Revenue"
                value={formatCurrency(data?.period.revenue ?? 0, currency)}
                subtitle={`Total: ${formatCurrency(data?.totals.revenue ?? 0, currency)}`}
                icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                iconBg="bg-emerald-500/15"
                change={12.6}
                changeLabel=" vs prev period"
              />
              <MetricCard
                title="Likes"
                value={formatNumber(data?.period.likes ?? 0)}
                subtitle={`Total: ${formatNumber(data?.totals.likes ?? 0)}`}
                icon={<ThumbsUp className="w-4 h-4 text-pink-400" />}
                iconBg="bg-pink-500/15"
                change={8.9}
                changeLabel=" vs prev period"
              />
              <MetricCard
                title="Comments"
                value={formatNumber(data?.period.comments ?? 0)}
                subtitle={`Total: ${formatNumber(data?.totals.comments ?? 0)}`}
                icon={<MessageSquare className="w-4 h-4 text-amber-400" />}
                iconBg="bg-amber-500/15"
                change={5.2}
                changeLabel=" vs prev period"
              />
            </>
          )}
        </div>

        {/* Performance chart */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Performance Over Time</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fictional daily analytics — demo data</p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {CHART_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.chartData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tabInfo.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tabInfo.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()} ${d.toLocaleDateString("en", { month: "short" })}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={formatChartValue}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip activeTab={activeTab} currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey={activeTab}
                  stroke={tabInfo.color}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: tabInfo.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent content */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h2 className="text-base font-semibold text-slate-100">Recent Content</h2>
            <Link
              href="/content"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Likes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Uploaded</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Play className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No videos yet</p>
                    </td>
                  </tr>
                ) : (
                  data?.recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-4 py-3">
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
                          <div className="min-w-0">
                            <Link
                              href={`/content/${video.id}`}
                              className="text-sm text-slate-200 font-medium hover:text-indigo-400 transition-colors line-clamp-1"
                            >
                              {video.title}
                            </Link>
                            <p className="text-xs text-slate-600 mt-0.5 hidden sm:block">
                              {formatRelativeDate(video.uploadDate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusBadge status={video.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 tabular-nums">
                        {formatNumber(video.views ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-400 tabular-nums hidden md:table-cell">
                        {formatNumber(video.likes ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-400 tabular-nums hidden lg:table-cell">
                        {formatCurrency(video.revenue ?? 0, currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500 hidden xl:table-cell">
                        {formatDate(video.uploadDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/content/${video.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/videos/${video.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
