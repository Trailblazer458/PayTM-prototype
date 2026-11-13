"use client";

import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { JourneyProvider, useJourney } from "@/hooks/useJourney";
import { ScreenView } from "@/components/screens";
import { PhoneFrame } from "./PhoneFrame";
import { PresenterPanel, StepNav } from "./PresenterPanel";

const DESKTOP_QUERY = "(min-width: 768px)";
/** Share of the window the stage may fill. A share, not pixels, so zooming keeps proportions exact. */
const STAGE_FILL = 0.95;

function useArrowKeys() {
  const { dispatch } = useJourney();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") dispatch({ type: "NEXT" });
      if (e.key === "ArrowLeft") dispatch({ type: "BACK" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);
}

/** null until mounted, then true on laptops and tablets, false on phones. */
function useIsDesktop(): boolean | null {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/**
 * Lays the stage out at its natural size, then scales the whole block to fit the window, centred.
 * Zooming or resizing only changes the scale, so the proportions always stay the same.
 */
function ScaledStage({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const s = Math.min((window.innerWidth * STAGE_FILL) / w, (window.innerHeight * STAGE_FILL) / h);
      setScale(Math.max(0.2, s));
      setVisible(true);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        ref={innerRef}
        className="stage-inner absolute left-1/2 top-1/2 w-max origin-center"
        style={{ transform: `translate(-50%, -50%) scale(${scale})`, visibility: visible ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

function DesktopStage() {
  const { state, ready } = useJourney();
  return (
    <ScaledStage>
      <div className="flex items-stretch gap-10">
        <div className="flex w-[390px] shrink-0 flex-col items-center gap-4">
          <PhoneFrame framed darkStatus={state.screen === 5} time={state.screen === 8 ? "8:00" : "9:41"}>
            {ready ? <ScreenView key={state.screen} screen={state.screen} /> : null}
          </PhoneFrame>
          <div className="w-full">
            <StepNav />
          </div>
        </div>
        {/* The panel takes the phone column's height and scrolls inside it. */}
        <aside className="relative w-[400px] shrink-0" aria-label="Presenter panel">
          <div className="no-scrollbar absolute inset-0 overflow-y-auto py-1">
            <PresenterPanel />
          </div>
        </aside>
      </div>
    </ScaledStage>
  );
}

function PhoneLayout() {
  const { state, ready } = useJourney();
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <main className="min-h-[100dvh]">
      <PhoneFrame
        framed={false}
        darkStatus={state.screen === 5}
        time={state.screen === 8 ? "8:00" : "9:41"}
        onInfo={() => setSheetOpen(true)}
      >
        {ready ? <ScreenView key={state.screen} screen={state.screen} /> : null}
      </PhoneFrame>

      {sheetOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close" className="anim-fade absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="anim-sheet relative max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-[#eef2f8] px-4 pb-6 pt-3">
            <div className="mb-2 flex justify-end">
              <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="rounded-full bg-white p-1.5">
                <X size={18} />
              </button>
            </div>
            <PresenterPanel />
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StageInner() {
  useArrowKeys();
  const desktop = useIsDesktop();
  if (desktop === null) return null; // first paint, before we know the screen size
  return desktop ? (
    <main>
      <DesktopStage />
    </main>
  ) : (
    <PhoneLayout />
  );
}

export function Stage() {
  return (
    <JourneyProvider>
      <StageInner />
    </JourneyProvider>
  );
}
