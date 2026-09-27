import { History } from "lucide-react";
import type { HistoryEntry } from "../lib/types";
import { Card, EmptyNote, StatusPill } from "./ui";
import { timeAgo } from "../lib/utils";

const STATUS: Record<string, "ok" | "warn" | "fail"> = {
  analysed: "ok",
  applied: "ok",
  rolled_back: "warn",
};

const VERDICT: Record<string, "ok" | "warn" | "fail"> = {
  SAFE: "ok",
  ATTENTION: "warn",
  REJECTED: "fail",
};

export function HistoryPanel({ history, saved }: { history: HistoryEntry[]; saved: boolean }) {
  return (
    <Card title="Run history" icon={<History className="size-5 text-sky-600" aria-hidden />}>
      {history.length === 0 ? (
        <EmptyNote
          icon={<History className="size-7 text-slate-400" aria-hidden />}
          title={saved ? "No runs recorded yet" : "History persistence is unavailable"}
          body={
            saved
              ? "Analyze a request and its evidence report is archived here (Supabase), so you can look back at past verdicts."
              : "Supabase isn't reachable right now, so history can't be saved. The pipeline itself still runs fully in the browser."
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {history.map((h) => (
            <li key={h.id} className="flex items-center gap-3 py-2.5 px-1.5 rounded-lg transition-colors hover:bg-slate-50/70">
              <span className="font-heading text-[11px] text-slate-400">{timeAgo(h.created_at)}</span>
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{h.request}</span>
              {h.verdict && <StatusPill status={VERDICT[h.verdict] ?? "pending"} />}
              <StatusPill status={STATUS[h.status] ?? "pending"} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
