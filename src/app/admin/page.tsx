"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatNumber, formatCurrency, formatWatchTime } from "@/lib/utils";
import {
  Video, Eye, ThumbsUp, MessageSquare, DollarSign, Users,
  Plus, Pencil, BarChart3, Wand2, MessageCircle, ChevronRight,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<{
    videoCount: number; views: number; likes: number;
    comments: number; revenue: number; subscribers: number;
  } | null>(null);
  const [recentVideos, setRecentVideos] = useState<Array<{
    id: number; title: string; thumbnailUrl: string | null;
    views: number | null; revenue: number | null; status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard?range=365d").then((r) => r.json()),
      fetch("/api/videos?limit=5&sortBy=uploadDate&sortOrder=desc").then((r) => r.json()),
    ]).then(([dash, vids]) => {
      setStats({
        videoCount: dash.totals?.videoCount ?? 0,
        views: dash.totals?.views ?? 0,
        likes: dash.totals?.likes ?? 0,
        comments: dash.totals?.comments ?? 0,
        revenue: dash.totals?.revenue ?? 0,
        subscribers: dash.totals?.subscribers ?? 248000,
      });
      setRecentVideos(vids.videos ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Total Videos", value: formatNumber(stats?.videoCount ?? 0), icon: <Video className="w-5 h-5 text-indigo-400" />, bg: "bg-indigo-500/15", href: "/admin/videos" },
    { title: "Total Views", value: formatNumber(stats?.views ?? 0), icon: <Eye className="w-5 h-5 text-blue-400" />, bg: "bg-blue-500/15", href: "/analytics" },
    { title: "Total Likes", value: formatNumber(stats?.likes ?? 0), icon: <ThumbsUp className="w-5 h-5 text-pink-400" />, bg: "bg-pink-500/15", href: "/analytics" },
    { title: "Total Comments", value: formatNumber(stats?.comments ?? 0), icon: <MessageSquare className="w-5 h-5 text-amber-400" />, bg: "bg-amber-500/15", href: "/comments" },
    { title: "Total Revenue", value: formatCurrency(stats?.revenue ?? 0), icon: <DollarSign className="w-5 h-5 text-emerald-400" />, bg: "bg-emerald-500/15", href: "/revenue" },
    { title: "Subscribers", value: formatNumber(stats?.subscribers ?? 248000), icon: <Users className="w-5 h-5 text-cyan-400" />, bg: "bg-cyan-500/15", href: "/analytics" },
  ];

  const quickActions = [
    { label: "Add Video", href: "/admin/videos/new", icon: Plus, color: "text-indigo-400" },
    { label: "Edit Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-blue-400" },
    { label: "Manage Videos", href: "/admin/videos", icon: Pencil, color: "text-violet-400" },
    { label: "Comments", href: "/admin/comments", icon: MessageCircle, color: "text-amber-400" },
    { label: "Generate Analytics", href: "/admin/analytics", icon: Wand2, color: "text-emerald-400" },
    { label: "Revenue Data", href: "/admin/revenue", icon: DollarSign, color: "text-green-400" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage all fictional demo data</p>
          </div>
          <div className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full text-xs text-violet-400 font-semibold">
            Admin Access
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#12121a] border border-white/8 rounded-2xl p-5">
                <div className="skeleton h-10 w-10 rounded-xl mb-4" />
                <div className="skeleton h-7 w-20 mb-1 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))
          ) : (
            statCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all cursor-pointer group">
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <p className="text-xl font-bold text-slate-100 tabular-nums">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">{card.title}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-white/3 hover:bg-white/6 border border-white/8 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-400 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent videos */}
          <div className="xl:col-span-2 bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-slate-100">Recent Videos</h2>
              <Link href="/admin/videos" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Manage all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="skeleton w-16 h-9 rounded-lg" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-48 mb-2 rounded" />
                      <div className="skeleton h-3 w-24 rounded" />
                    </div>
                    <div className="skeleton h-6 w-16 rounded" />
                  </div>
                ))
              ) : (
                recentVideos.map((video) => (
                  <div key={video.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                    <div className="w-16 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{video.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatNumber(video.views ?? 0)} views · {formatCurrency(video.revenue ?? 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/content/${video.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Admin navigation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/admin/videos", title: "Manage Videos", desc: "Add, edit, delete video entries", icon: Video, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { href: "/admin/videos/new", title: "New Video", desc: "Create a new demo video entry", icon: Plus, color: "text-violet-400", bg: "bg-violet-500/10" },
            { href: "/admin/analytics", title: "Analytics Panel", desc: "Edit fictional analytics data", icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
            { href: "/admin/comments", title: "Comments Admin", desc: "Manage fictional comments", icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((card) => (
            <Link key={card.href} href={card.href}>
              <div className="bg-[#12121a] border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all group cursor-pointer">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{card.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
                <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${card.color}`}>
                  Go to section <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
