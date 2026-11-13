"use client";

import { BatteryFull, Info, Signal, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import { useJourney } from "@/hooks/useJourney";

export function StatusBar({ dark = false, time = "9:41" }: { dark?: boolean; time?: string }) {
  return (
    <div
      className={`flex h-9 shrink-0 items-center justify-between px-6 text-[13px] font-semibold ${
        dark ? "bg-wa text-white" : "bg-white text-navy"
      }`}
    >
      <span>{time}</span>
      <span className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={16} />
      </span>
    </div>
  );
}

/**
 * The phone. On desktop it is a 390 by 844 device in the centre.
 * Under 768px it fills the screen with no frame.
 */
export function PhoneFrame({
  children,
  framed,
  darkStatus = false,
  time,
  onInfo,
}: {
  children: ReactNode;
  /** true: a 390 by 844 device on the laptop stage. false: fills a real phone's screen. */
  framed: boolean;
  darkStatus?: boolean;
  time?: string;
  onInfo?: () => void;
}) {
  const { toast } = useJourney();
  return (
    <div
      className={
        framed
          ? "relative h-[844px] w-[390px] shrink-0 rounded-[52px] border-[10px] border-[#0f1a2e] shadow-[0_30px_80px_-20px_rgba(0,46,110,0.45)]"
          : "relative h-[100dvh] w-full"
      }
    >
      <div className={`relative flex h-full w-full flex-col overflow-hidden bg-white ${framed ? "rounded-[42px]" : ""}`}>
        <StatusBar dark={darkStatus} time={time} />
        <div className="relative flex-1 overflow-hidden">{children}</div>
        {/* Phones only: the button that opens the presenter sheet. Sits below the app, never over it. */}
        {!framed && onInfo ? (
          <div className="shrink-0 bg-navy px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              aria-label="Open presenter panel"
              onClick={onInfo}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-[14px] font-bold text-navy active:scale-[0.98] max-[360px]:px-2 max-[360px]:text-[12px]"
            >
              <Info size={18} className="shrink-0 max-[360px]:hidden" /> Click here to know more about this step
            </button>
          </div>
        ) : null}
        {toast ? (
          <div className="anim-rise pointer-events-none absolute inset-x-6 bottom-8 z-50 rounded-xl bg-navy/95 px-4 py-3 text-center text-[13px] font-medium text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}
