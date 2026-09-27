import { useState } from "react";
import { ChevronDown, ChevronRight, FileDiff } from "lucide-react";
import type { DiffResult } from "../lib/types";
import { Card, EmptyNote, Mono } from "./ui";
import { highlightLine, langOf } from "./CodeViewer";
import { cls } from "../lib/utils";

export function DiffViewer({ diff }: { diff: DiffResult | null }) {
  if (!diff || diff.files.length === 0) {
    return (
      <Card title="Change diff" icon={<FileDiff className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<FileDiff className="size-7 text-slate-400" aria-hidden />}
          title="No diff yet"
          body="Once a change is applied to the working branch, the base snapshot is diffed line-by-line against it and shown here."
        />
      </Card>
    );
  }

  const [open, setOpen] = useState<Record<string, boolean>>({ [diff.files[0]?.file ?? ""]: true });

  return (
    <Card
      title="Change diff"
      icon={<FileDiff className="size-5 text-sky-600" aria-hidden />}
      right={
        <span className="font-heading text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          +{diff.added} / −{diff.removed} across {diff.files.length} file(s)
        </span>
      }
    >
      <div className="space-y-3">
        {diff.files.map((f) => {
          const isOpen = open[f.file] ?? false;
          return (
            <div key={f.file} className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <button
                onClick={() => setOpen((o) => ({ ...o, [f.file]: !o[f.file] }))}
                className="flex w-full cursor-pointer items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-slate-100/70 focus-visible:outline-2 focus-visible:outline-ring"
                aria-expanded={isOpen}
              >
                {isOpen ? <ChevronDown className="size-4 text-slate-500" aria-hidden /> : <ChevronRight className="size-4 text-slate-500" aria-hidden />}
                <Mono className="text-slate-800 font-bold">{f.file}</Mono>
                <div className="ml-auto flex items-center gap-2">
                  <span className="font-heading text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+{f.added}</span>
                  <span className="font-heading text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">−{f.removed}</span>
                </div>
              </button>
              {isOpen && (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full border-collapse font-heading text-[11px] leading-relaxed">
                    <tbody>
                      {f.lines.map((ln, i) => (
                        <tr
                          key={i}
                          className={cls(
                            ln.type === "add" && "bg-emerald-50/90",
                            ln.type === "remove" && "bg-red-50/90"
                          )}
                        >
                          <td className="w-10 select-none border-r border-slate-200/70 bg-slate-50/60 px-2 text-right text-[10px] text-slate-400">
                            {ln.type === "remove" ? ln.oldLine : ""}
                          </td>
                          <td className="w-10 select-none border-r border-slate-200/70 bg-slate-50/60 px-2 text-right text-[10px] text-slate-400">
                            {ln.type === "add" ? ln.newLine : ""}
                          </td>
                          <td
                            className={cls(
                              "whitespace-pre px-3 py-0.5 font-mono",
                              ln.type === "add" && "text-emerald-950 font-medium",
                              ln.type === "remove" && "text-red-950 font-medium",
                              ln.type === "context" && "text-slate-600"
                            )}
                          >
                            <span className={cls("mr-2 select-none font-bold", ln.type === "add" ? "text-emerald-700" : ln.type === "remove" ? "text-red-700" : "text-slate-400")}>
                              {ln.type === "add" ? "+" : ln.type === "remove" ? "−" : " "}
                            </span>
                            {ln.type === "add" ? (
                              <span dangerouslySetInnerHTML={{ __html: highlightLine(ln.text, langOf(f.file)) }} />
                            ) : (
                              ln.text || " "
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
