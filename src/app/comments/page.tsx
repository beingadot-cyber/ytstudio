"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { formatRelativeDate, formatNumber } from "@/lib/utils";
import {
  Search, X, MessageSquare, ThumbsUp, EyeOff, Trash2, Reply,
  Plus, Filter,
} from "lucide-react";

interface Comment {
  id: number;
  videoId: number;
  author: string;
  text: string;
  likes: number;
  status: string;
  isDemo: boolean;
  createdAt: string;
  videoTitle: string | null;
  videoThumbnail: string | null;
}

interface VideoOption { id: number; title: string }

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Hidden", value: "hidden" },
];

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [videos, setVideos] = useState<VideoOption[]>([]);

  // Create form state
  const [formVideoId, setFormVideoId] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formText, setFormText] = useState("");
  const [formLikes, setFormLikes] = useState("0");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: debouncedSearch,
        filter,
      });
      const res = await fetch(`/api/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  // Load videos for create form
  useEffect(() => {
    fetch("/api/videos?limit=100")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos?.map((v: { id: number; title: string }) => ({ id: v.id, title: v.title })) ?? []))
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/comments/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchComments();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleHide = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "hidden" ? "published" : "hidden";
    await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchComments();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: parseInt(formVideoId),
          author: formAuthor,
          text: formText,
          likes: parseInt(formLikes) || 0,
          status: "published",
        }),
      });
      setCreateOpen(false);
      setFormVideoId("");
      setFormAuthor("");
      setFormText("");
      setFormLikes("0");
      fetchComments();
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Comments</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pagination.total} fictional comments</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Demo Comment
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === opt.value ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Comments table */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Video</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Likes</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="skeleton h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : comments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No comments found</p>
                    </td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr key={comment.id} className={`hover:bg-white/2 transition-colors ${comment.status === "hidden" ? "opacity-60" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-300">
                              {comment.author[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{comment.author}</p>
                            {comment.isDemo && (
                              <span className="text-xs text-amber-500/70">demo</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-sm text-slate-300 line-clamp-2">{comment.text}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {comment.videoThumbnail ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.videoThumbnail}
                              alt=""
                              className="w-10 h-6 rounded object-cover flex-shrink-0"
                            />
                            <p className="text-xs text-slate-400 truncate max-w-[140px]">{comment.videoTitle}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 truncate">{comment.videoTitle ?? "Unknown"}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap hidden lg:table-cell">
                        {formatRelativeDate(comment.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                          <ThumbsUp className="w-3 h-3" />
                          {formatNumber(comment.likes)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={comment.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Reply (demo)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleHide(comment.id, comment.status)}
                            title={comment.status === "hidden" ? "Unhide" : "Hide"}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(comment.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create comment modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Demo Comment" size="md">
        <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
          This will create a fictional demo comment for demonstration purposes.
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Video</label>
            <select
              value={formVideoId}
              onChange={(e) => setFormVideoId(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="" className="bg-[#12121a]">Select a video...</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#12121a]">{v.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Author Name</label>
            <input
              type="text"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
              required
              placeholder="e.g. DemoUser123"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Comment Text</label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              required
              rows={3}
              placeholder="Enter fictional comment text..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Likes</label>
            <input
              type="number"
              value={formLikes}
              onChange={(e) => setFormLikes(e.target.value)}
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-white text-sm font-medium transition-colors"
            >
              {creating ? "Creating..." : "Add Comment"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
}
