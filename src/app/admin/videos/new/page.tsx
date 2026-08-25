"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadBox } from "@/components/ui/UploadBox";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { Save, X, Tag, Plus } from "lucide-react";

const CATEGORIES = [
  "Programming", "Design", "DevOps", "Cloud", "Database", "Security",
  "Performance", "Architecture", "Testing", "System Design", "Other",
];

export default function NewVideoPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("published");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);

  // Analytics
  const [views, setViews] = useState("0");
  const [likes, setLikes] = useState("0");
  const [commentsCount, setCommentsCount] = useState("0");
  const [watchTime, setWatchTime] = useState("0");
  const [avgDuration, setAvgDuration] = useState("0");
  const [subscribersGained, setSubscribersGained] = useState("0");
  const [revenue, setRevenue] = useState("0");

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast("error", "Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, thumbnailUrl, videoUrl, category, tags,
          visibility, status, uploadDate,
          views: parseInt(views) || 0,
          likes: parseInt(likes) || 0,
          comments: parseInt(commentsCount) || 0,
          watchTime: parseInt(watchTime) || 0,
          averageViewDuration: parseInt(avgDuration) || 0,
          subscribersGained: parseInt(subscribersGained) || 0,
          revenue: parseFloat(revenue) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Video created successfully!");
        setTimeout(() => router.push(`/content/${data.video.id}`), 1000);
      } else {
        addToast("error", data.error ?? "Failed to create video");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/admin" className="hover:text-slate-300">Admin</Link>
          <span>/</span>
          <Link href="/admin/videos" className="hover:text-slate-300">Videos</Link>
          <span>/</span>
          <span className="text-slate-300">New Video</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-6">Create New Video</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Video Details</h2>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter video title..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Enter video description..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    >
                      <option value="" className="bg-[#12121a]">Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#12121a]">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload Date</label>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400"
                        >
                          #{tag}
                          <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-indigo-400/60 hover:text-indigo-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics section */}
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Fictional Analytics</h2>
                  <p className="text-xs text-amber-400/70 mt-1">⚠️ These are demo values and do not represent real platform data.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Views", value: views, setValue: setViews },
                    { label: "Likes", value: likes, setValue: setLikes },
                    { label: "Comments", value: commentsCount, setValue: setCommentsCount },
                    { label: "Watch Time (min)", value: watchTime, setValue: setWatchTime },
                    { label: "Avg Duration (sec)", value: avgDuration, setValue: setAvgDuration },
                    { label: "Subscribers Gained", value: subscribersGained, setValue: setSubscribersGained },
                  ].map(({ label, value, setValue }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors tabular-nums"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Thumbnail */}
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
                <UploadBox value={thumbnailUrl} onChange={setThumbnailUrl} />
              </div>

              {/* Visibility & Status */}
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-200">Publish Settings</h2>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    <option value="public" className="bg-[#12121a]">Public</option>
                    <option value="private" className="bg-[#12121a]">Private</option>
                    <option value="unlisted" className="bg-[#12121a]">Unlisted</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    <option value="published" className="bg-[#12121a]">Published</option>
                    <option value="draft" className="bg-[#12121a]">Draft</option>
                    <option value="scheduled" className="bg-[#12121a]">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Video"}
                </button>
                <Link
                  href="/admin/videos"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-slate-300 text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  );
}
