"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import {
  Upload, Plus, Search, Filter, SortAsc, SortDesc, Eye, Pencil,
  Trash2, BarChart3, Play, X, ChevronDown,
} from "lucide-react";

interface Video {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  visibility: string;
  status: string;
  uploadDate: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  revenue: number | null;
  category: string | null;
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

const SORT_OPTIONS = [
  { label: "Upload Date", value: "uploadDate" },
  { label: "Views", value: "views" },
  { label: "Likes", value: "likes" },
  { label: "Revenue", value: "revenue" },
];

export default function ContentPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: debouncedSearch,
        filter,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/videos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, sortBy, sortOrder]);

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

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Content</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pagination.total} videos in your channel</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/videos/new"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-sm text-slate-300 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Demo
            </Link>
            <Link
              href="/admin/videos/new"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === opt.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#12121a]">
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
            >
              {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content table */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Uploaded</th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => toggleSort("views")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Views {sortBy === "views" && (sortOrder === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Likes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Comments</th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-slate-300"
                    onClick={() => toggleSort("revenue")}
                  >
                    Revenue {sortBy === "revenue" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="skeleton h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <Play className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No videos found</p>
                      <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <Play className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/content/${video.id}`}
                              className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1"
                            >
                              {video.title}
                            </Link>
                            {video.description && (
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 hidden sm:block">
                                {video.description}
                              </p>
                            )}
                            {video.category && (
                              <span className="text-xs text-slate-600">{video.category}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <StatusBadge status={video.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {formatDate(video.uploadDate)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-300 tabular-nums">
                        {formatNumber(video.views ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-400 tabular-nums hidden lg:table-cell">
                        {formatNumber(video.likes ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-400 tabular-nums hidden xl:table-cell">
                        {formatNumber(video.comments ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-emerald-400 tabular-nums hidden lg:table-cell">
                        {formatCurrency(video.revenue ?? 0)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
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
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(video.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
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
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video and all its analytics data? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
}
