import type { DiffResult, Patch, SnapshotEntry } from "./types";
import { sha256, uid } from "./utils";
import { applyPatches, diffFiles } from "./patch";

export class GitManager {
  branchName = "";
  private base = new Map<string, string>();
  private branch = new Map<string, string>();
  private appliedPatches: Patch[] = [];

  constructor(baseFiles: Array<{ path: string; source: string }>) {
    this.base = new Map(baseFiles.map((f) => [f.path, f.source]));
    this.branch = new Map(baseFiles.map((f) => [f.path, f.source]));
  }

  async createBranch(slug: string): Promise<void> {
    this.branchName = `fix/${slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}-${uid()}`;
  }

  async apply(patches: Patch[]): Promise<void> {
    const res = applyPatches(this.branch, patches);
    this.branch = res.sources;
    this.appliedPatches.push(...res.applied);
  }

  async rollback(): Promise<void> {
    this.branch = new Map(this.base);
    this.appliedPatches = [];
  }

  getBaseSources(): Array<{ path: string; source: string }> {
    return Array.from(this.base, ([path, source]) => ({ path, source }));
  }

  getBranchSources(): Array<{ path: string; source: string }> {
    return Array.from(this.branch, ([path, source]) => ({ path, source }));
  }

  hasChanges(): boolean {
    for (const [path, src] of this.branch) {
      if (this.base.get(path) !== src) return true;
    }
    return false;
  }

  diff(): DiffResult {
    return diffFiles(this.getBaseSources(), this.getBranchSources());
  }

  async snapshot(): Promise<SnapshotEntry[]> {
    const entries: SnapshotEntry[] = [];
    for (const [path, source] of this.base) {
      entries.push({ path, content: source, hash: await sha256(source), mtime: Date.now() });
    }
    return entries;
  }

  patchCount(): number {
    return this.appliedPatches.length;
  }
}
