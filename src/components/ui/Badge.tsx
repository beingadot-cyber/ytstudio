import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "draft" | "scheduled";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  danger: "bg-red-500/15 text-red-400 border-red-500/25",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  draft: "bg-slate-700/50 text-slate-400 border-slate-600/50",
  scheduled: "bg-violet-500/15 text-violet-400 border-violet-500/25",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-md",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    published: { label: "Published", variant: "success" },
    draft: { label: "Draft", variant: "draft" },
    scheduled: { label: "Scheduled", variant: "scheduled" },
    hidden: { label: "Hidden", variant: "warning" },
    public: { label: "Public", variant: "success" },
    private: { label: "Private", variant: "danger" },
    unlisted: { label: "Unlisted", variant: "info" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={variant}>{label}</Badge>;
}
