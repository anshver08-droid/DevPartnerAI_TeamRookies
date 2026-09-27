// ── In-browser ES-module loader ──────────────────────────────────────────────
// Transforms import/export statements into dependency-injected closures and
// executes them with `new Function`. Safe for demo sources only.

export interface ModuleExports {
  [key: string]: unknown;
}

export function transformModule(source: string): { body: string; exports: string[] } {
  const exports: string[] = [];

  let out = source.replace(
    /import\s+(.*?)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    (_m, clause: string, spec: string) => {
      // Call-style: __deps is the resolver function passed by ModuleRegistry.load.
      // (Object-style `__deps[spec]` would be a property lookup on a function → undefined.)
      const depVar = `__deps(${JSON.stringify(spec)})`;
      const c = clause.trim();
      if (c.startsWith("*")) {
        const ns = c.replace(/\*\s*as\s+/, "").trim();
        return `const ${ns} = ${depVar};`;
      }
      if (c.startsWith("{")) return `const ${c} = ${depVar};`;
      return `const ${c} = ${depVar};`;
    }
  );

  out = out.replace(
    /export\s+(async\s+)?(function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g,
    (_m, asyncKw: string | undefined, kw: string, name: string) => {
      exports.push(name);
      return `${asyncKw ?? ""}${kw} ${name}`;
    }
  );

  out = out.replace(/export\s*\{([^}]+)\}/g, (_m, list: string) => {
    for (const part of list.split(",")) {
      const s = part.trim().split(/\s+as\s+/)[0].trim();
      if (s) exports.push(s);
    }
    return "";
  });

  return { body: out, exports: Array.from(new Set(exports)) };
}

function resolveSpecifier(fromPath: string, spec: string): string {
  if (spec.startsWith(".")) {
    const dir = fromPath.includes("/") ? fromPath.slice(0, fromPath.lastIndexOf("/")) : "";
    const base = `${dir ? dir + "/" : ""}${spec.replace(/^\.\//, "")}`;
    return base.endsWith(".ts") || base.endsWith(".js") ? base : `${base}.ts`;
  }
  return spec.endsWith(".ts") ? spec : `${spec}.ts`;
}

export class ModuleRegistry {
  private cache = new Map<string, ModuleExports>();
  private readonly sources: Map<string, string>;

  constructor(files: Array<{ path: string; source: string }>) {
    this.sources = new Map(files.map((f) => [f.path, f.source]));
  }

  load(name: string): ModuleExports {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const source = this.sources.get(name);
    if (source === undefined) throw new Error(`Module not found: ${name}`);

    const { body, exports } = transformModule(source);
    const resolver = (spec: string) => this.load(resolveSpecifier(name, spec));
    const factory = new Function(
      "__deps",
      `"use strict";\n${body}\n;return { ${exports.join(", ")} };`
    ) as (deps: (spec: string) => ModuleExports) => ModuleExports;

    const result = factory(resolver);
    this.cache.set(name, result);
    return result;
  }

  has(path: string): boolean {
    return this.sources.has(path);
  }
}

/** Compile a set of sources into a fresh registry (isolated per suite run). */
export function compileRegistry(
  files: Array<{ path: string; source: string }>,
  entry: string
): ModuleExports {
  const reg = new ModuleRegistry(files);
  return reg.load(entry);
}
