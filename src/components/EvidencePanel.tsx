import { useState } from "react";
import {
  CircleCheck,
  CircleX,
  ChevronDown,
  ChevronRight,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { EvidenceReport } from "../lib/types";
import { Btn, Card, Chip, EmptyNote, Spinner, StatusPill } from "./ui";
import { cls } from "../lib/utils";

export function EvidencePanel({
  evidence,
  running,
  branchName,
  onAccept,
  onRollback,
}: {
  evidence: EvidenceReport | null;
  running: boolean;
  branchName: string | null;
  onAccept: () => void;
  onRollback: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [accepted, setAccepted] = useState(false);

  if (!evidence) {
    return (
      <Card title="Evidence report" icon={<ShieldCheck className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<ShieldCheck className="size-7 text-slate-400" aria-hidden />}
          title="No evidence report yet"
          body="Once verification finishes, every stage — intent, invariants, impact, risk, diff, tests, mutation, counterexamples — is consolidated into an auditable report."
        />
      </Card>
    );
  }

  if (running) {
    return (
      <Card title="Evidence report" icon={<ShieldCheck className="size-5 text-sky-600" aria-hidden />}>
        <Spinner label="Assembling the evidence report…" />
      </Card>
    );
  }

  const banner =
    evidence.verdict === "SAFE"
      ? { cls: "border-emerald-200 bg-emerald-50 text-emerald-950", icon: <ShieldCheck className="size-6 text-emerald-600" aria-hidden /> }
      : evidence.verdict === "ATTENTION"
        ? { cls: "border-amber-200 bg-amber-50 text-amber-950", icon: <TriangleAlert className="size-6 text-amber-600" aria-hidden /> }
        : { cls: "border-red-200 bg-red-50 text-red-950", icon: <CircleX className="size-6 text-red-600" aria-hidden /> };

  const pass = evidence.sections.filter((s) => s.status === "ok").length;

  return (
    <Card
      title="Evidence report"
      icon={<ShieldCheck className="size-5 text-sky-600" aria-hidden />}
      right={
        <div className="flex items-center gap-2">
          {branchName && (
            <Chip className="border-sky-200 bg-sky-50 text-sky-800 font-semibold">
              <GitBranch className="mr-1 inline size-3.5 text-sky-600" aria-hidden /> {branchName}
            </Chip>
          )}
          <StatusPill status={evidence.verdict === "SAFE" ? "ok" : evidence.verdict === "ATTENTION" ? "warn" : "fail"} />
        </div>
      }
    >
      <div className={cls("rounded-xl border p-4 shadow-2xs", banner.cls)}>
        <div className="flex items-center gap-3.5">
          {banner.icon}
          <div>
            <h4 className="font-heading text-lg font-bold tracking-tight">VERDICT: {evidence.verdict}</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{evidence.verdictSummary}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-500">
        Run {evidence.runId} · {new Date(evidence.timestamp).toLocaleString()} · {pass}/{evidence.sections.length} stages passed
      </p>

      <div className="mt-3.5 space-y-2">
        {evidence.sections.map((sec) => {
          const isOpen = open[sec.title] ?? false;
          return (
            <div key={sec.title} className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <button
                onClick={() => setOpen((o) => ({ ...o, [sec.title]: !o[sec.title] }))}
                className="flex w-full cursor-pointer items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-slate-100/70 focus-visible:outline-2 focus-visible:outline-ring"
                aria-expanded={isOpen}
              >
                {isOpen ? <ChevronDown className="size-4 text-slate-500" aria-hidden /> : <ChevronRight className="size-4 text-slate-500" aria-hidden />}
                <span className="text-sm font-semibold text-slate-900">{sec.title}</span>
                <span className="ml-auto flex items-center gap-2.5">
                  <span className="hidden text-[11px] font-medium text-slate-500 sm:inline">{sec.summary}</span>
                  <StatusPill status={sec.status} />
                </span>
              </button>
              {isOpen && (
                <div className="bg-slate-50/40 px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-600 sm:hidden">{sec.summary}</p>
                  <ul className="mt-1 space-y-1.5">
                    {sec.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {evidence.artifacts.map((a) => (
          <Chip key={a} className="border-slate-200 bg-slate-100/80 text-slate-700">{a}</Chip>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        {accepted ? (
          <div className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-900 shadow-xs check-pop">
            <CircleCheck className="size-6 shrink-0 text-emerald-600" aria-hidden />
            <span className="text-sm font-medium">
              Change accepted and left in place on the working branch. Rollback remains available if you change your mind.
            </span>
          </div>
        ) : (
          <>
            <Btn
              onClick={() => { setAccepted(true); onAccept(); }}
              disabled={evidence.verdict === "REJECTED"}
              title={evidence.verdict === "REJECTED" ? "Verdict is REJECTED — resolve counterexamples first" : "Keep the change on the working branch"}
              className="px-5 py-2.5 shadow-xs font-semibold"
            >
              <CircleCheck className="size-4.5" aria-hidden />
              Accept & keep change
            </Btn>
            <Btn
              variant="danger"
              onClick={onRollback}
              title="Discard the branch and restore the base snapshot"
              className="px-4 py-2.5 shadow-xs font-semibold"
            >
              <RotateCcw className="size-4.5" aria-hidden />
              Rollback to base
            </Btn>
            {evidence.verdict === "REJECTED" && (
              <span className="text-[12px] font-medium text-red-700">Verdict REJECTED — resolve the remaining counterexamples before accepting.</span>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
