import { GitBranch, RotateCcw } from "lucide-react";
import { Btn, Chip } from "./ui";

export function RollbackBar({
  branchName,
  patchCount,
  onRollback,
}: {
  branchName: string | null;
  patchCount: number;
  onRollback: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200/90 bg-amber-50/70 px-4 py-3 shadow-xs">
      <span className="flex items-center gap-2 text-xs font-medium text-amber-900">
        <GitBranch className="size-4 text-amber-700 shrink-0" aria-hidden />
        Working branch <strong className="font-semibold text-amber-950 font-heading">{branchName ?? "…"}</strong> — {patchCount} patch(es) applied. Nothing is merged yet.
      </span>
      <div className="ml-auto flex items-center gap-2.5">
        <Chip className="border-amber-200 bg-amber-100/80 text-amber-800 font-semibold shadow-2xs">isolated</Chip>
        <Btn variant="danger" onClick={onRollback} title="Discard the branch and restore the base snapshot" className="px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
          <RotateCcw className="size-3.5" aria-hidden />
          Rollback change
        </Btn>
      </div>
    </div>
  );
}
