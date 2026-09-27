import { Activity } from "lucide-react";
import type { ImpactResult } from "../lib/types";
import { Card, EmptyNote } from "./ui";

const KIND_COLOR: Record<string, string> = {
  file: "#475569",
  function: "#0284c7",
  api: "#d97706",
  model: "#7c3aed",
  test: "#059669",
};

const KIND_LABEL: Record<string, string> = {
  file: "file",
  function: "function",
  api: "route",
  model: "model",
  test: "test",
};

export function ImpactMap({ impact }: { impact: ImpactResult | null }) {
  if (!impact) {
    return (
      <Card title="Impact analysis" icon={<Activity className="size-5 text-sky-600" aria-hidden />}>
        <EmptyNote
          icon={<Activity className="size-7 text-slate-400" aria-hidden />}
          title="No impact computed yet"
          body="After the intent is fixed, the dependency graph is walked from the files the change touches — direct (1), indirect (2) and possible (3) reach."
        />
      </Card>
    );
  }

  const maxDepth = impact.maxDepth;
  const colWidth = 230;
  const rowH = 34;
  const byDepth: Record<number, typeof impact.nodes> = { 1: [], 2: [], 3: [] };
  for (const n of impact.nodes) {
    const d = Math.min(3, n.depth);
    (byDepth[d] ??= []).push(n);
  }

  const W = maxDepth * colWidth + 40;
  const H = Math.max(1, ...Object.values(byDepth).map((arr) => arr.length)) * rowH + 60;

  const pos = (n: (typeof impact.nodes)[number]): { x: number; y: number } => {
    const col = Math.min(3, n.depth) - 1;
    const arr = byDepth[Math.min(3, n.depth)] ?? [];
    const idx = arr.indexOf(n);
    return { x: 20 + col * colWidth, y: 26 + idx * rowH };
  };

  return (
    <Card
      title="Impact analysis"
      icon={<Activity className="size-5 text-sky-600" aria-hidden />}
      right={<span className="text-[11px] font-medium text-slate-500">blast radius · estimate</span>}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="Impact graph by reach depth">
          {/* depth headers */}
          {[1, 2, 3].map((d) => (
            <text
              key={d}
              x={20 + (d - 1) * colWidth + 4}
              y={16}
              className="fill-slate-500 font-semibold"
              fontSize="11"
              fontFamily="Fira Code, monospace"
            >
              depth {d} · {d === 1 ? "direct" : d === 2 ? "indirect" : "possible"}
            </text>
          ))}

          {/* edges */}
          {impact.nodes.map((n) => {
            const p = pos(n);
            if (n.depth <= 1) return null;
            const parent = impact.nodes.find((x) => x.kind === "file" && x.depth === 1);
            const px = parent ? 20 : p.x - colWidth;
            const py = parent ? pos(parent).y : p.y;
            return (
              <path
                key={`e-${n.id}`}
                d={`M ${px + 130} ${py + 10} C ${px + 210} ${py + 10}, ${p.x - 20} ${p.y + 10}, ${p.x - 6} ${p.y + 10}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray={n.depth === 3 ? "3 3" : undefined}
              />
            );
          })}

          {/* nodes */}
          {impact.nodes.map((n) => {
            const p = pos(n);
            const fill = KIND_COLOR[n.kind] ?? "#475569";
            const w = Math.min(colWidth - 40, 30 + n.label.length * 7.5);
            return (
              <g key={n.id}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={w}
                  height={22}
                  rx={6}
                  fill={fill}
                  fillOpacity={n.depth === 1 ? 0.95 : n.depth === 2 ? 0.75 : 0.45}
                  stroke={fill}
                  strokeOpacity={0.9}
                  strokeWidth={1}
                />
                <title>{`${n.label} (${KIND_LABEL[n.kind]}) — ${n.reason}`}</title>
                <text
                  x={p.x + 8}
                  y={p.y + 15}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Fira Code, monospace"
                  className={n.depth === 3 ? "fill-slate-900" : "fill-white"}
                >
                  {n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
        {Object.entries(KIND_LABEL).map(([kind, label]) => (
          <span key={kind} className="flex items-center gap-1.5 font-medium">
            <span className="size-2.5 rounded-sm shadow-2xs" style={{ background: KIND_COLOR[kind] }} />
            {label}
          </span>
        ))}
        <span className="ml-auto font-medium text-slate-500">{impact.nodes.length} node(s) reached</span>
      </div>
    </Card>
  );
}
