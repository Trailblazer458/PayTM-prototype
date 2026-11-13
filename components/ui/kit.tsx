"use client";

import { ArrowLeft, X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** "Paytm" as styled text. No logo file or brand assets. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-navy">Pay</span>
      <span className="text-sky">tm</span>
    </span>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "quiet";

export function Button({
  variant = "primary",
  className = "",
  full = true,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky";
  const styles: Record<Variant, string> = {
    primary: "bg-sky text-white hover:bg-sky-dark disabled:bg-[#b9e9f8] disabled:text-white",
    secondary: "border-2 border-sky bg-white text-navy hover:bg-sky-soft",
    ghost: "border border-line bg-white text-navy hover:bg-card",
    quiet: "text-sky hover:underline px-1 py-1",
  };
  return (
    <button type="button" className={`${base} ${styles[variant]} ${full ? "w-full" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function AppHeader({ title, onBack, right }: { title: ReactNode; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-line bg-white px-4">
      {onBack ? (
        <button type="button" aria-label="Back" onClick={onBack} className="-ml-1 rounded-full p-1 hover:bg-card">
          <ArrowLeft size={22} />
        </button>
      ) : null}
      <div className="flex-1 truncate text-[17px] font-semibold">{title}</div>
      {right}
    </div>
  );
}

/** A sheet that slides up inside the phone. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  dismissable?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="anim-fade absolute inset-0 bg-black/45"
        onClick={dismissable ? onClose : undefined}
        tabIndex={-1}
      />
      <div className="anim-sheet relative max-h-[88%] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3 no-scrollbar">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        {title || dismissable ? (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="text-[17px] font-bold">{title}</div>
            {dismissable ? (
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1 hover:bg-card">
                <X size={20} />
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-card p-4 ${className}`}>{children}</div>;
}

export function StatusChip({ tone, children }: { tone: "ok" | "warn" | "muted" | "sky"; children: ReactNode }) {
  const tones = {
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    muted: "bg-card text-muted border border-line",
    sky: "bg-sky-soft text-sky-dark",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
