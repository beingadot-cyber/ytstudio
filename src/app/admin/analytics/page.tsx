"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Wand2, Save, BarChart3, Calendar, Eye, ThumbsUp, MessageSquare, Clock, Users, DollarSign } from "lucide-react";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  watchTime: number | null;
  averageViewDuration: number | null;
  subscribersGained: number | null;
  revenue: number | null;
}

export default function AdminAnalyticsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Edit fields
  const [editViews, setEditViews] = useState("0");
  const [editLikes, setEditLikes] = useState("0");
  const [editComments, setEditComments] = useState("0");
  const [editWatchTime, setEditWatchTime] = useState("0");
  const [editAvgDuration, setEditAvgDuration] = useState("0");
  const [editSubscribers, setEditSubscribers] = useState("0");
  const [editRevenue, setEditRevenue] = useState("0");

  // Generator fields
  const [genStartDate, setGenStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split("T")[0];
  });
  const [genEndDate, setGenEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [genStartViews, setGenStartViews] = useState("0");
  const [genEndViews, setGenEndViews] = useState("100000");
  const [genStartLikes, setGenStartLikes] = useState("0");
  const [genEndLikes, setGenEndLikes] = useState("8000");
  const [genStartComments, setGenStartComments] = useState("0");
  const [genEndComments, setGenEndComments] = useState("500");
  const [genStartRevenue, setGenStartRevenue] = useState("0");
  const [genEndRevenue, setGenEndRevenue] = useState("15000");

  useEffect(() => {
    fetch("/api/videos?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setVideos(d.videos ?? []);
        if (d.videos?.length > 0) setSelectedVideoId(d.videos[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedVideoId) {
      const v = videos.find((vv) => vv.id === selectedVideoId);
      if (v) {
        setSelectedVideo(v);
        setEditViews(String(v.views ?? 0));
        setEditLikes(String(v.likes ?? 0));
        setEditComments(String(v.comments ?? 0));
        setEditWatchTime(String(v.watchTime ?? 0));
        setEditAvgDuration(String(v.averageViewDuration ?? 0));
        setEditSubscribers(String(v.subscribersGained ?? 0));
        setEditRevenue(String(v.revenue ?? 0));
      }
    }
  }, [selectedVideoId, videos]);

  const handleSaveAnalytics = async () => {
    if (!selectedVideoId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${selectedVideoId}/analytics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          views: parseInt(editViews) || 0,
          likes: parseInt(editLikes) || 0,
          comments: parseInt(editComments) || 0,
          watchTime: parseInt(editWatchTime) || 0,
          averageViewDuration: parseInt(editAvgDuration) || 0,
          subscribersGained: parseInt(editSubscribers) || 0,
          revenue: parseFloat(editRevenue) || 0,
        }),
      });
      if (res.ok) {
        addToast("success", "Analytics saved successfully!");
        // Refresh videos
        const r = await fetch("/api/videos?limit=100");
        const d = await r.json();
        setVideos(d.videos ?? []);
      } else {
        addToast("error", "Failed to save analytics");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVideoId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-demo-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: selectedVideoId,
          startDate: genStartDate,
          endDate: genEndDate,
          startViews: parseInt(genStartViews) || 0,
          endViews: parseInt(genEndViews) || 0,
          startLikes: parseInt(genStartLikes) || 0,
          endLikes: parseInt(genEndLikes) || 0,
          startComments: parseInt(genStartComments) || 0,
          endComments: parseInt(genEndComments) || 0,
          startRevenue: parseInt(genStartRevenue) || 0,
          endRevenue: parseInt(genEndRevenue) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", `Generated ${data.generated.days} days of fictional analytics!`);
        // Refresh
        const r = await fetch("/api/videos?limit=100");
        const d = await r.json();
        setVideos(d.videos ?? []);
      } else {
        addToast("error", data.error ?? "Generation failed");
      }
    } finally {
      setGenerating(false);
    }
  };

  const analyticsFields = [
    { label: "Views", icon: <Eye className="w-4 h-4 text-indigo-400" />, value: editViews, setValue: setEditViews, original: selectedVideo?.views ?? 0 },
    { label: "Likes", icon: <ThumbsUp className="w-4 h-4 text-pink-400" />, value: editLikes, setValue: setEditLikes, original: selectedVideo?.likes ?? 0 },
    { label: "Comments", icon: <MessageSquare className="w-4 h-4 text-amber-400" />, value: editComments, setValue: setEditComments, original: selectedVideo?.comments ?? 0 },
    { label: "Watch Time (min)", icon: <Clock className="w-4 h-4 text-violet-400" />, value: editWatchTime, setValue: setEditWatchTime, original: selectedVideo?.watchTime ?? 0 },
    { label: "Avg Duration (sec)", icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, value: editAvgDuration, setValue: setEditAvgDuration, original: selectedVideo?.averageViewDuration ?? 0 },
    { label: "Subscribers Gained", icon: <Users className="w-4 h-4 text-blue-400" />, value: editSubscribers, setValue: setEditSubscribers, original: selectedVideo?.subscribersGained ?? 0 },
    { label: "Revenue (₹)", icon: <DollarSign className="w-4 h-4 text-emerald-400" />, value: editRevenue, setValue: setEditRevenue, original: selectedVideo?.revenue ?? 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/admin" className="hover:text-slate-300">Admin</Link>
          <span>/</span>
          <span className="text-slate-300">Analytics Panel</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Analytics Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit fictional analytics data for individual videos</p>
        </div>

        {/* Video selector */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Video</label>
          {loading ? (
            <div className="skeleton h-12 rounded-xl" />
          ) : (
            <select
              value={selectedVideoId ?? ""}
              onChange={(e) => setSelectedVideoId(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              {videos.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#12121a]">
                  {v.title} (ID: {v.id})
                </option>
              ))}
            </select>
          )}
          {selectedVideo && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/8">
              <div className="w-16 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                {selectedVideo.thumbnailUrl ? (
                  <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-200 font-medium">{selectedVideo.title}</p>
                <p className="text-xs text-slate-500">
                  Current: {formatNumber(selectedVideo.views ?? 0)} views · {formatCurrency(selectedVideo.revenue ?? 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Edit analytics */}
          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Edit Analytics Values</h2>
              <p className="text-xs text-amber-400/70 mt-1">⚠️ All values are fictional demonstration data.</p>
            </div>

            <div className="space-y-3">
              {analyticsFields.map(({ label, icon, value, setValue, original }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors tabular-nums"
                      />
                      <span className="text-xs text-slate-600 whitespace-nowrap">
                        was: {formatNumber(Number(original))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAnalytics}
              disabled={saving || !selectedVideoId}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Analytics"}
            </button>
          </div>

          {/* Fictional Analytics Generator */}
          <div className="bg-[#12121a] border border-indigo-500/20 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-semibold text-slate-100">Fictional Demo Analytics Generator</h2>
              </div>
              <p className="text-xs text-slate-500">Generate fictional daily analytics data for the selected video over a date range.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3 inline mr-1" />Start Date
                </label>
                <input type="date" value={genStartDate} onChange={(e) => setGenStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3 inline mr-1" />End Date
                </label>
                <input type="date" value={genEndDate} onChange={(e) => setGenEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Views Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Starting Views</label>
                  <input type="number" min="0" value={genStartViews} onChange={(e) => setGenStartViews(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ending Views</label>
                  <input type="number" min="0" value={genEndViews} onChange={(e) => setGenEndViews(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Likes Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Starting Likes</label>
                  <input type="number" min="0" value={genStartLikes} onChange={(e) => setGenStartLikes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ending Likes</label>
                  <input type="number" min="0" value={genEndLikes} onChange={(e) => setGenEndLikes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue Range (₹)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Starting Revenue</label>
                  <input type="number" min="0" value={genStartRevenue} onChange={(e) => setGenStartRevenue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ending Revenue</label>
                  <input type="number" min="0" value={genEndRevenue} onChange={(e) => setGenEndRevenue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 tabular-nums" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-xs text-amber-400">
              ⚠️ This will generate fictional daily analytics for the selected video within the specified date range. Existing data for this period will be replaced.
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedVideoId}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              {generating ? "Generating..." : "Generate Fictional Analytics"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  );
}
