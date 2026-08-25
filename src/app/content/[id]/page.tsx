"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { formatNumber, formatCurrency, formatWatchTime, formatDate, formatDuration } from "@/lib/utils";
import {
  Eye, ThumbsUp, MessageSquare, Clock, Users, DollarSign,
  BarChart3, Pencil, ChevronLeft, Play, Calendar, Tag, Lock,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface VideoData {
  id: number; title: string; description: string | null; thumbnailUrl: string | null;
  videoUrl: string | null; category: string | null; tags: string[] | null;
  visibility: string; status: string; uploadDate: string;
  views: number | null; likes: number | null; comments: number | null;
  watchTime: number | null; averageViewDuration: number | null;
  subscribersGained: number | null; revenue: number | null;
}

interface AnalyticsData {
  aggregate: {
    views: number; likes: number; comments: number; watchTime: number;
    averageViewDuration: number; subscribersGained: number; revenue: number;
  } | null;
  daily: Array<{
    date: string; views: number; likes: number; comments: number;
    watchTime: number; revenue: number; subscribersGained: number;
  }>;
}

const CHART_TABS = [
  { key: "views" as const, label: "Views", color: "#6366f1" },
  { key: "likes" as const, label: "Likes", color: "#ec4899" },
  { key: "comments" as const, label: "Comments", color: "#f59e0b" },
  { key: "revenue" as const, label: "Revenue", color: "#10b981" },
  { key: "subscribersGained" as const, label: "Subscribers", color: "#06b6d4" },
];

export default function VideoAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [video, setVideo] = useState<VideoData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<typeof CHART_TABS[number]["key"]>("views");
  const [range, setRange] = useState("90d");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [vRes, aRes] = await Promise.all([
          fetch(`/api/videos/${id}`),
          fetch(`/api/videos/${id}/analytics?range=${range}`),
        ]);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVideo(vData.video);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAnalytics(aData);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, range]);

  const chartTab = CHART_TABS.find((t) => t.key === activeChart)!;

  const statCards = [
    { label: "Views", value: formatNumber(analytics?.aggregate?.views ?? 0), icon: <Eye className="w-4 h-4 text-indigo-400" />, bg: "bg-indigo-500/15" },
    { label: "Likes", value: formatNumber(analytics?.aggregate?.likes ?? 0), icon: <ThumbsUp className="w-4 h-4 text-pink-400" />, bg: "bg-pink-500/15" },
    { label: "Comments", value: formatNumber(analytics?.aggregate?.comments ?? 0), icon: <MessageSquare className="w-4 h-4 text-amber-400" />, bg: "bg-amber-500/15" },
    { label: "Watch Time", value: formatWatchTime(analytics?.aggregate?.watchTime ?? 0), icon: <Clock className="w-4 h-4 text-violet-400" />, bg: "bg-violet-500/15" },
    { label: "Avg Duration", value: formatDuration(analytics?.aggregate?.averageViewDuration ?? 0), icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, bg: "bg-cyan-500/15" },
    { label: "Subscribers", value: `+${formatNumber(analytics?.aggregate?.subscribersGained ?? 0)}`, icon: <Users className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/15" },
    { label: "Revenue", value: formatCurrency(analytics?.aggregate?.revenue ?? 0), icon: <DollarSign className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/15" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!video) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Play className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">Video not found</p>
          <Link href="/content" className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to Content
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/content" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Content
          </Link>
          <span>/</span>
          <span className="text-slate-300 truncate">{video.title}</span>
        </div>

        {/* Video header card */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="aspect-video rounded-xl overflow-hidden bg-black/40">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-100">{video.title}</h1>
                <Link
                  href={`/admin/videos/${video.id}/edit`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-xs text-slate-300 font-medium transition-colors flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>

              {video.description && (
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{video.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={video.status} />
                <StatusBadge status={video.visibility} />

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(video.uploadDate)}
                </div>

                {video.category && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Tag className="w-3.5 h-3.5" />
                    {video.category}
                  </div>
                )}

                {video.visibility === "private" && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                    Private
                  </div>
                )}
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-xs text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="bg-[#12121a] border border-white/8 rounded-2xl p-4 hover:border-white/12 transition-colors">
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className="text-lg font-bold text-slate-100 tabular-nums">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Performance Analytics</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fictional daily breakdown — demo data</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Range */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                {["28d", "90d", "365d"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      range === r ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {r === "28d" ? "28d" : r === "90d" ? "90d" : "365d"}
                  </button>
                ))}
              </div>
              {/* Chart tabs */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                {CHART_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveChart(tab.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeChart === tab.key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={analytics?.daily ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="videoChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTab.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartTab.color} stopOpacity={0} />
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
                tickFormatter={(v) => activeChart === "revenue" ? `₹${formatNumber(v)}` : formatNumber(v)}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
                itemStyle={{ color: chartTab.color, fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke={chartTab.color}
                strokeWidth={2}
                fill="url(#videoChartGrad)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/videos/${video.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Video & Analytics
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-sm text-slate-300 font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Admin Analytics Panel
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
