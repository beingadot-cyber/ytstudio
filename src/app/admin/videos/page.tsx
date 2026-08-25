"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, X, BarChart3, Pencil, Trash2, Play } from "lucide-react";

interface Video {
  id: number; title: string; thumbnailUrl: string | null;
  visibility: string; status: string; uploadDate: string;
  views: number | null; likes: number | null; revenue: number | null; category: string | null;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "15", search: debouncedSearch });
      const res = await fetch(`/api/videos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/videos/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchVideos();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link href="/admin" className="hover:text-slate-300">Admin</Link>
              <span>/</span>
              <span className="text-slate-300">Videos</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Manage Videos</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pagination.total} videos in database</p>
          </div>
          <Link
            href="/admin/videos/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Video
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-[calc(100%-2rem)] top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Uploaded</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="skeleton h-4 w-full rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Play className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No videos found</p>
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-18 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/40" style={{ width: "72px", height: "40px" }}>
                            {video.thumbnailUrl ? (
                              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <Play className="w-3 h-3 text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{video.title}</p>
                            <p className="text-xs text-slate-500">ID: {video.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell"><StatusBadge status={video.status} /></td>
                      <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-400">{video.category ?? "—"}</td>
                      <td className="px-4 py-4 text-right text-sm text-slate-300 tabular-nums">{formatNumber(video.views ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-sm text-emerald-400 tabular-nums hidden lg:table-cell">{formatCurrency(video.revenue ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500 hidden xl:table-cell">{formatDate(video.uploadDate)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/content/${video.id}`} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Analytics">
                            <BarChart3 className="w-4 h-4" />
                          </Link>
                          <Link href={`/admin/videos/${video.id}/edit`} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleteId(video.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && pagination.total > 0 && (
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Video" message="Delete this video and all its analytics data permanently?"
        confirmText="Delete" confirmVariant="danger" loading={deleteLoading}
      />
    </DashboardLayout>
  );
}
