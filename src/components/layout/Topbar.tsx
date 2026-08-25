"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, Settings, User, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  type: string;
  thumbnail?: string | null;
}

interface TopbarProps {
  onMenuClick: () => void;
  user?: { displayName: string; username?: string; channelName: string; avatarUrl?: string } | null;
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search videos, comments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-indigo-400/50 border-t-indigo-400 rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result.href)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              {result.thumbnail ? (
                <img
                  src={result.thumbnail}
                  alt=""
                  className="w-10 h-6 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-6 bg-white/10 rounded flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 truncate">{result.title}</p>
                <p className="text-xs text-slate-500">{result.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl p-4 z-50">
          <p className="text-sm text-slate-500 text-center">No results found</p>
        </div>
      )}
    </div>
  );
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CS";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[240px] h-16 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/8 z-30 flex items-center px-4 gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <GlobalSearch />

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* DEMO badge */}
        <div className="demo-badge hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>DEMO · Fictional Data</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={initials} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{initials}</span>
              )}
            </div>
            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform hidden sm:block", profileOpen && "rotate-180")} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-sm font-semibold text-slate-200">{user?.displayName ?? "Studio Admin"}</p>
                <p className="text-xs text-slate-500">{user?.channelName}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  Settings
                </button>
                <button
                  onClick={() => { router.push("/admin"); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Admin Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
