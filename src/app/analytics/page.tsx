"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber, formatCurrency, formatWatchTime } from "@/lib/utils";
import {
  Eye, ThumbsUp, MessageSquare, Clock, Users, DollarSign, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

interface AnalyticsData {
  chartData: Array<{
    date: string; views: number; likes: number; comments: number;
    watchTime: number; revenue: number; subscribersGained: number;
  }>;
  current: { views: number; likes: number; comments: number; watchTime: number; revenue: number; subscribers: number };
  previous: { views: number; likes: number; comments: number; watchTime: number; revenue: number; subscribers: number };
  changes: { views: number; likes: number; comments: number; watchTime: number; revenue: number; subscribers: number };
  topVideos: Array<{ id: number; title: string; thumbnailUrl: string | null; views: number | null; likes: number | null; revenue: number | null }>;
}

const SECTIONS = ["Overview", "Reach", "Engagement", "Audience", "Revenue"] as const;
type Section = typeof SECTIONS[number];

export default function AnalyticsPage() {
  const [range, setRange] = useState("28d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("Overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
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

  const metrics = [
    {
      title: "Views",
      value: formatNumber(data?.current.views ?? 0),
      change: data?.changes.views,
      icon: <Eye className="w-4 h-4 text-indigo-400" />,
      iconBg: "bg-indigo-500/15",
    },
    {
      title: "Watch Time",
      value: formatWatchTime(data?.current.watchTime ?? 0),
      change: data?.changes.watchTime,
      icon: <Clock className="w-4 h-4 text-violet-400" />,
      iconBg: "bg-violet-500/15",
    },
    {
      title: "Subscribers",
      value: `+${formatNumber(data?.current.subscribers ?? 0)}`,
      change: data?.changes.subscribers,
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      iconBg: "bg-cyan-500/15",
    },
    {
      title: "Likes",
      value: formatNumber(data?.current.likes ?? 0),
      change: data?.changes.likes,
      icon: <ThumbsUp className="w-4 h-4 text-pink-400" />,
      iconBg: "bg-pink-500/15",
    },
    {
      title: "Comments",
      value: formatNumber(data?.current.comments ?? 0),
      change: data?.changes.comments,
      icon: <MessageSquare className="w-4 h-4 text-amber-400" />,
      iconBg: "bg-amber-500/15",
    },
    {
      title: "Revenue",
      value: formatCurrency(data?.current.revenue ?? 0),
      change: data?.changes.revenue,
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      iconBg: "bg-emerald-500/15",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fictional channel-wide performance overview</p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                section === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#12121a] border border-white/8 rounded-2xl p-5">
                  <div className="skeleton h-4 w-20 mb-4 rounded" />
                  <div className="skeleton h-8 w-28 mb-2 rounded" />
                  <div className="skeleton h-3 w-16 rounded" />
                </div>
              ))
            : metrics.map((m) => (
                <MetricCard
                  key={m.title}
                  {...m}
                  changeLabel=" vs prev period"
                />
              ))}
        </div>

        {/* Comparison note */}
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
          <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300/80">
            <span className="font-semibold">Period comparison:</span> Comparing current {range} vs previous {range} — all percentages are fictional demo data.
          </p>
        </div>

        {/* Views & Watch Time Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Views Over Time</h3>
            <p className="text-xs text-slate-500 mb-4">Daily fictional view count</p>
            {loading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.chartData ?? []}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }}
                    tickFormatter={(v) => new Date(v).getDate().toString()} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => formatNumber(v)} axisLine={false} tickLine={false} width={50} />
                  <Tooltip contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Watch Time (Hours)</h3>
            <p className="text-xs text-slate-500 mb-4">Daily fictional watch hours</p>
            {loading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.chartData ?? []}>
                  <defs>
                    <linearGradient id="watchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }}
                    tickFormatter={(v) => new Date(v).getDate().toString()} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => formatWatchTime(v)} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="watchTime" stroke="#8b5cf6" strokeWidth={2} fill="url(#watchGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Likes & Comments</h3>
            <p className="text-xs text-slate-500 mb-4">Daily engagement</p>
            {loading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.chartData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }}
                    tickFormatter={(v) => new Date(v).getDate().toString()} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => formatNumber(v)} axisLine={false} tickLine={false} width={50} />
                  <Tooltip contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="likes" fill="#ec4899" opacity={0.8} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="comments" fill="#f59e0b" opacity={0.8} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Revenue & Subscribers</h3>
            <p className="text-xs text-slate-500 mb-4">Daily fictional earnings & growth</p>
            {loading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.chartData ?? []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }}
                    tickFormatter={(v) => new Date(v).getDate().toString()} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `₹${formatNumber(v)}`} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Videos */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="text-sm font-semibold text-slate-100">Top Performing Videos</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fictional rankings by view count</p>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="skeleton w-16 h-9 rounded-lg" />
                  <div className="skeleton h-4 flex-1 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                </div>
              ))
            ) : (
              data?.topVideos.map((video, i) => (
                <div key={video.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  <span className="text-sm font-bold text-slate-600 w-5 flex-shrink-0">#{i + 1}</span>
                  <div className="w-16 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{video.title}</p>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-200 tabular-nums">{formatNumber(video.views ?? 0)}</p>
                      <p className="text-xs text-slate-500">views</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-semibold text-emerald-400 tabular-nums">{formatCurrency(video.revenue ?? 0)}</p>
                      <p className="text-xs text-slate-500">revenue</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
