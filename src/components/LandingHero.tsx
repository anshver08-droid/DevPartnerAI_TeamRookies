import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck,
  FolderUp,
  GitBranch,
  Layers,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Btn, Mono } from "./ui";

interface LandingHeroProps {
  onLaunchStudio: () => void;
  onLoadSample: (req: string) => void;
  activeRepoFullName?: string;
  modelConfigured: boolean;
}

export function LandingHero({
  onLaunchStudio,
  onLoadSample,
  activeRepoFullName = "anshver08-droid/dev-partner-Dark-rai",
  modelConfigured,
}: LandingHeroProps) {
  const [copied, setCopied] = useState(false);

  const samplePrompt =
    "Harden DELETE /api/users/:id so authorization is derived from verified sessions instead of untrusted body parameters.";

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSample = () => {
    onLoadSample(samplePrompt);
    onLaunchStudio();
  };

  return (
    <div className="space-y-12 pb-12 pt-2">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-2">
        {/* Pulsing Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 shadow-2xs mb-6 backdrop-blur-xs">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span className="font-heading text-xs font-semibold text-slate-800">
            Real-time AI Verification Assistant
          </span>
          <span className="border-l border-slate-200 pl-2 text-[11px] font-medium text-slate-500">
            {modelConfigured ? "IBM watsonx (granite) Active" : "Deterministic Fallback Engine"}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Autonomous Code Verification{" "}
          <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            With Cryptographic Evidence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
          AI should never blindly modify production code. DevPartner extracts intent, enforces strict safety
          invariants, calculates blast radius impact, and executes adversarial mutation tests before anything merges.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Btn
            variant="primary"
            onClick={onLaunchStudio}
            className="px-6 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all bg-slate-900 text-white hover:bg-slate-800"
          >
            <Terminal className="size-4 text-sky-400" strokeWidth={1.75} aria-hidden />
            <span>Launch Verification Studio</span>
            <ArrowRight className="size-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          </Btn>

          <button
            onClick={handleRunSample}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Sparkles className="size-4 text-violet-600" strokeWidth={1.75} aria-hidden />
            <span>Inspect Live Passport Demo</span>
          </button>

          <button
            onClick={onLaunchStudio}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-ring"
          >
            <FolderUp className="size-4 text-sky-600" strokeWidth={1.75} aria-hidden />
            <span>Import Local Project</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" strokeWidth={1.75} /> In-Memory Isolation
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck className="size-3.5 text-sky-600" strokeWidth={1.75} /> SHA-256 Audit Records
          </span>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="size-3.5 text-amber-600" strokeWidth={1.75} /> 1-Click Rollback
          </span>
        </div>
      </section>

      {/* ── 2. Interactive Preview / "Code Passport" Card (Pedigree Aesthetic) ─ */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
          {/* Card Top Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Window Dots */}
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-300" />
                <span className="size-2.5 rounded-full bg-slate-300" />
                <span className="size-2.5 rounded-full bg-slate-300" />
              </div>
              <span className="h-4 w-px bg-slate-200 mx-1.5" />
              {/* File / Branch path */}
              <div className="flex items-center gap-1.5 font-heading text-xs font-semibold text-slate-700">
                <GitBranch className="size-3.5 text-sky-600" strokeWidth={1.75} />
                <span className="text-slate-500 truncate max-w-[160px] hidden sm:inline">{activeRepoFullName}</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span>passport:</span>
                <span className="text-slate-800">verify-session-authz</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-heading text-[10px] font-bold text-emerald-800 tracking-wider">
                <ShieldCheck className="size-3 text-emerald-600" strokeWidth={1.75} />
                PASSPORT VERIFIED
              </span>
            </div>
          </div>

          {/* Card Split Body: Prompt & Agent Execution Log */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left: Prompt & Target Details */}
            <div className="md:col-span-5 p-5 space-y-4 bg-slate-50/30">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Developer Intent Request
                </p>
                <div className="mt-2 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs text-xs text-slate-800 font-sans leading-relaxed">
                  {samplePrompt}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verified Invariants (4/4 Holding)
                </p>
                <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Deletions require verified admin session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Non-admin sessions blocked with 403</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Route contracts remain stable</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleRunSample}
                  className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Play className="size-3 text-sky-400" strokeWidth={1.75} />
                  Test Flow in Studio
                </button>
                <button
                  onClick={handleCopy}
                  title={copied ? "Copied to clipboard!" : "Copy Prompt"}
                  className="inline-flex cursor-pointer items-center justify-center size-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" strokeWidth={1.75} />
                  ) : (
                    <Copy className="size-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {/* Right: Verification Execution Log */}
            <div className="md:col-span-7 p-5 bg-white space-y-3 font-heading text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agent Verification Log
                </span>
                <span className="text-[11px] text-slate-500 font-mono">5 stages complete · 142ms</span>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">[01/05] AST Codebase Index:</span>{" "}
                    <span className="text-slate-600">4 modules scanned, 0 credential leaks.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">[02/05] Invariant Engine:</span>{" "}
                    <span className="text-slate-600">4 declarative invariants synthesized and proven.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">[03/05] Blast Radius Graph:</span>{" "}
                    <span className="text-slate-600">Isolated to 2 files (+17 / −9 lines diff).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">[04/05] AST Mutation Check:</span>{" "}
                    <span className="text-slate-600">Operator mutation killed by harness test suite.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">[05/05] Counterexample Hunt:</span>{" "}
                    <span className="text-slate-600">0 adversarial scenarios survived. Verdict: SAFE.</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Signature Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="size-3 text-sky-600" strokeWidth={1.75} />
                  <span>SHA-256:</span>
                  <Mono className="text-[10px] py-0 text-slate-700">9f82a1c0d4...4b2e</Mono>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-violet-600" strokeWidth={1.75} />
                  <span>watsonx granite-3-8b</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Feature Bento Grid (Minimalist 3-Card Grid) ─────────── */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Architectural Guardrails
          </p>
          <h2 className="mt-1 font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            A Rigorous Verification Harness For Every Commit
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-sky-600 mb-4 shadow-2xs">
                <SlidersHorizontal className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Invariant Guardrails & Probes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 font-sans">
                Declarative business rules and safety invariants that halt execution before dangerous or insecure changes can merge.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-heading font-medium text-slate-500">Automated Probes</span>
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">Zero Spoofing</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-indigo-600 mb-4 shadow-2xs">
                <Layers className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Blast Radius & Mutation Testing
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 font-sans">
                Deep dependency graph tracing coupled with adversarial mutation checks to ensure zero regressions in dependent modules.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-heading font-medium text-slate-500">AST Mutator</span>
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">Depth-3 Tracing</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-emerald-600 mb-4 shadow-2xs">
                <FileCheck className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Cryptographic Evidence & Rollback
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 font-sans">
                Immutable audit reports generated for every run with SHA-256 proof trees, backed by single-click snapshot rollback with zero side-effects.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-heading font-medium text-slate-500">Audit Passport</span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Instant Rollback</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action Banner ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight">
              Ready to verify repository modifications?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-lg">
              Open the Studio Workspace to scan any GitHub repository or run verified changes in the demo environment.
            </p>
          </div>
          <Btn
            variant="primary"
            onClick={onLaunchStudio}
            className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-semibold shrink-0 shadow-2xs"
          >
            <Terminal className="size-4 text-sky-600" strokeWidth={1.75} />
            <span>Open Studio Workspace</span>
          </Btn>
        </div>
      </section>
    </div>
  );
}
