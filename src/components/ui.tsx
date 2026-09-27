import type { ReactNode } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import type { FindingSeverity, RiskLevel, Status } from "../lib/types";
import { cls } from "../lib/utils";

// ── Status pill (five verification statuses) ────────────────────────────────

const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  pending: { label: "Waiting", cls: "text-slate-600 border-slate-200 bg-slate-100/80", dot: "bg-slate-400" },
  running: { label: "Running", cls: "text-sky-700 border-sky-200 bg-sky-50", dot: "bg-sky-500 animate-pulse" },
  ok: { label: "Passed", cls: "text-emerald-700 border-emerald-200 bg-emerald-50", dot: "bg-emerald-500" },
  warn: { label: "Attention", cls: "text-amber-800 border-amber-200 bg-amber-50", dot: "bg-amber-500" },
  fail: { label: "Failed", cls: "text-red-700 border-red-200 bg-red-50", dot: "bg-red-500" },
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cls(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors duration-200 shadow-2xs",
        m.cls,
        className
      )}
    >
      <span className={cls("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

// ── Severity / risk badges ───────────────────────────────────────────────────

const SEVERITY_META: Record<RiskLevel | FindingSeverity, string> = {
  LOW: "text-slate-700 border-slate-200 bg-slate-100",
  MEDIUM: "text-amber-800 border-amber-200 bg-amber-50",
  HIGH: "text-orange-800 border-orange-200 bg-orange-50",
  CRITICAL: "text-red-800 border-red-200 bg-red-50",
};

export function SeverityBadge({ level, className }: { level: RiskLevel | FindingSeverity; className?: string }) {
  return (
    <span
      className={cls(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider border shadow-2xs",
        SEVERITY_META[level],
        className
      )}
    >
      {level}
    </span>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

export function Card({
  title,
  icon,
  right,
  children,
  className,
  tone,
}: {
  title?: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "ok" | "warn" | "fail";
}) {
  const toneBorder =
    tone === "ok"
      ? "border-emerald-300 ring-1 ring-emerald-100"
      : tone === "warn"
        ? "border-amber-300 ring-1 ring-amber-100"
        : tone === "fail"
          ? "border-red-300 ring-1 ring-red-100"
          : "border-slate-200/90";

  return (
    <section
      className={cls(
        "rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-sm",
        toneBorder,
        className
      )}
    >
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 rounded-t-2xl">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
            {icon}
            {title && <h3 className="font-heading text-[13px] font-semibold tracking-tight text-slate-800">{title}</h3>}
          </div>
          {right}
        </header>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────

const BTN_VARIANTS: Record<string, string> = {
  primary:
    "bg-slate-900 text-white font-medium hover:bg-slate-800 active:scale-[0.98] border border-slate-900 shadow-xs hover:shadow-sm",
  ghost:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] shadow-2xs",
  danger:
    "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-[0.98] shadow-2xs font-medium",
  subtle: "bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-slate-200/70 active:scale-[0.98] shadow-2xs",
};

export function Btn({
  children,
  variant = "primary",
  className,
  disabled,
  onClick,
  title,
  type = "button",
}: {
  children: ReactNode;
  variant?: keyof typeof BTN_VARIANTS;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cls(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
        BTN_VARIANTS[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Spinner / empty state ────────────────────────────────────────────────────

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600" role="status">
      <Loader2 className="size-5 animate-spin text-sky-600" aria-hidden />
      {label ?? "Working…"}
    </div>
  );
}

export function EmptyNote({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
      <div className="text-slate-400">{icon}</div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

// ── Small bits ───────────────────────────────────────────────────────────────

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cls("font-heading text-[12px] text-slate-700 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/60 font-medium", className)}>{children}</code>;
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cls(
        "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-heading text-[11px] font-medium text-slate-600 shadow-2xs",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-xs"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
