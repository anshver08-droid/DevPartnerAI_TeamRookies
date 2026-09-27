import {
  Activity,
  Bug,
  CircleCheck,
  FileSearch,
  FlaskConical,
  GitBranch,
  GitCompareArrows,
  ListChecks,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Target,
  TestTubeDiagonal,
  UserRound,
} from "lucide-react";
import type { StageId, Status } from "../lib/types";
import { cls } from "../lib/utils";

export interface RailItem {
  id: StageId;
  label: string;
  icon: typeof Activity;
}

export const RAIL: RailItem[] = [
  { id: "project", label: "Project scan", icon: FileSearch },
  { id: "request", label: "Change request", icon: UserRound },
  { id: "intent", label: "Intent", icon: Target },
  { id: "invariants", label: "Invariants", icon: ListChecks },
  { id: "impact", label: "Impact", icon: Activity },
  { id: "risk", label: "Risk", icon: ShieldAlert },
  { id: "plan", label: "Plan", icon: GitBranch },
  { id: "approval", label: "Approval", icon: CircleCheck },
  { id: "snapshot", label: "Snapshot", icon: GitCompareArrows },
  { id: "verification", label: "Verify", icon: TestTubeDiagonal },
  { id: "counterexamples", label: "Counterexamples", icon: Bug },
  { id: "fix", label: "Fix loop", icon: FlaskConical },
  { id: "evidence", label: "Evidence", icon: ShieldCheck },
  { id: "rollback", label: "Rollback", icon: RotateCcw },
];

export function stageStatus(state: {
  stage: StageId;
  status: Status;
  approved: boolean;
  applying: boolean;
}): (item: RailItem) => { state: "done" | "active" | "pending" } {
  const order = RAIL.map((r) => r.id);
  const idx = order.indexOf(state.stage);
  return (item) => {
    const i = order.indexOf(item.id);
    if (i < idx) return { state: "done" };
    if (i === idx) return { state: "active" };
    return { state: "pending" };
  };
}

export function StageRail({
  state,
}: {
  state: { stage: StageId; status: Status; approved: boolean; applying: boolean; externalVerification: boolean };
}) {
  const statusOf = stageStatus(state);
  return (
    <nav
      aria-label="Pipeline stages"
      className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs"
    >
      {RAIL.map((item) => {
        const s = statusOf(item);
        const Icon = item.icon;
        return (
          <span
            key={item.id}
            className={cls(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
              s.state === "active" && "border-sky-300 bg-sky-50 text-sky-800 shadow-2xs font-semibold ring-1 ring-sky-200/80",
              s.state === "done" && "border-emerald-200 bg-emerald-50/80 text-emerald-800 font-medium",
              s.state === "pending" && "border-slate-100 bg-slate-50/60 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
            )}
            title={item.label}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </span>
        );
      })}
      {state.externalVerification ? (
        <span className="ml-auto hidden items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 shadow-2xs lg:inline-flex">
          <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden /> watsonx
        </span>
      ) : (
        <span className="ml-auto hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-2xs lg:inline-flex">
          <SquareTerminal className="size-3.5" strokeWidth={1.75} aria-hidden /> fallback engine
        </span>
      )}
    </nav>
  );
}
