import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { RiskResult } from "../lib/types";
import { Card, EmptyNote, SeverityBadge } from "./ui";
import { cls } from "../lib/utils";

export function RiskPanel({ risk }: { risk: RiskResult | null }) {
  if (!risk) {
    return (
      <Card title="Risk assessment" icon={<ShieldAlert className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<ShieldAlert className="size-7 text-slate-400" aria-hidden />}
          title="Risk not yet estimated"
          body="Risk is estimated from the change surface: authorization code, known findings, affected tests, API surface, data models and coupling."
        />
      </Card>
    );
  }

  const tone =
    risk.level === "LOW"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : risk.level === "MEDIUM"
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : risk.level === "HIGH"
          ? "bg-orange-50 border-orange-200 text-orange-800"
          : "bg-red-50 border-red-200 text-red-800";

  return (
    <Card
      title="Risk assessment"
      icon={<ShieldAlert className="size-5 text-sky-600" aria-hidden />}
      right={
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <ShieldCheck className="size-4 text-slate-400" aria-hidden /> heuristic estimate
        </span>
      }
    >
      <div className={cls("rounded-xl border p-3.5 shadow-2xs", tone)}>
        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-bold tracking-tight">{risk.level} RISK</span>
          <span className="font-heading text-sm font-semibold">{risk.score}/100</span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className={cls(
              "h-full rounded-full transition-all duration-700",
              risk.level === "LOW" ? "bg-emerald-500" : risk.level === "MEDIUM" ? "bg-amber-500" : risk.level === "HIGH" ? "bg-orange-500" : "bg-red-500"
            )}
            style={{ width: `${risk.score}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {risk.factors.map((f) => (
          <li key={f.label} className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">{f.label}</span>
              <SeverityBadge level={f.score >= 20 ? "HIGH" : f.score >= 10 ? "MEDIUM" : "LOW"} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{f.detail}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-600">
        {risk.summary}
      </p>
    </Card>
  );
}
