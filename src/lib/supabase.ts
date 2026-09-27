import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { HistoryEntry } from "./types";

export interface RunRecord {
  request: string;
  status: string;
  verdict: string | null;
  summary: string | null;
  evidence: string | null;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  if (!client) client = createClient(url, anon);
  return client;
}

const LOCAL_RUNS_KEY = "devpartner_local_runs";

function getLocalRuns(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_RUNS_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLocalRun(entry: HistoryEntry) {
  try {
    const existing = getLocalRuns();
    const updated = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, 20);
    localStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function saveRun(record: RunRecord): Promise<{ ok: boolean; id?: string }> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("devpartner_runs")
        .insert(record)
        .select("id")
        .single();
      if (!error && data?.id) {
        saveLocalRun({
          id: data.id,
          created_at: new Date().toISOString(),
          request: record.request,
          status: record.status,
          verdict: record.verdict,
        });
        return { ok: true, id: data.id };
      }
    } catch {
      // fallback to runner endpoint
    }
  }

  // Fallback to local runner API
  try {
    const res = await fetch("/rest/v1/devpartner_runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const json = await res.json();
      saveLocalRun(json);
      return { ok: true, id: json.id };
    }
  } catch {
    // fallback to localStorage
  }

  const localId = `run-${Date.now()}`;
  saveLocalRun({
    id: localId,
    created_at: new Date().toISOString(),
    request: record.request,
    status: record.status,
    verdict: record.verdict,
  });
  return { ok: true, id: localId };
}

export async function listRuns(): Promise<HistoryEntry[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("devpartner_runs")
        .select("id, created_at, request, status, verdict")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data && data.length > 0) return data as HistoryEntry[];
    } catch {
      // fallback
    }
  }

  // Try local runner REST endpoint
  try {
    const res = await fetch("/rest/v1/devpartner_runs");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data as HistoryEntry[];
    }
  } catch {
    // fallback
  }

  return getLocalRuns();
}

