import { useEffect, useMemo, useState } from "react";
import {
  FileSearch,
  GitBranch,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { usePipeline } from "./hooks/usePipeline";
import { StageRail } from "./components/StageRail";
import { RepoConnectBar } from "./components/RepoConnectBar";
import { ProjectPanel } from "./components/ProjectPanel";
import { RequestPanel } from "./components/RequestPanel";
import { IntentPanel } from "./components/IntentPanel";
import { InvariantPanel } from "./components/InvariantPanel";
import { ImpactMap } from "./components/ImpactMap";
import { RiskPanel } from "./components/RiskPanel";
import { PlanPanel } from "./components/PlanPanel";
import { DiffViewer } from "./components/DiffViewer";
import { VerificationPanel } from "./components/VerificationPanel";
import { CounterexamplePanel } from "./components/CounterexamplePanel";
import { EvidencePanel } from "./components/EvidencePanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { RollbackBar } from "./components/RollbackBar";
import { CodeViewer } from "./components/CodeViewer";
import { Navigation, AppDock, type NavTab } from "./components/Navigation";
import { LandingHero } from "./components/LandingHero";
import { AuditView } from "./components/AuditView";
import { DocsView } from "./components/DocsView";
import { Card, Mono } from "./components/ui";
import { cls } from "./lib/utils";
import { callAiEngine } from "./lib/ai";

interface BackendPing {
  service: string;
  time: number;
  modelConfigured: boolean;
}

type BackendStatus = "checking" | "online" | "offline";

function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [modelConfigured, setModelConfigured] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await callAiEngine<BackendPing>("ping", {});
      if (!alive) return;
      if (r.ok && r.data) {
        setStatus("online");
        setModelConfigured(Boolean(r.data.modelConfigured));
        setReason(null);
      } else {
        setStatus("offline");
        setReason(r.reason ?? "ai-engine unreachable");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { status, modelConfigured, reason };
}

function FileInspector({
  path,
  source,
  files,
  repoName,
  onOpen,
  onClose,
}: {
  path: string | null;
  source: string | null;
  files: Array<{ path: string; source: string }>;
  repoName: string;
  onOpen: (p: string) => void;
  onClose: () => void;
}) {
  if (path && source !== null) {
    return <CodeViewer path={path} source={source} onClose={onClose} />;
  }
  return (
    <Card title="File inspector" icon={<FileSearch className="size-5 text-sky-600" strokeWidth={1.75} aria-hidden />}>
      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        Browse indexed files for <strong className="text-slate-800 font-semibold">{repoName}</strong>:
      </p>
      <ul className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {files.map((f) => (
          <li key={f.path}>
            <button
              onClick={() => onOpen(f.path)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-left font-heading text-[11px] font-medium text-slate-700 transition-all duration-150 hover:border-sky-300 hover:bg-sky-50/60 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-ring shadow-2xs"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-slate-400" />
              <span className="truncate">{f.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function App() {
  const {
    state,
    runAnalysis,
    approveAndApply,
    accept,
    rollback,
    reset,
    setRequest,
    loadRepository,
    loadLocalProject,
    resetToDemo,
  } = usePipeline();
  const backend = useBackendStatus();
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const sourcesByPath = useMemo(
    () => new Map(state.files.map((f) => [f.path, f.source])),
    [state.files]
  );
  const fileSource = selectedFile ? (sourcesByPath.get(selectedFile) ?? null) : null;

  const running = state.status === "running";
  const showVerification = !!(state.branchName || state.verification || state.evidence);
  const showRollback = !!(state.applying || state.branchName || state.patchDiff);
  const patchCount = state.patchDiff ? state.patchDiff.files.length : (state.fix?.patches.length ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Floating In-App Dock for Rapid Switching (Large screens) */}
      <AppDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewRun={reset}
        running={running}
      />

      {/* Floating Pill Top Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        status={backend.status}
        modelConfigured={backend.modelConfigured}
        reason={backend.reason}
        running={running}
        onNewRun={reset}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 sm:px-6 pt-5 pb-12">
        {/* TAB 1: OVERVIEW & LANDING LAYER */}
        {activeTab === "overview" && (
          <LandingHero
            onLaunchStudio={() => setActiveTab("workspace")}
            onLoadSample={(req) => {
              setRequest(req);
            }}
            activeRepoFullName={state.repo.fullName}
            modelConfigured={backend.modelConfigured}
          />
        )}

        {/* TAB 2: WORKSPACE STUDIO */}
        {activeTab === "workspace" && (
          <div className="space-y-4">
            {/* Real GitHub Repository Connection Bar & Local Project Importer */}
            <RepoConnectBar
              repo={state.repo}
              filesCount={state.files.length}
              loading={state.repoLoading}
              error={state.repoError}
              onLoadRepo={loadRepository}
              onLoadLocalProject={loadLocalProject}
              onResetToDemo={resetToDemo}
            />

            {/* Pipeline Stage Tracker */}
            <StageRail state={state} />

            {/* Error banner */}
            {state.error && (
              <div
                role="alert"
                className={cls(
                  "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-xs",
                  state.error.fatal ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" strokeWidth={1.75} aria-hidden />
                <span>
                  <strong className="font-semibold">{state.error.fatal ? "Pipeline stopped: " : "Notice: "}</strong>
                  {state.error.message}
                </span>
              </div>
            )}

            {/* Rollback note */}
            {state.rollbackNote && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" strokeWidth={1.75} aria-hidden />
                <span>{state.rollbackNote}</span>
              </div>
            )}

            {/* Rollback action bar */}
            {showRollback && (
              <RollbackBar branchName={state.branchName} patchCount={patchCount} onRollback={rollback} />
            )}

            {/* Main Studio Grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <ProjectPanel index={state.index} repo={state.repo} onOpenFile={setSelectedFile} />

                <div className="grid gap-5 md:grid-cols-2">
                  <RequestPanel request={state.request} onChange={setRequest} onAnalyze={runAnalysis} running={running} />
                  <IntentPanel intent={state.intent} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InvariantPanel checks={state.invariantChecks} baselineCounterexamples={state.baselineCounterexamples} />
                  <ImpactMap impact={state.impact} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <RiskPanel risk={state.risk} />
                  <PlanPanel plan={state.plan} running={running} onApprove={approveAndApply} />
                </div>

                {showVerification && (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <DiffViewer diff={state.patchDiff} />
                      <VerificationPanel
                        verification={state.verification}
                        baseline={state.baselineSuite}
                        propertyResults={state.propertyResults}
                        mutation={state.mutation}
                      />
                    </div>

                    {state.verification && (
                      <CounterexamplePanel baseline={state.baselineCounterexamples} current={state.counterexamples} />
                    )}

                    <EvidencePanel
                      evidence={state.evidence}
                      running={state.stage === "evidence" && state.status === "running"}
                      branchName={state.branchName}
                      onAccept={accept}
                      onRollback={rollback}
                    />
                  </>
                )}

                <HistoryPanel history={state.history} saved={backend.status === "online"} />
              </div>

              {/* Sidebar Guide & Inspector */}
              <aside className="space-y-5 self-start xl:sticky xl:top-[85px]">
                <Card title="How it works" icon={<GitBranch className="size-5 text-sky-600" strokeWidth={1.75} aria-hidden />}>
                  <ol className="space-y-3 text-xs leading-relaxed text-slate-600">
                    <li className="flex gap-2.5">
                      <Mono className="text-sky-700 font-semibold self-start">1</Mono>
                      <span>
                        <strong className="font-semibold text-slate-800">Scan & request</strong> — connect any public repository or use the demo shop; describe the change.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Mono className="text-sky-700 font-semibold self-start">2</Mono>
                      <span>
                        <strong className="font-semibold text-slate-800">Intent, invariants, impact, risk, plan</strong> — extracted by watsonx when configured, deterministic fallback otherwise.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Mono className="text-sky-700 font-semibold self-start">3</Mono>
                      <span>
                        <strong className="font-semibold text-slate-800">Approve</strong> — base is snapshotted, a working branch is created in memory, fix is applied.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Mono className="text-sky-700 font-semibold self-start">4</Mono>
                      <span>
                        <strong className="font-semibold text-slate-800">Verify</strong> — full suite, property checks, mutation testing, adversarial counterexample hunt, then an auditable evidence report.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Mono className="text-sky-700 font-semibold self-start">5</Mono>
                      <span>
                        <strong className="font-semibold text-slate-800">Accept or roll back</strong> — nothing is ever merged without developer sign-off; rollback is always one click.
                      </span>
                    </li>
                  </ol>
                </Card>
                <FileInspector
                  path={selectedFile}
                  source={fileSource}
                  files={state.files}
                  repoName={state.repo.fullName}
                  onOpen={setSelectedFile}
                  onClose={() => setSelectedFile(null)}
                />
              </aside>
            </div>
          </div>
        )}

        {/* TAB 3: AUDITS & HISTORY */}
        {activeTab === "audits" && (
          <AuditView
            history={state.history}
            onLaunchStudio={() => setActiveTab("workspace")}
            onRunRequest={(req) => {
              setRequest(req);
            }}
          />
        )}

        {/* TAB 4: DOCS & ARCHITECTURE SPEC */}
        {activeTab === "docs" && (
          <DocsView onLaunchStudio={() => setActiveTab("workspace")} />
        )}
      </main>

      {/* Pedigree-Style Developer Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 backdrop-blur-xs">
        <div className="mx-auto max-w-[1440px] px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-800">DevPartner AI</span>
            <span className="text-slate-300">·</span>
            <span>Developer-Agent Verification Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>In-Memory Git Isolation</span>
            <span>·</span>
            <span>SHA-256 Proof Trees</span>
            <span>·</span>
            <span>IBM watsonx</span>
          </div>
        </div>
      </footer>
    </div>
  );
}