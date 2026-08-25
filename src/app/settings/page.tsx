"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { User, Settings, Palette, Database, Shield, Save, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "demo", label: "Demo Settings", icon: Shield },
  { id: "data", label: "Data Management", icon: Database },
];

export default function SettingsPage() {
  const [section, setSection] = useState("profile");
  const [userData, setUserData] = useState<{
    displayName: string; channelName: string; channelDescription: string;
    email: string; username: string; currency: string; theme: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setUserData(d.user);
        setDisplayName(d.user?.displayName ?? "");
        setChannelName(d.user?.channelName ?? "");
        setChannelDescription(d.user?.channelDescription ?? "");
        setCurrency(d.user?.currency ?? "INR");
        setTheme(d.user?.theme ?? "dark");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, channelName, channelDescription, currency, theme }),
      });
      if (res.ok) {
        addToast("success", "Settings saved successfully!");
      } else {
        addToast("error", "Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetAnalytics = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/settings?action=reset-analytics", { method: "DELETE" });
      if (res.ok) {
        addToast("success", "Analytics data reset successfully.");
        setResetConfirm(false);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/init", { method: "POST" });
      if (res.ok) {
        addToast("success", "Seed data generated! Refresh to see changes.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your Creator Studio Demo configuration</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <div className="md:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                    section === id
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", section === id ? "text-indigo-400" : "text-slate-500")} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Profile */}
                {section === "profile" && (
                  <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-semibold text-slate-100">Profile Settings</h2>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Channel Name</label>
                      <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Channel Description</label>
                      <textarea
                        value={channelDescription}
                        onChange={(e) => setChannelDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={userData?.username ?? ""}
                        disabled
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-600">Username cannot be changed in demo mode.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={userData?.email ?? ""}
                        disabled
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-sm text-white font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}

                {/* Account */}
                {section === "account" && (
                  <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-semibold text-slate-100">Account Settings</h2>
                    <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                      <p className="text-sm text-amber-400 font-medium mb-1">Demo Account</p>
                      <p className="text-xs text-amber-300/70">This is a demonstration account. Password changes and other account modifications are simulated and do not affect real accounts.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
                      <input type="password" placeholder="••••••••" disabled className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                      <input type="password" placeholder="••••••••" disabled className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="p-3 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-500">
                      Default credentials: <span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">Admin@123</span>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {section === "appearance" && (
                  <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-semibold text-slate-100">Appearance</h2>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Theme</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["dark", "light"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              "p-4 rounded-xl border text-sm font-medium capitalize transition-all",
                              theme === t ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/10 text-slate-400 hover:border-white/20"
                            )}
                          >
                            {t === "dark" ? "🌙 Dark" : "☀️ Light"} (Demo Only)
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">Theme switching is a demo feature — the dashboard uses dark mode.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="INR" className="bg-[#12121a]">₹ Indian Rupee (INR)</option>
                        <option value="USD" className="bg-[#12121a]">$ US Dollar (USD)</option>
                        <option value="EUR" className="bg-[#12121a]">€ Euro (EUR)</option>
                        <option value="GBP" className="bg-[#12121a]">£ British Pound (GBP)</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-sm text-white font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}

                {/* Demo Settings */}
                {section === "demo" && (
                  <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-semibold text-slate-100">Demo Settings</h2>
                    <div className="p-4 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                      <p className="text-sm text-indigo-400 font-medium mb-1">ℹ️ About Demo Mode</p>
                      <p className="text-xs text-indigo-300/70">This dashboard displays fictional analytics data for demonstration purposes only. All views, subscribers, revenue, and engagement metrics are generated and do not represent real platform data.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white/3 border border-white/8 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-200">Show Demo Badge</p>
                          <p className="text-xs text-slate-500 mt-0.5">Display the "DEMO — Fictional Data" indicator in the topbar</p>
                        </div>
                        <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end pr-1 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/3 border border-white/8 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-200">Mark Demo Comments</p>
                          <p className="text-xs text-slate-500 mt-0.5">Show "demo" label on AI-generated comments</p>
                        </div>
                        <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end pr-1 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Management */}
                {section === "data" && (
                  <div className="space-y-4">
                    <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                      <h2 className="text-base font-semibold text-slate-100">Data Management</h2>
                      <p className="text-sm text-slate-400">Manage your fictional demo data. These actions affect the demonstration database.</p>
                    </div>

                    <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-slate-200">Generate Seed Data</h3>
                      <p className="text-xs text-slate-500">Populate the database with sample videos, analytics, comments, and revenue data.</p>
                      <button
                        onClick={handleSeedData}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-sm text-white font-medium transition-colors"
                      >
                        <Database className="w-4 h-4" />
                        {actionLoading ? "Generating..." : "Generate Seed Data"}
                      </button>
                    </div>

                    <div className="bg-[#12121a] border border-amber-500/20 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-amber-400">⚠️ Reset Analytics</h3>
                      <p className="text-xs text-slate-500">Reset all analytics data (views, likes, comments, revenue) to zero. Video records are preserved.</p>
                      <button
                        onClick={() => setResetConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm text-white font-medium transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset All Analytics
                      </button>
                    </div>

                    <div className="bg-[#12121a] border border-red-500/20 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-red-400">⚠️ Delete All Demo Data</h3>
                      <p className="text-xs text-slate-500">Permanently delete all videos, analytics, comments, and revenue data. This cannot be undone.</p>
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm text-white font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All Data
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleResetAnalytics}
        title="Reset Analytics Data"
        message="This will reset all views, likes, comments, watch time, and revenue to zero. Video records will be kept. Are you sure?"
        confirmText="Reset Analytics"
        confirmVariant="danger"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={async () => {
          setActionLoading(true);
          await fetch("/api/settings?action=delete-all", { method: "DELETE" });
          setDeleteConfirm(false);
          setActionLoading(false);
          addToast("success", "All demo data deleted.");
        }}
        title="Delete All Data"
        message="This will permanently delete ALL videos, analytics, comments, and revenue data. This action cannot be undone."
        confirmText="Delete Everything"
        confirmVariant="danger"
        loading={actionLoading}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  );
}
