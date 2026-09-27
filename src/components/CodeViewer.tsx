import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import { Check, Copy, X } from "lucide-react";
import { cls } from "../lib/utils";

const LANG_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  md: "markdown",
  bash: "bash",
};

export function highlightLine(text: string, ext: string): string {
  const lang = LANG_MAP[ext] ?? "typescript";
  const grammar = Prism.languages[lang];
  if (!grammar) return escapeHtml(text);
  try {
    return Prism.highlight(text || " ", grammar, lang);
  } catch {
    return escapeHtml(text);
  }
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function CodeViewer({
  path,
  source,
  onClose,
}: {
  path: string;
  source: string;
  onClose: () => void;
}) {
  const ext = path.split(".").pop() ?? "ts";
  const lines = source.split("\n");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="code-viewer-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-2 rounded-full bg-sky-500" />
            <h2 id="code-viewer-title" className="truncate font-heading text-[13px] font-bold text-slate-800">
              {path}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-ring shadow-2xs"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-500" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close code viewer"
              className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4.5" aria-hidden />
            </button>
          </div>
        </header>
        <div className="overflow-auto bg-[#0b1220] p-1">
          <table className="w-full border-collapse font-heading text-[12px] leading-relaxed">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="align-top hover:bg-white/[0.04]">
                  <td className="select-none border-r border-slate-800 px-3 text-right text-[11px] text-slate-600">
                    {i + 1}
                  </td>
                  <td className="whitespace-pre px-3 text-slate-200 font-mono">
                    <span dangerouslySetInnerHTML={{ __html: highlightLine(line, ext) }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function langOf(path: string): string {
  return path.split(".").pop() ?? "ts";
}

export { cls };
