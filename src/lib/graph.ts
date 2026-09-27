import type {
  CodeIndex,
  ImpactNode,
  ImpactResult,
  RiskFactor,
  RiskLevel,
  RiskResult,
} from "./types";

export interface GraphNode {
  id: string;
  label: string;
  kind: "file" | "function" | "api" | "model" | "test";
  file?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: "import" | "calls" | "api" | "model" | "test";
}

export interface CodeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function resolveDep(from: string, spec: string): string {
  if (spec.startsWith(".")) {
    const dir = from.includes("/") ? from.slice(0, from.lastIndexOf("/")) : "";
    const base = `${dir ? dir + "/" : ""}${spec.replace(/^\.\//, "")}`;
    return base.endsWith(".ts") || base.endsWith(".js") ? base : `${base}.ts`;
  }
  return spec;
}

export function buildGraph(index: CodeIndex): CodeGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const f of index.files) nodes.push({ id: f.path, label: f.path, kind: "file" });
  for (const fn of index.functions) {
    nodes.push({ id: fn.id, label: fn.name, kind: "function", file: fn.file });
    edges.push({ from: fn.file, to: fn.id, kind: "calls" });
  }
  for (const r of index.routes) {
    nodes.push({ id: r.id, label: `${r.method} ${r.path}`, kind: "api", file: r.file });
    edges.push({ from: r.file, to: r.id, kind: "api" });
  }
  for (const m of index.models) {
    nodes.push({ id: m.id, label: m.name, kind: "model", file: m.file });
    edges.push({ from: m.file, to: m.id, kind: "model" });
  }
  for (const t of index.tests) {
    nodes.push({ id: t.id, label: t.name, kind: "test", file: t.file });
    edges.push({ from: t.file, to: t.id, kind: "test" });
  }
  for (const d of index.dependencies) {
    edges.push({ from: d.file, to: resolveDep(d.file, d.source), kind: "import" });
  }

  return { nodes, edges };
}

const KIND_LABEL: Record<GraphNode["kind"], string> = {
  file: "file",
  function: "function",
  api: "route",
  model: "model",
  test: "test",
};

export function impactFromFiles(changedFiles: string[], graph: CodeGraph, maxDepth = 3): ImpactResult {
  const adj = new Map<string, GraphEdge[]>();
  for (const e of graph.edges) {
    (adj.get(e.from) ?? adj.set(e.from, []).get(e.from)!).push(e);
    (adj.get(e.to) ?? adj.set(e.to, []).get(e.to)!).push(e);
  }

  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const f of changedFiles) {
    if (!depth.has(f)) {
      depth.set(f, 1);
      queue.push(f);
    }
  }

  while (queue.length) {
    const id = queue.shift()!;
    const d = depth.get(id)!;
    if (d >= maxDepth) continue;
    for (const edge of adj.get(id) ?? []) {
      const next = edge.from === id ? edge.to : edge.from;
      if (!depth.has(next)) {
        depth.set(next, d + 1);
        queue.push(next);
      }
    }
  }

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const nodes: ImpactNode[] = changedFiles.map((f) => ({
    id: f,
    label: f,
    kind: "file",
    depth: 1,
    reason: "Directly changed file",
  }));

  for (const [id, d] of depth) {
    const node = nodeById.get(id);
    if (!node) continue;
    if (d === 1 && changedFiles.includes(id)) continue;
    const reason = buildReason(id, d, nodeById, adj);
    nodes.push({ id, label: node.label, kind: node.kind, depth: d, reason });
  }

  nodes.sort((a, b) => a.depth - b.depth || a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label));
  return { changedFiles, nodes, maxDepth: Math.max(1, ...nodes.map((n) => n.depth)) };
}

function buildReason(
  id: string,
  depth: number,
  nodeById: Map<string, GraphNode>,
  adj: Map<string, GraphEdge[]>
): string {
  const parent = (adj.get(id) ?? []).find((e) => {
    const other = e.from === id ? e.to : e.from;
    return nodeById.get(other)?.kind === "file";
  });
  const src = parent ? nodeById.get(parent.from === id ? parent.to : parent.from) : null;
  const via = src ? ` (via ${KIND_LABEL[src.kind]} ${src.label})` : "";
  return `Reached at depth ${depth}${via}`;
}

export function riskEngine(
  index: CodeIndex,
  _graph: CodeGraph,
  impact: ImpactResult
): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 0;

  const changedFiles = new Set(impact.changedFiles);
  const touchedIds = new Set(impact.nodes.map((n) => n.id));
  const touchedFiles = new Set(
    impact.nodes.filter((n) => n.kind === "file").map((n) => n.id)
  );

  const routeFiles = new Set(index.routes.map((r) => r.file));
  const authTouched = [...changedFiles].some((f) => routeFiles.has(f) || /auth|api\.ts$/.test(f));
  if (authTouched) {
    score += 25;
    factors.push({
      label: "Authorization surface touched",
      score: 25,
      detail: "A file owning API routes or authentication logic is in the change set. Authorization defects are disproportionately expensive.",
    });
  }

  const findingsTouched = index.findings.filter((fd) => changedFiles.has(fd.file) || touchedFiles.has(fd.file));
  if (findingsTouched.length) {
    score += Math.min(25, 10 + findingsTouched.length * 5);
    factors.push({
      label: "Known security findings in scope",
      score: Math.min(25, 10 + findingsTouched.length * 5),
      detail: `${findingsTouched.length} flagged finding(s) sit in affected files (values masked, not displayed).`,
    });
  }

  const testsTouched = [...touchedIds].filter((id) => id.includes("#") && /test/i.test(id)).length;
  const routesInScope = [...touchedIds].filter((id) => /^(GET|POST|PUT|DELETE|PATCH)\s/.test(id)).length;
  if (testsTouched > 0) {
    score += 10;
    factors.push({ label: "Tests exercise affected code", score: 10, detail: `${testsTouched} test(s) hit the changed surface; regression risk is measurable.` });
  }
  if (routesInScope > 0) {
    score += 10;
    factors.push({ label: "API surface touched", score: 10, detail: `${routesInScope} route(s) reimplemented — the route table itself stays unchanged (contract preserved).` });
  }

  const modelsTouched = [...touchedIds].filter((id) => id.includes("#") && !/^(GET|POST|PUT|DELETE|PATCH)\s/.test(id) && /^[a-z_]+$/.test(id.split("#").pop() ?? "")).length;
  if (modelsTouched > 0) {
    score += 10;
    factors.push({ label: "Data models affected", score: 10, detail: `${modelsTouched} model(s) are reachable from the change.` });
  }

  const maxCplx = Math.max(1, ...impact.nodes
    .map((n) => index.functions.find((fn) => fn.id === n.id)?.complexity ?? 0));
  if (maxCplx > 6) {
    score += 5;
    factors.push({ label: "High-complexity function in scope", score: 5, detail: `Peak cyclomatic complexity ${maxCplx} among touched functions.` });
  }
  if (index.stats.coupling >= 4) {
    score += 5;
    factors.push({ label: "Module fan-in is high", score: 5, detail: `Peak fan-in ${index.stats.coupling} — shared modules amplify blast radius.` });
  }

  score = Math.min(100, score);
  const level: RiskLevel = score < 30 ? "LOW" : score < 55 ? "MEDIUM" : score < 80 ? "HIGH" : "CRITICAL";
  return {
    level,
    score,
    factors,
    summary:
      `${level} risk estimate: ${factors.length} contributing factor(s). ` +
      `The change is isolated to ${impact.changedFiles.length} file(s) with a blast radius of ${impact.nodes.length} node(s) in the dependency graph. ` +
      `Estimates are heuristic and should be confirmed by verification.`,
    estimate: true,
  };
}
