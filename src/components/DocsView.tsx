import {
  Activity,
  CheckCircle2,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Btn, Card, Chip, Mono } from "./ui";

interface DocsViewProps {
  onLaunchStudio: () => void;
}

export function DocsView({ onLaunchStudio }: DocsViewProps) {
  const stages = [
    { num: "01", name: "Project Scan", desc: "Indexes files, routes, exported functions, cyclomatic complexity, and scans for credentials." },
    { num: "02", name: "Request Ingestion", desc: "Accepts developer feature requests, bugfix descriptions, or security requirements." },
    { num: "03", name: "Intent Understanding", desc: "Extracts underlying intent, functional constraints, and affected architectural domains using IBM watsonx." },
    { num: "04", name: "Invariant Identification", desc: "Synthesizes hard behavioral invariants that must remain true (e.g. auth contracts, API schemas)." },
    { num: "05", name: "Blast Radius & Impact", desc: "Traces module dependencies and call graphs to estimate direct, indirect, and third-degree ripple effects." },
    { num: "06", name: "Risk Assessment", desc: "Scores risk (0-100) based on complexity, surface area, authorization boundaries, and coupling." },
    { num: "07", name: "AI Plan Generation", desc: "Constructs an ordered step-by-step patch implementation plan with built-in rollback strategy." },
    { num: "08", name: "Human Approval Gate", desc: "Halts for human review before any code or working branch is modified." },
    { num: "09", name: "Isolated Snapshot", desc: "Captures SHA-256 baseline hashes and forks an isolated in-memory git working branch." },
    { num: "10", name: "Patch Application", desc: "Applies targeted code modifications exclusively within the sandbox branch." },
    { num: "11", name: "Verification Suite", desc: "Executes functional tests, contract assertions, and property suites against the branch." },
    { num: "12", name: "AST Mutation Testing", desc: "Deliberately inverts comparison operators to prove tests detect regressions." },
    { num: "13", name: "Counterexample Hunting", desc: "Runs adversarial boundary scenarios to probe whether any invariant can be violated." },
    { num: "14", name: "Evidence & Audit Report", desc: "Generates an immutable cryptographic report allowing the developer to accept or roll back." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Developer Architecture & Verification Spec
            </h2>
            <Chip className="border-emerald-200 bg-emerald-50 text-emerald-800">
              v2.0 Spec
            </Chip>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-sans leading-relaxed">
            Technical reference on the invariant engine, AST blast radius mapping, adversarial mutation testing, and cryptographic evidence generation.
          </p>
        </div>

        <Btn
          variant="primary"
          onClick={onLaunchStudio}
          className="text-xs font-semibold px-4 py-2 shrink-0 bg-slate-900 text-white"
        >
          <Terminal className="size-3.5 text-sky-400" strokeWidth={1.75} />
          <span>Open Workspace</span>
        </Btn>
      </div>

      {/* Philosophy */}
      <Card title="The Core Philosophy" icon={<ShieldCheck className="size-5 text-sky-600" strokeWidth={1.75} />}>
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
          <p className="font-semibold text-slate-900 text-sm">
            « AI should not blindly modify code. It must verify intent, identify invariants, map blast radius, execute tests, and prove correctness before anything merges. »
          </p>
          <p>
            Standard coding assistants often produce code that looks syntactically correct while silently breaking authorization boundaries, corrupting route schemas, or introducing subtle regressions into downstream consumers.
          </p>
          <p>
            DevPartner AI enforces a zero-trust model where every proposed change is executed in an isolated working branch with cryptographic SHA-256 checkpoints, probed against hard invariants, and checked with adversarial mutations.
          </p>
        </div>
      </Card>

      {/* 14-Stage Lifecycle */}
      <Card title="The 14-Stage Verification Lifecycle" icon={<Activity className="size-5 text-sky-600" strokeWidth={1.75} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {stages.map((st) => (
            <div
              key={st.num}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-1 transition-colors hover:bg-slate-100/50"
            >
              <div className="flex items-center gap-2">
                <Mono className="text-[10px] font-bold text-sky-700 bg-sky-50 border-sky-200">
                  {st.num}
                </Mono>
                <h4 className="font-heading text-xs font-bold text-slate-900">{st.name}</h4>
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Invariants & Mutation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Invariant Engine" icon={<SlidersHorizontal className="size-5 text-sky-600" strokeWidth={1.75} />}>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
            <p>
              Invariants are non-negotiable architectural truths. Even if an AI creates a brilliant patch, if it breaks a single invariant, the run is flagged as <span className="font-semibold text-red-700 font-heading">REJECTED</span>.
            </p>
            <ul className="space-y-1 pt-1 font-heading text-[11px] text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Session authorization contracts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Role-based access control (RBAC)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Zero route table mutation</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card title="Mutation Testing & Probes" icon={<Layers className="size-5 text-indigo-600" strokeWidth={1.75} />}>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
            <p>
              A green test suite can be deceiving if tests do not assert critical conditions. DevPartner deliberately injects AST mutations (e.g., flipping <Mono>===</Mono> to <Mono>!==</Mono>) to ensure tests fail immediately when broken.
            </p>
            <div className="pt-2">
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-heading font-semibold text-indigo-800">
                100% Mutation Kill Requirement
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Backend & Watsonx */}
      <Card title="IBM watsonx & Verification Runner" icon={<Sparkles className="size-5 text-violet-600" strokeWidth={1.75} />}>
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
          <p>
            DevPartner integrates with <strong className="text-slate-800">IBM watsonx (granite-3-8b-instruct)</strong> via the local verification daemon (<Mono>server/runner.mjs</Mono> on port 3001).
          </p>
          <p>
            When watsonx credentials are configured, natural language developer requests are translated into formal AST invariants and structured multi-step plans. If the daemon is unreachable, the system transparently falls back to deterministic local rule engines.
          </p>
        </div>
      </Card>
    </div>
  );
}
