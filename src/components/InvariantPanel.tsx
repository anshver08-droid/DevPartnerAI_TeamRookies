import { ListChecks, ShieldAlert } from "lucide-react";
import type { Counterexample, InvariantCheck } from "../lib/types";
import { Card, EmptyNote, SeverityBadge } from "./ui";
import { cls } from "../lib/utils";

export function InvariantPanel({
  checks,
  baselineCounterexamples,
}: {
  checks: InvariantCheck[];
  baselineCounterexamples: Counterexample[];
}) {
  if (checks.length === 0) {
    return (
      <Card title="Invariants" icon={<ListChecks className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<ListChecks className="size-7 text-slate-400" aria-hidden />}
          title="Invariants not yet measured"
          body="Once a request is analyzed, the invariants it declares are probed against the current code — each one is marked HOLDS, VIOLATED or NOT MEASURED."
        />
      </Card>
    );
  }

  const crit = baselineCounterexamples.filter((c) => c.severity === "CRITICAL").length;
  const high = baselineCounterexamples.filter((c) => c.severity === "HIGH").length;

  return (
    <Card
      title="Invariants"
      icon={<ListChecks className="size-5 text-sky-600" aria-hidden />}
      right={
        baselineCounterexamples.length > 0 ? (
          <span className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 shadow-2xs">
            <ShieldAlert className="size-4 text-red-600" aria-hidden />
            baseline violated: {crit} critical · {high} high
          </span>
        ) : undefined
      }
    >
      <ul className="space-y-2.5">
        {checks.map((c) => (
          <li
            key={c.slug}
            className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-3 transition-colors duration-200 hover:bg-slate-100/50 shadow-2xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cls(
                  "rounded px-2 py-0.5 font-heading text-[10px] font-bold tracking-wider border shadow-2xs",
                  c.passed === true && "border-emerald-200 text-emerald-800 bg-emerald-50",
                  c.passed === false && "border-red-200 text-red-800 bg-red-50",
                  c.passed === null && "border-slate-200 text-slate-600 bg-slate-100"
                )}
              >
                {c.passed === true ? "HOLDS" : c.passed === false ? "VIOLATED" : "NOT MEASURED"}
              </span>
              <span className="text-sm font-semibold text-slate-900">{c.name}</span>
            </div>
            <p className={cls("mt-1.5 text-xs leading-relaxed", c.passed === false ? "font-medium text-red-700" : "text-slate-600")}>
              {c.detail}
            </p>
          </li>
        ))}
      </ul>

      {baselineCounterexamples.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/70 p-3.5 shadow-2xs">
          <p className="text-xs leading-relaxed text-red-900">
            The adversarial hunt already found <strong className="font-bold">{baselineCounterexamples.length} scenario(s)</strong> that
            violate these invariants <em>before any change</em> — see the Counterexamples panel after verification.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {baselineCounterexamples.map((c) => (
              <SeverityBadge key={c.id} level={c.severity} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
