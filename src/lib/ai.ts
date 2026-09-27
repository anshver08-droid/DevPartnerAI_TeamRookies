// ── AI engine client ─────────────────────────────────────────────────────────
// Calls the ai-engine Supabase Edge Function, which calls IBM watsonx.
// If the function is unreachable or the model is not configured, callers
// receive { ok: false, reason } and use deterministic fallbacks.

export type AiAction =
  | "ping"
  | "extract_intent"
  | "generate_invariants"
  | "generate_plan"
  | "apply_change"
  | "hunt_counterexamples"
  | "generate_fix"
  | "generate_evidence"
  | "explain_node";

export interface AiResult<T> {
  ok: boolean;
  data?: T;
  reason?: string;
}

export async function callAiEngine<T>(action: AiAction, payload: unknown): Promise<AiResult<T>> {
  const runnerUrl = import.meta.env.VITE_RUNNER_URL || "http://127.0.0.1:3001";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "devpartner-local-anon-key-verified";

  // Prioritize relative path through Vite proxy to eliminate CORS, with runnerUrl fallback
  const candidateUrls: string[] = [
    "/functions/v1/ai-engine",
    `${runnerUrl}/functions/v1/ai-engine`,
  ];
  if (supabaseUrl && !candidateUrls.includes(`${supabaseUrl}/functions/v1/ai-engine`)) {
    candidateUrls.push(`${supabaseUrl}/functions/v1/ai-engine`);
  }

  let lastReason = "ai-engine unreachable";

  for (const endpoint of candidateUrls) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anon}`,
          apikey: anon,
        },
        body: JSON.stringify({ action, payload }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text();
        lastReason = `ai-engine HTTP ${res.status}: ${text.slice(0, 120)}`;
        continue;
      }

      const json = (await res.json()) as { ok?: boolean; data?: T; error?: string };
      if (json.ok === false || json.error) {
        lastReason = json.error ?? "ai-engine returned error";
        continue;
      }

      return { ok: true, data: json.data };
    } catch (e) {
      lastReason = e instanceof Error ? e.message : String(e);
    }
  }

  return { ok: false, reason: lastReason };
}

export function externalVerificationLabel(available: boolean): string {
  return available
    ? "External verification: IBM watsonx (granite) via ai-engine"
    : "External verification: unavailable — results from deterministic local fallbacks";
}
