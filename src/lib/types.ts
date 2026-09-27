// ── Core domain types for DevPartner AI ──────────────────────────────────────

export type StageId =
  | "project"
  | "request"
  | "intent"
  | "invariants"
  | "impact"
  | "risk"
  | "plan"
  | "approval"
  | "snapshot"
  | "verification"
  | "counterexamples"
  | "fix"
  | "evidence"
  | "rollback";

export type Status = "pending" | "running" | "ok" | "warn" | "fail";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
  updatedAt: string;
  topics: string[];
  license: string | null;
  sizeKb: number;
  isRealRepo: boolean;
}

export interface ScanStats {
  files: number;
  lines: number;
  functions: number;
  classes: number;
  imports: number;
  apiRoutes: number;
  models: number;
  tests: number;
  secrets: number;
  findings: number;
  complexity: number;
  testCoverage: number; // 0..100, estimate
  coupling: number; // max fan-in, estimate
}

export type FindingSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityFinding {
  file: string;
  severity: FindingSeverity;
  kind: "credential" | "authz_from_body" | "dangerous_pattern" | "missing_authorization";
  title: string;
  line: number;
  detail: string;
}

export interface FileEntry {
  path: string;
  language: string;
  lines: number;
  size: number; // bytes
  functions: number;
  classes: number;
  imports: number;
  models: number;
  apiRoutes: number;
  tests: number;
  secrets: SecretFlag[];
}

export interface SecretFlag {
  file: string;
  kind: string; // e.g. "api_key"
  line: number;
  // NOTE: the actual value is never kept/displayed — only the flag.
}

export interface FunctionInfo {
  id: string;
  file: string;
  name: string;
  line: number;
  kind: "function" | "arrow" | "method";
  complexity: number;
  async: boolean;
}

export interface ClassInfo {
  id: string;
  file: string;
  name: string;
  line: number;
}

export interface ImportInfo {
  file: string;
  source: string;
  symbols: string[];
  line: number;
}

export interface ApiRoute {
  id: string;
  file: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: string;
  auth: boolean; // requires authz per source heuristic
  line: number;
}

export interface ModelInfo {
  id: string;
  file: string;
  name: string;
  line: number;
}

export interface TestInfo {
  id: string;
  file: string;
  name: string;
  line: number;
  category: string;
}

export interface DependencyInfo {
  file: string;
  source: string;
  line: number;
}

export interface CodeIndex {
  files: FileEntry[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  routes: ApiRoute[];
  models: ModelInfo[];
  tests: TestInfo[];
  dependencies: DependencyInfo[];
  findings: SecurityFinding[];
  stats: ScanStats;
}

// ── Intent ──────────────────────────────────────────────────────────────────

export interface IntentItem {
  slug: string;
  label: string;
}

export interface Intent {
  feature: string;
  summary: string;
  requirements: IntentItem[];
  constraints: IntentItem[];
  invariants: IntentItem[];
  affectedAreas: string[];
  confidence: number; // 0..1 — "estimate"
  source: "ai" | "fallback";
}

// ── Impact / risk ───────────────────────────────────────────────────────────

export interface ImpactNode {
  id: string;
  label: string;
  kind: "file" | "function" | "api" | "model" | "test";
  depth: number; // 1 = direct, 2 = indirect, 3 = possible
  reason: string;
}

export interface ImpactResult {
  changedFiles: string[];
  nodes: ImpactNode[];
  maxDepth: number;
}

export interface RiskFactor {
  label: string;
  score: number;
  detail: string;
}

export interface RiskResult {
  level: RiskLevel;
  score: number; // 0..100
  factors: RiskFactor[];
  summary: string;
  estimate: boolean; // always true for now
}

// ── Plan ────────────────────────────────────────────────────────────────────

export interface PlanStep {
  order: number;
  title: string;
  detail: string;
  files: string[];
  tests: string[];
  risky: boolean;
}

export interface Plan {
  title: string;
  summary: string;
  steps: PlanStep[];
  rollback: string;
  source: "ai" | "fallback";
}

// ── Snapshots / patches / diff ─────────────────────────────────────────────

export interface SnapshotEntry {
  path: string;
  content: string;
  hash: string;
  mtime: number;
}

export interface Patch {
  file: string;
  oldText: string;
  newText: string;
  note?: string;
}

export interface DiffLine {
  type: "context" | "add" | "remove";
  text: string;
  oldLine?: number;
  newLine?: number;
}

export interface FileDiff {
  file: string;
  lines: DiffLine[];
  added: number;
  removed: number;
}

export interface DiffResult {
  files: FileDiff[];
  added: number;
  removed: number;
}

// ── Verification ───────────────────────────────────────────────────────────

export interface TestRunResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  detail: string;
}

export interface VerificationResult {
  suiteName: string;
  results: TestRunResult[];
  passed: number;
  failed: number;
  durationMs: number;
  coverage: number; // estimate
}

export interface Counterexample {
  id: string;
  title: string;
  description: string;
  invariant: string;
  input: string;
  expected: string;
  actual: string;
  severity: RiskLevel;
  fixed: boolean;
}

export interface FixResult {
  patches: Patch[];
  note: string;
  source: "ai" | "fallback";
}

// ── Evidence ───────────────────────────────────────────────────────────────

export interface EvidenceSection {
  title: string;
  status: Status;
  summary: string;
  details: string[];
}

export interface EvidenceReport {
  runId: string;
  timestamp: string;
  request: string;
  verdict: "SAFE" | "ATTENTION" | "REJECTED";
  verdictSummary: string;
  sections: EvidenceSection[];
  artifacts: string[];
}

// ── Pipeline ───────────────────────────────────────────────────────────────

export interface PipelineError {
  stage: StageId;
  message: string;
  fatal: boolean;
}

export interface InvariantCheck {
  name: string;
  slug: string;
  passed: boolean | null;
  detail: string;
  measured: boolean;
}

export interface MutationOutcome {
  label: string;
  mutations: Array<{ kind: string; survived: boolean; detail: string }>;
}

export interface HuntEvaluation {
  id: string;
  title: string;
  severity: RiskLevel;
  ok: boolean;
  expected: string;
  actual: string;
}

export interface PipelineState {
  stage: StageId;
  status: Status;
  index: CodeIndex | null;
  request: string;
  intent: Intent | null;
  invariantChecks: InvariantCheck[];
  impact: ImpactResult | null;
  risk: RiskResult | null;
  plan: Plan | null;
  approved: boolean;
  baseSnapshot: SnapshotEntry[] | null;
  patchDiff: DiffResult | null;
  verification: VerificationResult | null;
  baselineSuite: VerificationResult | null;
  propertyResults: VerificationResult | null;
  mutation: MutationOutcome | null;
  counterexamples: Counterexample[];
  baselineCounterexamples: Counterexample[];
  fix: FixResult | null;
  evidence: EvidenceReport | null;
  applying: boolean; // patch applied to working copy
  branchName: string | null;
  history: HistoryEntry[];
  error: PipelineError | null;
  externalVerification: boolean;
  rollbackNote: string | null;
  repo: RepoMetadata;
  repoLoading: boolean;
  repoError: string | null;
  files: Array<{ path: string; source: string }>;
}

export interface HistoryEntry {
  id: string;
  created_at: string;
  request: string;
  status: string;
  verdict: string | null;
}
