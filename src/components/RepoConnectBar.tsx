import { useRef, useState } from "react";
import {
  ExternalLink,
  FileUp,
  FolderGit2,
  FolderUp,
  GitBranch,
  HardDrive,
  Loader2,
  RotateCcw,
  Star,
  TriangleAlert,
  Upload,
} from "lucide-react";
import type { RepoMetadata } from "../lib/types";
import type { ScanInputFile } from "../lib/scanner";
import { pickDirectory, processFileList } from "../lib/importer";
import { Btn, Chip } from "./ui";
import { cls } from "../lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function RepoConnectBar({
  repo,
  filesCount = 0,
  loading,
  error,
  onLoadRepo,
  onLoadLocalProject,
  onResetToDemo,
}: {
  repo: RepoMetadata;
  filesCount?: number;
  loading: boolean;
  error: string | null;
  onLoadRepo: (input: string) => Promise<boolean>;
  onLoadLocalProject: (files: ScanInputFile[], projectName?: string) => Promise<boolean>;
  onResetToDemo: () => void;
}) {
  const [inputVal, setInputVal] = useState("");
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalProject = repo.owner === "local";

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || loading || importing) return;
    const success = await onLoadRepo(inputVal.trim());
    if (success) {
      setInputVal("");
    }
  };

  // 1. Directory Picker (Modern API with Fallback to folder input)
  const handleOpenFolderPicker = async () => {
    if (loading || importing) return;
    try {
      if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
        setImporting(true);
        const result = await pickDirectory();
        if (result && result.files.length > 0) {
          await onLoadLocalProject(result.files, result.projectName);
        } else if (result === null) {
          // User cancelled
        }
        setImporting(false);
        return;
      }
    } catch {
      // Fallback to standard input
    }
    folderInputRef.current?.click();
  };

  // 2. Input file change handlers
  const handleFolderInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImporting(true);
    try {
      const result = await processFileList(e.target.files);
      if (result.files.length > 0) {
        await onLoadLocalProject(result.files, result.projectName);
      }
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleFilesInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImporting(true);
    try {
      const result = await processFileList(e.target.files);
      if (result.files.length > 0) {
        await onLoadLocalProject(result.files, result.projectName);
      }
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  // 3. Drag and Drop support for folder/files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    setImporting(true);
    try {
      const result = await processFileList(e.dataTransfer.files);
      if (result.files.length > 0) {
        await onLoadLocalProject(result.files, result.projectName);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cls(
        "relative rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all duration-200",
        isDragging
          ? "border-sky-400 bg-sky-50/50 ring-2 ring-sky-200 ring-offset-1"
          : "border-slate-200/90"
      )}
    >
      {/* Hidden file & folder inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in HTML5 directory upload
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderInputChanged}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesInputChanged}
        className="hidden"
      />

      {/* Drag Overlay Notice */}
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-sky-600/10 backdrop-blur-2xs border-2 border-dashed border-sky-500 pointer-events-none">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-md text-sky-800 font-heading font-semibold text-xs">
            <Upload className="size-4 animate-bounce text-sky-600" />
            <span>Drop folder or source files to import local project</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
            {isLocalProject ? (
              <HardDrive className="size-5 text-emerald-400" strokeWidth={1.75} />
            ) : (
              <GithubIcon className="size-5 text-sky-400" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-sm font-bold tracking-tight text-slate-900">
                {isLocalProject ? "Local Project Workspace" : "Connect GitHub Repository"}
              </h2>
              <span
                className={cls(
                  "rounded-md border px-2 py-0.5 font-heading text-[10px] font-bold tracking-wider uppercase",
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
            <p className="text-[11px] text-slate-500">
              {isLocalProject
                ? "Loaded directly from your machine — no GitHub push required"
                : "Input a GitHub repository or import a local folder/files to verify invariants"}
            </p>
          </div>
        </div>

        {/* Input & Action controls */}
        <div className="flex flex-1 max-w-2xl flex-wrap items-center justify-end gap-2">
          {/* GitHub input form */}
          <form onSubmit={handleSubmit} className="flex flex-1 min-w-[260px] items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. facebook/react or github.com/owner/repo"
                disabled={loading || importing}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
              />
            </div>
            <Btn
              type="submit"
              disabled={!inputVal.trim() || loading || importing}
              title="Fetch repository metadata and real source files from GitHub"
              className="px-3.5 py-2 text-xs font-semibold shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" aria-hidden />
                  Loading…
                </>
              ) : (
                <>
                  <FolderGit2 className="size-4 text-sky-300" aria-hidden />
                  Load Repo
                </>
              )}
            </Btn>
          </form>

          {/* Local Folder / File Import Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenFolderPicker}
              disabled={loading || importing}
              title="Import a local folder directly from your computer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-300 hover:text-sky-800 text-slate-700 px-3 py-2 text-xs font-semibold shadow-2xs transition-all"
            >
              {importing ? (
                <Loader2 className="size-3.5 animate-spin text-sky-600" />
              ) : (
                <FolderUp className="size-3.5 text-sky-600" strokeWidth={1.75} />
              )}
              <span>Import Folder</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || importing}
              title="Import multiple local source files directly"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-2 text-xs font-medium shadow-2xs transition-all"
            >
              <FileUp className="size-3.5 text-slate-500" strokeWidth={1.75} />
              <span>Files</span>
            </button>

            {(repo.isRealRepo || isLocalProject) && (
              <button
                type="button"
                onClick={onResetToDemo}
                disabled={loading || importing}
                title="Reset to bundled demo e-commerce repository"
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs shrink-0"
              >
                <RotateCcw className="size-3.5 text-slate-400" />
                <span>Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 shadow-2xs animate-in fade-in"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
          <div className="flex-1">
            <strong className="font-semibold">Unable to load project: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Current Active Repository / Project info */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Current:</span>
          {isLocalProject ? (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/70 px-2.5 py-0.5 font-heading text-[11px] font-bold text-emerald-900 shadow-2xs">
              <HardDrive className="size-3 text-emerald-600" />
              <span>{repo.name}</span>
            </div>
          ) : (
            <a
              href={repo?.htmlUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-heading text-[11px] font-bold text-slate-800 hover:text-sky-700 shadow-2xs transition-colors"
            >
              <GitBranch className="size-3 text-sky-600" />
              {repo?.fullName || "demo/shop-api"}
              <ExternalLink className="size-3 text-slate-400" />
            </a>
          )}

          {!isLocalProject && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <Star className="size-3 text-amber-500 fill-amber-400" /> {(repo?.stars ?? 0).toLocaleString()}
            </span>
          )}

          <Chip className={cls(isLocalProject ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-sky-200 bg-sky-50 text-sky-800")}>
            {isLocalProject ? `${filesCount} files loaded` : `branch: ${repo?.defaultBranch || "main"}`}
          </Chip>
        </div>
      </div>
    </section>
  );
}
