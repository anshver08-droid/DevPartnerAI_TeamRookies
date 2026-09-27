import type { ScanInputFile } from "./scanner";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  ".cache",
  "coverage",
  ".vscode",
  ".idea",
  ".venv",
  "venv",
  "env",
  "__pycache__",
  ".turbo",
  ".svelte-kit",
]);

const BINARY_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "ico",
  "svg",
  "webp",
  "bmp",
  "pdf",
  "zip",
  "tar",
  "gz",
  "7z",
  "rar",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "mp4",
  "webm",
  "mp3",
  "wav",
  "ogg",
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "lock",
  "sqlite",
  "db",
]);

const MAX_FILE_SIZE = 600 * 1024; // 600 KB per file limit for performance
const MAX_TOTAL_FILES = 120; // Up to 120 prioritized files

export interface ImportedProject {
  projectName: string;
  files: ScanInputFile[];
}

function shouldIgnorePath(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, "/");
  const segments = norm.split("/");
  for (const seg of segments) {
    if (IGNORED_DIRS.has(seg.toLowerCase())) return true;
    if (seg.startsWith(".") && seg !== ".env" && seg !== ".env.example") return true;
  }

  const ext = norm.split(".").pop()?.toLowerCase() ?? "";
  if (BINARY_EXTENSIONS.has(ext)) return true;
  if (norm.endsWith("package-lock.json") || norm.endsWith("yarn.lock") || norm.endsWith("pnpm-lock.yaml")) return true;

  return false;
}

function cleanRelativePath(fullPath: string): { relativePath: string; folderName?: string } {
  const norm = fullPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = norm.split("/");
  if (parts.length > 1) {
    const folderName = parts[0];
    const relativePath = parts.slice(1).join("/");
    return { relativePath, folderName };
  }
  return { relativePath: norm };
}

function priorityOf(path: string): number {
  const p = path.toLowerCase();
  if (p === "package.json") return 100;
  if (p.includes("route") || p.includes("controller") || p.includes("api")) return 90;
  if (p.includes("model") || p.includes("schema") || p.includes("entity")) return 80;
  if (p.includes("auth") || p.includes("session") || p.includes("token") || p.includes("user")) return 75;
  if (p.includes("test") || p.includes("spec")) return 70;
  if (p.includes("middleware") || p.includes("service")) return 65;
  if (p.endsWith("app.js") || p.endsWith("app.ts") || p.endsWith("server.js") || p.endsWith("index.ts")) return 60;
  if (p.startsWith("src/")) return 50;
  return 10;
}

/**
 * Process a browser FileList (e.g. from an <input type="file" webkitdirectory /> or drag & drop).
 */
export async function processFileList(fileList: FileList | File[]): Promise<ImportedProject> {
  const files: File[] = Array.from(fileList);
  if (files.length === 0) {
    return { projectName: "local-project", files: [] };
  }

  let detectedProjectName = "local-project";
  const validFiles: Array<{ file: File; path: string }> = [];

  for (const file of files) {
    const rawPath = (file as unknown as { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const { relativePath, folderName } = cleanRelativePath(rawPath);

    if (folderName && detectedProjectName === "local-project") {
      detectedProjectName = folderName;
    }

    if (shouldIgnorePath(relativePath || rawPath)) {
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      continue;
    }

    validFiles.push({ file, path: relativePath || rawPath });
  }

  // Sort valid files by priority
  validFiles.sort((a, b) => priorityOf(b.path) - priorityOf(a.path));
  const selectedFiles = validFiles.slice(0, MAX_TOTAL_FILES);

  const scanFiles: ScanInputFile[] = [];

  for (const item of selectedFiles) {
    try {
      const text = await item.file.text();
      // Ensure it's not binary garbled text
      if (text.includes("\0")) continue;

      scanFiles.push({
        path: item.path,
        source: text,
      });

      if (item.path === "package.json") {
        try {
          const pkg = JSON.parse(text);
          if (pkg.name) {
            detectedProjectName = pkg.name;
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn(`Could not read file ${item.path}:`, err);
    }
  }

  return {
    projectName: detectedProjectName,
    files: scanFiles,
  };
}

/**
 * Modern File System Access API directory picker (Chrome, Edge).
 */
export async function pickDirectory(): Promise<ImportedProject | null> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return null;
  }

  try {
    // @ts-expect-error - showDirectoryPicker is supported in modern Chromium browsers
    const dirHandle = await window.showDirectoryPicker();
    const projectName = dirHandle.name || "local-project";
    const collectedFiles: ScanInputFile[] = [];

    async function walkDir(handle: any, prefix = ""): Promise<void> {
      for await (const entry of handle.values()) {
        const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.kind === "directory") {
          if (!IGNORED_DIRS.has(entry.name.toLowerCase()) && !entry.name.startsWith(".")) {
            await walkDir(entry, fullPath);
          }
        } else if (entry.kind === "file") {
          if (shouldIgnorePath(fullPath)) continue;
          if (collectedFiles.length >= MAX_TOTAL_FILES) return;

          try {
            const file = await entry.getFile();
            if (file.size <= MAX_FILE_SIZE) {
              const text = await file.text();
              if (!text.includes("\0")) {
                collectedFiles.push({
                  path: fullPath,
                  source: text,
                });
              }
            }
          } catch {
            // ignore unreadable files
          }
        }
      }
    }

    await walkDir(dirHandle);

    return {
      projectName,
      files: collectedFiles,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      // User cancelled picker
      return null;
    }
    throw err;
  }
}
