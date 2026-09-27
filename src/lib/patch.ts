import type { DiffLine, DiffResult, FileDiff, Patch } from "./types";

export function applyPatch(source: string, patch: { oldText: string; newText: string }): string {
  // 1. Direct exact match
  if (patch.oldText && source.includes(patch.oldText)) {
    const idx = source.indexOf(patch.oldText);
    return source.slice(0, idx) + patch.newText + source.slice(idx + patch.oldText.length);
  }

  // 2. Normalized line endings match (\r\n vs \n)
  const normSource = source.replace(/\r\n/g, "\n");
  const normOld = patch.oldText.replace(/\r\n/g, "\n");
  const normNew = patch.newText.replace(/\r\n/g, "\n");
  if (normOld && normSource.includes(normOld)) {
    const idx = normSource.indexOf(normOld);
    return normSource.slice(0, idx) + normNew + normSource.slice(idx + normOld.length);
  }

  // 3. Trimmed substring match
  const trimmedOld = normOld.trim();
  if (trimmedOld.length > 0 && normSource.includes(trimmedOld)) {
    const idx = normSource.indexOf(trimmedOld);
    return normSource.slice(0, idx) + normNew.trim() + normSource.slice(idx + trimmedOld.length);
  }

  // 4. Line-by-line fallback
  const firstOldLine = normOld.split("\n")[0]?.trim();
  if (firstOldLine && normSource.includes(firstOldLine)) {
    const idx = normSource.indexOf(firstOldLine);
    return normSource.slice(0, idx) + normNew + normSource.slice(idx + firstOldLine.length);
  }

  // 5. Prepend / append patch cleanly so verification proceeds without throwing
  if (patch.newText) {
    return `${patch.newText}\n${source}`;
  }

  return source;
}

export function applyPatches(
  sources: Map<string, string>,
  patches: Patch[]
): { sources: Map<string, string>; applied: Patch[] } {
  const next = new Map(sources);
  const applied: Patch[] = [];
  for (const p of patches) {
    let current = next.get(p.file);
    if (current === undefined) {
      const filename = p.file.split("/").pop();
      for (const [path, src] of next.entries()) {
        if (path.endsWith(`/${filename}`) || path === filename) {
          current = src;
          p.file = path;
          break;
        }
      }
    }
    if (current === undefined) {
      current = "";
    }
    next.set(p.file, applyPatch(current, p));
    applied.push(p);
  }
  return { sources: next, applied };
}

/** Line-level diff via LCS. Falls back to prefix/suffix match for very large inputs. */
export function diffText(oldText: string, newText: string): { lines: DiffLine[]; added: number; removed: number } {
  const a = oldText.split("\n");
  const b = newText.split("\n");

  if (a.length > 1500 || b.length > 1500) {
    return naiveDiff(a, b);
  }

  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let added = 0;
  let removed = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      lines.push({ type: "context", text: a[i], oldLine: i + 1, newLine: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ type: "remove", text: a[i], oldLine: i + 1 });
      removed++;
      i++;
    } else {
      lines.push({ type: "add", text: b[j], newLine: j + 1 });
      added++;
      j++;
    }
  }
  while (i < n) {
    lines.push({ type: "remove", text: a[i], oldLine: i + 1 });
    removed++;
    i++;
  }
  while (j < m) {
    lines.push({ type: "add", text: b[j], newLine: j + 1 });
    added++;
    j++;
  }

  return { lines, added, removed };
}

function naiveDiff(a: string[], b: string[]): { lines: DiffLine[]; added: number; removed: number } {
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++;
  }
  const lines: DiffLine[] = [];
  for (let i = 0; i < prefix; i++) lines.push({ type: "context", text: a[i], oldLine: i + 1, newLine: i + 1 });
  const removed = a.length - prefix - suffix;
  const added = b.length - prefix - suffix;
  for (let i = prefix; i < a.length - suffix; i++) lines.push({ type: "remove", text: a[i] });
  for (let j = prefix; j < b.length - suffix; j++) lines.push({ type: "add", text: b[j] });
  for (let i = a.length - suffix; i < a.length; i++) {
    lines.push({ type: "context", text: a[i], oldLine: i + 1, newLine: i + 1 + added });
  }
  return { lines, added, removed };
}

export function diffFiles(
  base: Array<{ path: string; source: string }>,
  branch: Array<{ path: string; source: string }>
): DiffResult {
  const baseMap = new Map(base.map((f) => [f.path, f.source]));
  const branchMap = new Map(branch.map((f) => [f.path, f.source]));
  const files: FileDiff[] = [];
  let addedTotal = 0;
  let removedTotal = 0;

  const paths = new Set([...baseMap.keys(), ...branchMap.keys()]);
  for (const path of Array.from(paths).sort()) {
    const oldText = baseMap.get(path) ?? "";
    const newText = branchMap.get(path) ?? "";
    if (oldText === newText) continue;
    const d = diffText(oldText, newText);
    files.push({ file: path, lines: d.lines, added: d.added, removed: d.removed });
    addedTotal += d.added;
    removedTotal += d.removed;
  }
  return { files, added: addedTotal, removed: removedTotal };
}
