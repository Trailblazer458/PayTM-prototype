"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { initialState, parseStored, reducer, STORAGE_KEY, type Action, type JourneyState } from "@/lib/journey";

interface JourneyContextValue {
  state: JourneyState;
  dispatch: (a: Action) => void;
  ready: boolean;
  toast: string | null;
  showToast: (msg: string) => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved place, then apply a ?screen=N deep link if there is one.
  useEffect(() => {
    let stored: JourneyState | null = null;
    try {
      stored = parseStored(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      stored = null;
    }
    if (stored) dispatch({ type: "HYDRATE", state: stored });
    const param = new URLSearchParams(window.location.search).get("screen");
    const n = param ? Number(param) : NaN;
    if (Number.isFinite(n)) {
      dispatch({ type: "GOTO", screen: n });
      window.history.replaceState(null, "", window.location.pathname);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage blocked: the demo still works, it just forgets on refresh */
    }
  }, [state, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <JourneyContext.Provider value={{ state, dispatch, ready, toast, showToast }}>{children}</JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used inside JourneyProvider");
  return ctx;
}
