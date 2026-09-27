import {
  Database,
  ExternalLink,
  FileSearch,
  FolderGit2,
  GitBranch,
  GitFork,
  HardDrive,
  Lock,
  ScanSearch,
  ShieldAlert,
  Star,
} from "lucide-react";
import type { CodeIndex, RepoMetadata } from "../lib/types";
import { Card, Mono, SeverityBadge } from "./ui";
import { cls } from "../lib/utils";

export function ProjectPanel({
  index,
  repo,
  onOpenFile,
}: {
  index: CodeIndex | null;
  repo?: RepoMetadata;
  onOpenFile: (path: string) => void;
}) {
  if (!index) return null;
  const s = index.stats;

  const stats: Array<{ label: string; value: string | number; hint?: string }> = [
    { label: "Files", value: s.files },
    { label: "Lines", value: s.lines.toLocaleString() },
    { label: "Functions", value: s.functions },
    { label: "API routes", value: s.apiRoutes },
    { label: "Models", value: s.models },
    { label: "Tests", value: s.tests },
    { label: "Coverage", value: `${s.testCoverage}%`, hint: "estimate" },
    { label: "Complexity", value: s.complexity, hint: "cyclomatic" },
    { label: "Fan-in", value: s.coupling, hint: "peak" },
    { label: "Findings", value: s.findings, hint: "security" },
  ];

  const isLocalProject = repo?.owner === "local";

  return (
    <Card
      title="Project scan"
      icon={<ScanSearch className="size-5 text-sky-600" aria-hidden />}
      right={
        <Mono className="text-slate-500 font-medium">
          {isLocalProject
            ? `local: ${repo?.name}`
            : repo?.isRealRepo
              ? `github: ${repo.fullName}`
              : "structural estimate · in-browser sandbox"}
        </Mono>
      }
    >
      {/* Live GitHub or Local Repository Details */}
      {repo && (
        <div className="mb-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
                {isLocalProject ? (
                  <HardDrive className="size-4 text-emerald-400" strokeWidth={1.75} />
                ) : (
                  <FolderGit2 className="size-4 text-sky-400" strokeWidth={1.75} />
                )}
              </span>
              {isLocalProject ? (
                <span className="font-heading text-sm font-bold text-slate-900">
                  {repo.name}
                </span>
              ) : (
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-heading text-sm font-bold text-slate-900 hover:text-sky-600 flex items-center gap-1.5 transition-colors"
                  title="Open on GitHub"
                >
                  {repo.fullName}
                  <ExternalLink className="size-3.5 text-slate-400" />
                </a>
              )}
              <span
                className={cls(
                  "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isLocalProject
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : repo.isRealRepo
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                )}
              >
                {isLocalProject ? "Local Folder" : repo.isRealRepo ? "Live GitHub" : "Demo Sandbox"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              {isLocalProject ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium shadow-2xs">
                    <span className="size-2 rounded-full bg-emerald-500" /> {s.files} source files
                  </span>
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-700 shadow-2xs">
                      <span className="size-2 rounded-full bg-sky-500" /> {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-2xs">
                    Offline / Local Workspace
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium shadow-2xs">
                    <GitBranch className="size-3.5 text-sky-600" /> {repo.defaultBranch || "main"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium shadow-2xs">
                    <Star className="size-3.5 text-amber-500 fill-amber-400" /> {(repo.stars ?? 0).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium shadow-2xs">
                    <GitFork className="size-3.5 text-slate-500" /> {(repo.forks ?? 0).toLocaleString()}
                  </span>
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-700 shadow-2xs">
                      <span className="size-2 rounded-full bg-sky-500" /> {repo.language}
                    </span>
                  )}
                  {repo.license && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-2xs">
                      {repo.license}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {repo.description && (
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{repo.description}</p>
          )}
          {(repo.topics ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(repo.topics ?? []).map((t) => (
                <span key={t} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-heading text-[10px] text-slate-500">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Codebase Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((st) => (
          <div
            key={st.label}
            className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 transition-colors duration-150 hover:bg-slate-100/60 shadow-2xs"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{st.label}</p>
            <p className="mt-0.5 font-heading text-xl font-bold text-slate-900">
              {st.value}
              {st.hint && <span className="ml-1 text-[11px] font-normal text-slate-400">· {st.hint}</span>}
            </p>
          </div>
        ))}
      </div>

      {index.findings.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <ShieldAlert className="size-4 text-amber-600" aria-hidden /> Security findings
          </h4>
          <ul className="space-y-2">
            {index.findings.map((f, i) => (
              <li key={i} className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-3 text-slate-800 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge level={f.severity} />
                  <span className="text-sm font-semibold text-slate-900">{f.title}</span>
                  <Mono className="ml-auto text-slate-500">{f.file}:{f.line}</Mono>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{f.detail}</p>
                {f.kind === "credential" && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Lock className="size-3.5 text-slate-400" aria-hidden /> The credential value is masked and never displayed.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Database className="size-4 text-slate-500" aria-hidden /> Files & modules ({index.files.length})
        </h4>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 font-semibold">File</th>
                <th className="py-2.5 px-3 text-right font-semibold">Lines</th>
                <th className="py-2.5 px-3 text-right font-semibold">Functions</th>
                <th className="py-2.5 px-3 text-right font-semibold">Routes</th>
                <th className="py-2.5 px-3 text-right font-semibold">Tests</th>
                <th className="py-2.5 px-3 text-right font-semibold">Secrets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {index.files.map((f) => (
                <tr
                  key={f.path}
                  className="transition-colors duration-150 hover:bg-slate-50/80"
                >
                  <td className="py-2 px-3">
                    <button
                      onClick={() => onOpenFile(f.path)}
                      className="flex cursor-pointer items-center gap-2 font-heading text-[12px] font-medium text-sky-700 transition-colors duration-150 hover:text-sky-900 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <FileSearch className="size-3.5 text-sky-600" aria-hidden />
                      {f.path}
                    </button>
                  </td>
                  <td className={cls("py-2 px-3 text-right font-heading text-slate-600")}>{f.lines}</td>
                  <td className="py-2 px-3 text-right font-heading text-slate-600">{f.functions}</td>
                  <td className="py-2 px-3 text-right font-heading text-slate-600">{f.apiRoutes}</td>
                  <td className="py-2 px-3 text-right font-heading text-slate-600">{f.tests}</td>
                  <td className="py-2 px-3 text-right font-heading font-semibold text-red-600">{f.secrets.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
