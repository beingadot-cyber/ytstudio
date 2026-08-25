"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Video, BarChart3, DollarSign, MessageSquare,
  Settings, HelpCircle, ChevronRight, Shield, X, Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: Video },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/comments", label: "Comments", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Admin Panel", icon: Shield },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { displayName: string; channelName: string; avatarUrl?: string; username?: string } | null;
}

function NavItem({ href, label, icon: Icon, active, onClick }: {
  href: string; label: string; icon: React.ElementType; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        active
          ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
      <span className="truncate">{label}</span>
      {active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
    </Link>
  );
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CS";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0d0d15] border-r border-white/8",
          "transition-transform duration-300 ease-in-out",
          "w-[240px]",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clapperboard className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate leading-tight">Creator Studio</p>
            <p className="text-xs text-indigo-400 font-medium">Demo</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-300 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              onClick={onClose}
            />
          ))}

          <div className="pt-4 mt-4 border-t border-white/8">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Admin
            </p>
            {ADMIN_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onClick={onClose}
              />
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/8 p-3 space-y-1">
          <NavItem
            href="/settings"
            label="Help & Support"
            icon={HelpCircle}
            active={false}
            onClick={onClose}
          />

          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={initials} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.displayName ?? "Studio Admin"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.channelName ?? "Creator Studio"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
