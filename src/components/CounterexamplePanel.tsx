import { Bug } from "lucide-react";
import type { Counterexample } from "../lib/types";
import { Card, EmptyNote, Mono, SeverityBadge } from "./ui";
import { cls } from "../lib/utils";

export function CounterexamplePanel({
  baseline,
  current,
}: {
  baseline: Counterexample[];
  current: Counterexample[];
}) {
  if (baseline.length === 0) {
    return (
      <Card title="Counterexamples" icon={<Bug className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<Bug className="size-7 text-slate-400" aria-hidden />}
          title="No adversarial scenario violated an invariant"
          body="The hunter replays forged sessions, spoofed roles and boundary inputs against the live code. Nothing slipped through."
        />
      </Card>
    );
  }

  const currentIds = new Set(current.map((c) => c.id));

  return (
    <Card
      title="Counterexamples"
      icon={<Bug className="size-5 text-sky-600" aria-hidden />}
      right={
        <span className={cls("rounded-md border px-2 py-0.5 text-[11px] font-semibold shadow-2xs", current.length === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
          {current.length === 0 ? "all resolved after the change" : `${current.length} still present`}
        </span>
      }
    >
      <ul className="space-y-3">
        {baseline.map((c) => {
          const resolved = !currentIds.has(c.id);
          return (
            <li
              key={c.id}
              className={cls(
                "rounded-xl border p-3.5 transition-colors duration-200 shadow-2xs",
                resolved ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/50"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge level={c.severity} />
                <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                <span
                  className={cls(
                    "ml-auto rounded px-2 py-0.5 font-heading text-[10px] font-bold tracking-wider border shadow-2xs",
                    resolved
                      ? "border-emerald-200 text-emerald-800 bg-emerald-100"
                      : "border-red-200 text-red-800 bg-red-100"
                  )}
                >
                  {resolved ? "RESOLVED" : "STILL PRESENT"}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{c.description}</p>
              <div className="mt-2.5 grid gap-2 text-[11px] sm:grid-cols-2">
                <p className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <span className="mr-1.5 font-semibold text-slate-500">invariant:</span>
                  <span className="text-slate-800 font-medium">{c.invariant}</span>
                </p>
                <div className="space-y-1.5">
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 shadow-2xs">
                    <span className="mr-1.5 font-semibold text-emerald-700">expected:</span>
                    <Mono className="text-emerald-900 bg-white/80 border-emerald-200">{c.expected}</Mono>
                  </p>
                  <p className="rounded-lg border border-red-200 bg-red-50/70 p-2 shadow-2xs">
                    <span className="mr-1.5 font-semibold text-red-700">got:</span>
                    <Mono className="text-red-900 bg-white/80 border-red-200">{c.actual}</Mono>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
