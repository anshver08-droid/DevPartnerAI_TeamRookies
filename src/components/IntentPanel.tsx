import { CircleCheck, Lock, Sparkles, Target } from "lucide-react";
import type { Intent } from "../lib/types";
import { Card, Chip, EmptyNote } from "./ui";

export function IntentPanel({ intent }: { intent: Intent | null }) {
  if (!intent) {
    return (
      <Card title="Intent" icon={<Target className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<Target className="size-7 text-slate-400" aria-hidden />}
          title="No intent extracted yet"
          body="Submit a change request and DevPartner AI will extract the feature intent, requirements, constraints and invariants before anything is touched."
        />
      </Card>
    );
  }

  const conf = Math.round(intent.confidence * 100);
  const list = (items: Array<{ slug: string; label: string }>, icon: React.ReactNode, tone: string) => (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.slug} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700">
          <span className={`mt-0.5 shrink-0 ${tone}`}>{icon}</span>
          <span className="font-medium">{it.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Card
      title="Intent"
      icon={<Target className="size-5 text-sky-600" aria-hidden />}
      right={
        <div className="flex items-center gap-2">
          <Chip className={intent.source === "ai" ? "border-violet-200 bg-violet-50 text-violet-700 font-semibold" : "border-slate-200 bg-slate-100 text-slate-600 font-medium"}>
            {intent.source === "ai" ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-violet-600" aria-hidden /> AI (watsonx)
              </span>
            ) : (
              "deterministic fallback"
            )}
          </Chip>
        </div>
      }
    >
      <div className={intent.source === "ai" ? "ai-glow rounded-xl p-3.5 border border-violet-200/60" : "rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5"}>
        <h4 className="font-heading text-sm font-bold text-slate-900">{intent.feature}</h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{intent.summary}</p>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <span>Extraction confidence</span>
          <span className="font-bold text-slate-700">{conf}% · estimate</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${conf}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3">
          <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">Requirements</h5>
          {list(intent.requirements, <CircleCheck className="size-4" aria-hidden />, "text-emerald-600")}
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3">
          <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-800">Constraints</h5>
          {list(intent.constraints, <Lock className="size-4" aria-hidden />, "text-amber-600")}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Affected areas:</span>
        {intent.affectedAreas.length === 0 && <Chip>unscoped</Chip>}
        {intent.affectedAreas.map((a) => (
          <Chip key={a} className="border-sky-200 bg-sky-50 text-sky-800 font-medium">
            {a}
          </Chip>
        ))}
      </div>
    </Card>
  );
}
