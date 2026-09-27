import { CircleCheck, GitBranch, RotateCcw, TriangleAlert } from "lucide-react";
import type { Plan } from "../lib/types";
import { Btn, Card, Chip, EmptyNote, Spinner } from "./ui";
import { cls } from "../lib/utils";

export function PlanPanel({
  plan,
  running,
  onApprove,
}: {
  plan: Plan | null;
  running: boolean;
  onApprove: () => void;
}) {
  if (!plan) {
    return (
      <Card title="Change plan" icon={<GitBranch className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<GitBranch className="size-7 text-slate-400" aria-hidden />}
          title="No plan yet"
          body="The plan is generated from the intent, impact and risk — step by step, with files touched, tests affected and a rollback path."
        />
      </Card>
    );
  }

  return (
    <Card title="Change plan" icon={<GitBranch className="size-5 text-sky-600" aria-hidden />}>
      <h4 className="font-heading text-sm font-bold text-slate-900">{plan.title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{plan.summary}</p>

      <ol className="mt-4 space-y-3">
        {plan.steps.map((st) => (
          <li key={st.order} className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-3.5 shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-sky-300 bg-sky-50 font-heading text-[11px] font-bold text-sky-800 shadow-2xs">
                {st.order}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{st.title}</span>
                  {st.risky && (
                    <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 shadow-2xs">
                      <TriangleAlert className="size-3.5 text-amber-600" aria-hidden /> risky
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{st.detail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {st.files.map((f) => (
                    <Chip key={f} className="border-sky-200 bg-sky-50 text-sky-800 font-medium">
                      {f}
                    </Chip>
                  ))}
                  {st.tests.map((t) => (
                    <Chip key={t} className="border-emerald-200 bg-emerald-50 text-emerald-800 font-medium">
                      test: {t}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <RotateCcw className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <span>
            <strong className="font-semibold text-slate-800">Rollback path:</strong> {plan.rollback}
          </span>
        </p>
      </div>

      <div className={cls("mt-5 flex items-center gap-3 border-t border-slate-100 pt-4")}>
        <Btn onClick={onApprove} disabled={running} title="Snapshot the base, create a branch, apply the fix and verify" className="px-5 py-2.5 shadow-xs font-semibold">
          <CircleCheck className="size-4.5" aria-hidden />
          Approve & apply to working copy
        </Btn>
        {running && <Spinner label="Snapshotting & verifying…" />}
        <span className="ml-auto hidden sm:inline text-[11px] font-medium text-slate-500">Nothing is merged until you accept the evidence</span>
      </div>
    </Card>
  );
}
