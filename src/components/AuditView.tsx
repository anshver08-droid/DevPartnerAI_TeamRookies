import {
  CheckCircle2,
  FileCheck,
  GitBranch,
  History,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import type { HistoryEntry } from "../lib/types";
import { Btn, Card, Chip, EmptyNote, Mono, StatusPill } from "./ui";
import { timeAgo } from "../lib/utils";

interface AuditViewProps {
  history: HistoryEntry[];
  onSelectRun?: (h: HistoryEntry) => void;
  onLaunchStudio: () => void;
  onRunRequest: (req: string) => void;
}

const VERDICT_STYLES: Record<string, { badge: string; icon: typeof ShieldCheck }> = {
  SAFE: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: ShieldCheck,
  },
  ATTENTION: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: TriangleAlert,
  },
  REJECTED: {
    badge: "border-red-200 bg-red-50 text-red-800",
    icon: ShieldAlert,
  },
};

export function AuditView({
  history,
  onLaunchStudio,
  onRunRequest,
}: AuditViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-4">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Audit Passports & Run History
            </h2>
            <Chip className="border-sky-200 bg-sky-50 text-sky-800">
              {history.length} {history.length === 1 ? "Audit" : "Audits"} Recorded
            </Chip>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-sans leading-relaxed">
            Every verification execution generates a cryptographically traceable Passport record, detailing intent, invariant compliance, blast radius, and mutation kill rates.
          </p>
        </div>

        <Btn
          variant="primary"
          onClick={onLaunchStudio}
          className="text-xs font-semibold px-4 py-2 shrink-0 bg-slate-900 text-white"
        >
          <Terminal className="size-3.5 text-sky-400" strokeWidth={1.75} />
          <span>New Studio Run</span>
        </Btn>
      </div>

      {/* Audit Passports List */}
      {history.length === 0 ? (
        <Card>
          <EmptyNote
            icon={<History className="size-8 text-slate-400" strokeWidth={1.75} />}
            title="No audit passports recorded yet"
            body="Run an analysis in the Studio Workspace to generate your first verified Code Passport with cryptographic audit evidence."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry, idx) => {
            const verdictInfo = entry.verdict ? VERDICT_STYLES[entry.verdict] : null;
            const VerdictIcon = verdictInfo?.icon || ShieldCheck;
            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:shadow-sm"
              >
                {/* Passport Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
                      <FileCheck className="size-3.5 text-sky-400" strokeWidth={1.75} />
                    </span>
                    <span className="font-heading text-xs font-bold text-slate-900">
                      Passport #{history.length - idx}
                    </span>
                    <Mono className="text-[11px] text-slate-500">{entry.id}</Mono>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-heading text-[11px] text-slate-400">
                      {timeAgo(entry.created_at)}
                    </span>
                    {entry.verdict && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider ${
                          verdictInfo?.badge ?? "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        <VerdictIcon className="size-3" strokeWidth={1.75} />
                        {entry.verdict}
                      </span>
                    )}
                    <StatusPill
                      status={
                        entry.status === "applied" || entry.status === "analysed"
                          ? "ok"
                          : entry.status === "rolled_back"
                            ? "warn"
                            : "pending"
                      }
                    />
                  </div>
                </div>

                {/* Passport Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Change Request Prompt
                    </p>
                    <p className="font-sans text-sm font-semibold text-slate-800 leading-snug">
                      {entry.request}
                    </p>
                  </div>

                  {/* Quick Passport Details */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-heading text-[11px]">
                      <span className="flex items-center gap-1">
                        <GitBranch className="size-3 text-sky-600" strokeWidth={1.75} />
                        isolated working branch
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-600" strokeWidth={1.75} />
                        invariants verified
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onRunRequest(entry.request);
                        onLaunchStudio();
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                    >
                      <RotateCcw className="size-3 text-slate-400" strokeWidth={1.75} />
                      <span>Re-run in Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
