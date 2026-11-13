import { AlertCircle, Check, Loader2 } from "lucide-react";

export type StepState = "done" | "active" | "waiting" | "stuck";

export function StatusTracker({ steps }: { steps: { label: string; sub?: string; state: StepState }[] }) {
  return (
    <ol className="relative" aria-label="Payment status">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const icon =
          s.state === "done" ? (
            <Check size={16} strokeWidth={3} />
          ) : s.state === "active" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : s.state === "stuck" ? (
            <AlertCircle size={16} />
          ) : (
            <span className="h-2 w-2 rounded-full bg-current" />
          );
        const circle = {
          done: "bg-ok text-white",
          active: "bg-sky text-white",
          stuck: "bg-warn text-white",
          waiting: "bg-card text-[#b3bfd1] border-2 border-line",
        }[s.state];
        return (
          <li key={s.label} className="relative flex gap-3 pb-6 last:pb-0">
            {!last ? (
              <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 overflow-hidden bg-line">
                <span
                  className={`block w-full bg-ok transition-all duration-700 ${s.state === "done" ? "h-full" : "h-0"}`}
                />
              </span>
            ) : null}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${circle}`}>
              {icon}
            </span>
            <div className="pt-1">
              <div className={`text-[15px] font-semibold ${s.state === "waiting" ? "text-[#9aa7bb]" : ""}`}>{s.label}</div>
              {s.sub ? <div className="text-[12px] text-muted">{s.sub}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
