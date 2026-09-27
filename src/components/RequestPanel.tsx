import { useState } from "react";
import { Play, RotateCcw, UserRound } from "lucide-react";
import { DEMO_REQUEST } from "../demo/project";
import { Btn, Card, Spinner } from "./ui";

export function RequestPanel({
  request,
  onChange,
  onAnalyze,
  running,
}: {
  request: string;
  onChange: (r: string) => void;
  onAnalyze: (r: string) => void;
  running: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const valid = request.trim().length >= 10;

  return (
    <Card title="Change request" icon={<UserRound className="size-5 text-sky-600" aria-hidden />}>
      <label htmlFor="change-request" className="mb-2 block text-xs font-semibold text-slate-700">
        What change should DevPartner AI verify?
      </label>
      <textarea
        id="change-request"
        rows={4}
        value={request}
        onChange={(e) => {
          onChange(e.target.value);
          setTouched(true);
        }}
        disabled={running}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3.5 font-heading text-[12px] leading-relaxed text-slate-900 transition-all duration-150 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 disabled:opacity-50 shadow-2xs"
        placeholder="Describe the change you want analyzed, e.g. 'The admin delete endpoint trusts a client-supplied role…'"
      />
      <div className="mt-2 flex min-h-5 items-center justify-between">
        <p className="text-[11px] text-slate-500">
          {touched && !valid ? "Give us a bit more detail — what breaks and what must stay true?" : ""}
        </p>
        <button
          onClick={() => {
            onChange(DEMO_REQUEST);
            setTouched(false);
          }}
          disabled={running}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-slate-500 transition-colors duration-150 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
          title="Restore the bundled demo request"
        >
          <RotateCcw className="size-3.5 text-slate-400" aria-hidden /> Restore demo request
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn
          onClick={() => onAnalyze(request.trim())}
          disabled={!valid || running}
          title={valid ? "Run intent, invariants, impact, risk and plan analysis" : "Describe the request first"}
          className="px-5 py-2.5 shadow-xs"
        >
          <Play className="size-4.5" aria-hidden />
          {running ? "Analyzing…" : "Analyze request"}
        </Btn>
        {running && <Spinner label="Extracting intent & invariants…" />}
      </div>
    </Card>
  );
}
