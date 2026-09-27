import { Check, CircleX, FlaskConical, TestTubeDiagonal } from "lucide-react";
import type { MutationOutcome, VerificationResult } from "../lib/types";
import { Card, EmptyNote, Mono } from "./ui";
import { cls } from "../lib/utils";

function SuiteTable({ suite, empty }: { suite: VerificationResult; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[500px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500">
            <th className="py-2 px-3 font-semibold">Test</th>
            <th className="py-2 px-3 font-semibold">Category</th>
            <th className="py-2 px-3 text-right font-semibold">Duration</th>
            <th className="py-2 px-3 text-right font-semibold">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suite.results.map((r) => (
            <tr key={r.name} className="transition-colors hover:bg-slate-50/70">
              <td className="py-2 px-3 font-medium text-slate-800">{r.name}</td>
              <td className="py-2 px-3 text-slate-500">{r.category}</td>
              <td className="py-2 px-3 text-right font-heading text-[11px] text-slate-500">{r.durationMs}ms</td>
              <td className="py-2 px-3 text-right">
                {r.passed ? (
                  <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs">
                    <Check className="size-3.5" aria-hidden /> PASS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 shadow-2xs" title={r.detail}>
                    <CircleX className="size-3.5" aria-hidden /> FAIL
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        {suite.results.length === 0 && (
          <tbody>
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">
                {empty}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}

export function VerificationPanel({
  verification,
  baseline,
  propertyResults,
  mutation,
}: {
  verification: VerificationResult | null;
  baseline: VerificationResult | null;
  propertyResults: VerificationResult | null;
  mutation: MutationOutcome | null;
}) {
  if (!verification) {
    return (
      <Card title="Verification" icon={<TestTubeDiagonal className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<TestTubeDiagonal className="size-7 text-slate-400" aria-hidden />}
          title="Nothing verified yet"
          body="After approval, the working branch runs the full suite, property checks, mutation testing and the adversarial counterexample hunt."
        />
      </Card>
    );
  }

  return (
    <Card
      title="Verification"
      icon={<TestTubeDiagonal className="size-5 text-sky-600" aria-hidden />}
      right={
        <Mono className="text-slate-500 font-medium">
          baseline {baseline ? `${baseline.passed}/${baseline.results.length}` : "—"} → branch {verification.passed}/{verification.results.length}
        </Mono>
      }
    >
      <div
        className={cls(
          "mb-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xs",
          verification.failed === 0
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-900"
        )}
      >
        {verification.failed === 0 ? <Check className="size-5 shrink-0 text-emerald-600" aria-hidden /> : <CircleX className="size-5 shrink-0 text-red-600" aria-hidden />}
        <span>
          {verification.failed === 0
            ? `All ${verification.results.length} tests pass on the working branch in ${verification.durationMs}ms.`
            : `${verification.failed} test(s) fail on the working branch — review before accepting.`}
        </span>
      </div>

      <SuiteTable suite={verification} empty="Suite is empty" />

      {propertyResults && (
        <div className="mt-5">
          <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <FlaskConical className="size-4 text-sky-600" aria-hidden /> Property & contract checks
          </h4>
          <SuiteTable suite={propertyResults} empty="No property checks" />
        </div>
      )}

      {mutation && (
        <div className="mt-5">
          <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <FlaskConical className="size-4 text-sky-600" aria-hidden /> Mutation testing — {mutation.label}
          </h4>
          <div className="space-y-2">
            {mutation.mutations.map((m, i) => (
              <div
                key={i}
                className={cls(
                  "flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed shadow-2xs",
                  m.survived ? "border-amber-200 bg-amber-50/60 text-amber-900" : "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                )}
              >
                <span className={cls("rounded px-2 py-0.5 font-heading text-[10px] font-bold border shadow-2xs", m.survived ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-emerald-100 border-emerald-300 text-emerald-800")}>
                  {m.survived ? "SURVIVED" : "KILLED"}
                </span>
                <span className="font-medium">{m.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
