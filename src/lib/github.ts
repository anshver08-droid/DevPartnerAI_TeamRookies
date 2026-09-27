import type { RepoMetadata } from "./types";

export const DEFAULT_DEMO_REPO: RepoMetadata = {
  owner: "demo",
  name: "shop-api",
  fullName: "demo/shop-api",
  description: "Production E-commerce API with role-based auth & order services (Bundled Sandbox)",
  stars: 142,
  forks: 38,
  openIssues: 3,
  defaultBranch: "main",
  language: "TypeScript",
  htmlUrl: "https://github.com/demo/shop-api",
  updatedAt: new Date().toISOString(),
  topics: ["ecommerce", "api", "auth", "security", "in-memory"],
  license: "MIT",
  sizeKb: 450,
  isRealRepo: false,
};

/**
 * Parses user input to extract owner and repository name.
 * Supports:
 * - "https://github.com/owner/repo"
 * - "http://github.com/owner/repo/"
 * - "github.com/owner/repo"
 * - "git@github.com:owner/repo.git"
 * - "owner/repo"
 */
export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  let cleaned = input.trim();
  if (!cleaned) return null;

  // Handle git SSH format: git@github.com:owner/repo.git
  if (cleaned.startsWith("git@github.com:")) {
    cleaned = cleaned.replace(/^git@github\.com:/, "");
  } else {
    // Strip protocol and domain
    cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  }

  // Remove .git suffix and surrounding slashes
  cleaned = cleaned.replace(/\.git\/?$/i, "");
  cleaned = cleaned.replace(/^\/+|\/+$/g, "");

  const parts = cleaned.split("/").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1];
    // Basic validation of GitHub usernames and repo names
    if (/^[a-zA-Z0-9._-]+$/.test(owner) && /^[a-zA-Z0-9._-]+$/.test(repo)) {
      return { owner, repo };
    }
  }

  return null;
}

/**
 * Fetches live repository metadata from the GitHub REST API.
 */
export async function fetchGitHubRepo(owner: string, repo: string): Promise<RepoMetadata> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  
  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("GitHub request timed out. Please check your internet connection.");
    }
    throw new Error(`Failed to reach GitHub API: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (res.status === 404) {
    throw new Error(`Repository "${owner}/${repo}" not found on GitHub. Verify the owner and repo name and ensure it is public.`);
  }

  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      throw new Error("GitHub API rate limit reached (60 requests/hr for unauthenticated IP). Please try again shortly.");
    }
    throw new Error("Access to this repository was forbidden by GitHub.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error (HTTP ${res.status}).`);
  }

  const data = await res.json();

  return {
    owner: data.owner?.login ?? owner,
    name: data.name ?? repo,
    fullName: data.full_name ?? `${owner}/${repo}`,
    description: data.description ?? null,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    defaultBranch: data.default_branch ?? "main",
    language: data.language ?? null,
    htmlUrl: data.html_url ?? `https://github.com/${owner}/${repo}`,
    updatedAt: data.updated_at ?? new Date().toISOString(),
    topics: Array.isArray(data.topics) ? data.topics : [],
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    sizeKb: data.size ?? 0,
    isRealRepo: true,
  };
}

const IGNORED_PATH_PREFIXES = [
  ".git/",
  "node_modules/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
  ".turbo/",
  ".cache/",
  ".github/",
  ".idea/",
  ".vscode/",
  "vendor/",
];

const IGNORED_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "pdf", "zip", "gz", "tar", "tgz",
  "woff", "woff2", "ttf", "eot", "otf", "mp4", "mp3", "mov", "avi", "exe", "dll", "so", "dylib",
]);

const LOCKFILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Cargo.lock",
  "poetry.lock",
  "Gemfile.lock",
]);

/**
 * Fetches real source files from the repository via GitHub API tree & raw content.
 */
export async function fetchRepositoryFiles(
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<Array<{ path: string; source: string }>> {
  const treeUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`;

  let treeItems: Array<{ path: string; type: string; size?: number }> = [];

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(treeUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tree)) {
        treeItems = data.tree;
      }
    }
  } catch {
    // If tree API fails, we will attempt common manifest files below
  }

  // Filter candidates
  const eligiblePaths = treeItems
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((path) => {
      if (IGNORED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
      const ext = path.split(".").pop()?.toLowerCase() ?? "";
      if (IGNORED_EXTENSIONS.has(ext)) return false;
      const filename = path.split("/").pop() ?? "";
      if (LOCKFILES.has(filename)) return false;
      return true;
    });

  // Categorize paths into architectural buckets to ensure routes, models, tests, services, etc. are all included
  const routesBucket: string[] = [];
  const modelsBucket: string[] = [];
  const controllersBucket: string[] = [];
  const servicesBucket: string[] = [];
  const testsBucket: string[] = [];
  const authMiddlewareBucket: string[] = [];
  const configsBucket: string[] = [];
  const otherSourceBucket: string[] = [];

  for (const path of eligiblePaths) {
    const lower = path.toLowerCase();
    if (lower.includes("test") || lower.includes("spec") || lower.startsWith("tests/") || lower.startsWith("test/")) {
      testsBucket.push(path);
    } else if (lower.includes("route") || lower.includes("api") || lower.includes("router") || lower.includes("endpoints")) {
      routesBucket.push(path);
    } else if (lower.includes("model") || lower.includes("schema") || lower.includes("entity") || lower.includes("prisma") || lower.includes("models/")) {
      modelsBucket.push(path);
    } else if (lower.includes("controller") || lower.includes("handler")) {
      controllersBucket.push(path);
    } else if (lower.includes("service") || lower.includes("use-case")) {
      servicesBucket.push(path);
    } else if (lower.includes("middleware") || lower.includes("auth") || lower.includes("guard") || lower.includes("policy")) {
      authMiddlewareBucket.push(path);
    } else if (
      lower === "package.json" ||
      lower === "readme.md" ||
      lower.includes("config") ||
      lower.startsWith("src/app.") ||
      lower.startsWith("src/index.") ||
      lower.startsWith("src/server.") ||
      lower === "index.js" ||
      lower === "app.js"
    ) {
      configsBucket.push(path);
    } else {
      otherSourceBucket.push(path);
    }
  }

  // Prioritized selection guaranteeing representation across all layers (up to 85 deep-fetched files)
  const selectedSet = new Set<string>();

  // Always include key configs & entrypoints first
  configsBucket.slice(0, 10).forEach((p) => selectedSet.add(p));

  // Include routes & APIs (up to 18 files)
  routesBucket.slice(0, 18).forEach((p) => selectedSet.add(p));

  // Include models & schemas (up to 14 files)
  modelsBucket.slice(0, 14).forEach((p) => selectedSet.add(p));

  // Include controllers & handlers (up to 14 files)
  controllersBucket.slice(0, 14).forEach((p) => selectedSet.add(p));

  // Include services (up to 12 files)
  servicesBucket.slice(0, 12).forEach((p) => selectedSet.add(p));

  // Include test suites (up to 16 files)
  testsBucket.slice(0, 16).forEach((p) => selectedSet.add(p));

  // Include middleware & auth (up to 8 files)
  authMiddlewareBucket.slice(0, 8).forEach((p) => selectedSet.add(p));

  // Fill remaining budget up to 85 files from other source files or extra bucket items
  const allRemaining = [
    ...routesBucket.slice(18),
    ...modelsBucket.slice(14),
    ...controllersBucket.slice(14),
    ...servicesBucket.slice(12),
    ...testsBucket.slice(16),
    ...authMiddlewareBucket.slice(8),
    ...otherSourceBucket,
  ];

  for (const p of allRemaining) {
    if (selectedSet.size >= 85) break;
    selectedSet.add(p);
  }

  const selectedPaths = selectedSet.size > 0
    ? Array.from(selectedSet)
    : ["package.json", "README.md", "src/index.ts", "src/App.tsx", "index.js"];

  // Helper to fetch files in parallel batches of 12 to respect connection pools
  async function fetchInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);
      const chunkResults = await Promise.allSettled(chunk.map(fn));
      for (const res of chunkResults) {
        if (res.status === "fulfilled" && res.value !== null) {
          results.push(res.value);
        }
      }
    }
    return results;
  }

  // Fetch full file contents from raw.githubusercontent.com in parallel batches
  const fetchedSources = await fetchInBatches(selectedPaths, 12, async (path) => {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${path}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);
      const res = await fetch(rawUrl, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const text = await res.text();
      // Cap individual file size to 80KB to keep in-browser memory optimal
      const source = text.length > 80000 ? text.slice(0, 80000) + "\n\n// ... [Truncated for preview]" : text;
      return { path, source };
    } catch {
      return null;
    }
  });

  const sources: Array<{ path: string; source: string }> = fetchedSources.filter(Boolean) as Array<{ path: string; source: string }>;

  // For any remaining eligible paths from the tree that were not fetched, include index entries
  // so the File Inspector and project metrics reflect the true repository size
  const fetchedPaths = new Set(sources.map((s) => s.path));
  for (const path of eligiblePaths) {
    if (!fetchedPaths.has(path)) {
      sources.push({
        path,
        source: `// [Tree indexed file: ${path}]\n// Content can be inspected on GitHub at https://github.com/${owner}/${repo}/blob/${defaultBranch}/${path}`,
      });
    }
  }

  // If no files were fetched successfully, generate at least a structural README placeholder
  if (sources.length === 0) {
    sources.push({
      path: "README.md",
      source: `# ${owner}/${repo}\n\nRepository connected via GitHub REST API (${defaultBranch} branch).\nPublic files indexed for DevPartner AI verification pipeline.`,
    });
  }

  return sources;
}
