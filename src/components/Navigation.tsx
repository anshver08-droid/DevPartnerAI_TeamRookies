import {
  BookOpen,
  Code2,
  ExternalLink,
  GitBranch,
  LayoutGrid,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Terminal,
} from "lucide-react";
import { Btn } from "./ui";
import { cls } from "../lib/utils";

export type NavTab = "overview" | "workspace" | "audits" | "docs";

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  status: "checking" | "online" | "offline";
  modelConfigured: boolean;
  reason: string | null;
  running: boolean;
  onNewRun: () => void;
}

export function Navigation({
  activeTab,
  onSelectTab,
  status,
  modelConfigured,
  reason,
  running,
  onNewRun,
}: NavigationProps) {
  const tabs: Array<{ id: NavTab; label: string; icon: typeof LayoutGrid }> = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "workspace", label: "Workspace", icon: Terminal },
    { id: "audits", label: "Audits & History", icon: ShieldCheck },
    { id: "docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-[1440px] px-4 transition-all">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/85 px-4 py-2.5 backdrop-blur-md shadow-xs">
        {/* Left: Brand + Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab("overview")}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-ring rounded-lg p-0.5"
            title="DevPartner AI Home"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
              <Code2 className="size-5 text-sky-400" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold tracking-tight text-slate-900">
                  DevPartner<span className="text-sky-600"> AI</span>
                </span>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.2 font-heading text-[10px] font-semibold text-slate-600">
                  v2.0
                </span>
              </div>
              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Developer Verification Agent
              </p>
            </div>
          </button>
        </div>

        {/* Center: Pedigree-style rounded pill tabs */}
        <nav
          aria-label="Navigation tabs"
          className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 shadow-2xs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={cls(
                  "relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 font-heading text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ring",
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <Icon className={cls("size-4", isActive ? "text-sky-600" : "text-slate-400")} strokeWidth={1.75} aria-hidden />
                <span>{tab.label}</span>
                {tab.id === "workspace" && running && (
                  <span className="size-1.5 rounded-full bg-sky-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Status badge & Actions */}
        <div className="flex items-center gap-2">
          {/* Status badge */}
          {status === "checking" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-2xs">
              <span className="soft-pulse size-1.5 rounded-full bg-slate-400" />
              checking ai-engine…
            </span>
          )}
          {status === "online" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              ai-engine online
              {modelConfigured ? (
                <span className="inline-flex items-center gap-1 border-l border-emerald-200 pl-2 text-violet-700">
                  <Sparkles className="size-3 text-violet-600" strokeWidth={1.75} /> watsonx ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 border-l border-emerald-200 pl-2 text-slate-500">
                  <SquareTerminal className="size-3" strokeWidth={1.75} /> fallbacks
                </span>
              )}
            </span>
          )}
          {status === "offline" && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 shadow-2xs"
              title={reason ?? "ai-engine unreachable"}
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              fallbacks active
            </span>
          )}

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/Akash9250/Dev-Partner-Antigravity"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="View source on GitHub"
          >
            <GitBranch className="size-3.5 text-slate-500" strokeWidth={1.75} />
            <span>GitHub</span>
            <ExternalLink className="size-3 text-slate-400" strokeWidth={1.75} />
          </a>

          {/* Primary Action Button */}
          {activeTab === "workspace" ? (
            <Btn
              variant="ghost"
              onClick={onNewRun}
              title="Reset analysis session; history is preserved"
              className="text-xs font-semibold px-3 py-1.5"
            >
              <RotateCcw className="size-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
              <span>New run</span>
            </Btn>
          ) : (
            <Btn
              variant="primary"
              onClick={() => onSelectTab("workspace")}
              title="Enter developer workspace"
              className="text-xs font-semibold px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
            >
              <Terminal className="size-3.5 text-sky-400" strokeWidth={1.75} aria-hidden />
              <span>Launch Studio</span>
            </Btn>
          )}
        </div>
      </div>

      {/* Mobile pill bar for switching tabs */}
      <div className="mt-2 flex md:hidden items-center justify-center gap-1 rounded-xl border border-slate-200/80 bg-white/90 p-1 shadow-2xs backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cls(
                "flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-heading text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

// ── In-App Dock for Rapid Switching ──────────────────────────────────────────
export function AppDock({
  activeTab,
  onSelectTab,
  onNewRun,
  running,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewRun: () => void;
  running: boolean;
}) {
  const dockItems: Array<{ id: NavTab; label: string; icon: typeof LayoutGrid }> = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "workspace", label: "Workspace Studio", icon: Terminal },
    { id: "audits", label: "Audit Reports", icon: ShieldCheck },
    { id: "docs", label: "Architecture Docs", icon: BookOpen },
  ];

  return (
    <aside
      aria-label="Navigation dock"
      className="hidden 2xl:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-2 backdrop-blur-md shadow-sm transition-all"
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
        <Code2 className="size-4.5 text-sky-400" strokeWidth={1.75} />
      </div>
      <div className="h-px w-6 bg-slate-200 my-1" />
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            title={item.label}
            className={cls(
              "relative flex size-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ring",
              isActive
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className={cls("size-4.5", isActive ? "text-sky-400" : "")} strokeWidth={1.75} />
            {item.id === "workspace" && running && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-sky-500 animate-ping" />
            )}
          </button>
        );
      })}
      <div className="h-px w-6 bg-slate-200 my-1" />
      <button
        onClick={onNewRun}
        title="Start Fresh Run"
        className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <RotateCcw className="size-4.5" strokeWidth={1.75} />
      </button>
    </aside>
  );
}
