"use client";

import { BellRing, CalendarCheck, Lock, X } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { rupees } from "@/lib/format";
import { autopayCaps, bills, board, customCapMax, customCapMin } from "@/lib/seed";
import { AppHeader, BottomSheet, Button } from "./kit";
import { DemoPinSheet } from "./DemoPinSheet";

type Pick = number | "custom" | null;

/**
 * The AutoPay setup flow: pick a cap (nothing pre-selected), review the promise, approve with the demo PIN.
 * Used on screen 6 (offered after the 2nd payment) and on screen 4 (her own choice after the 1st payment).
 */
export function AutoPaySetup({
  intro,
  onBack,
  onConfirm,
  onNotNow,
}: {
  intro: ReactNode;
  onBack: () => void;
  onConfirm: (cap: number) => void;
  onNotNow: () => void;
}) {
  const [pick, setPick] = useState<Pick>(null);
  const [custom, setCustom] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const customValue = Number(custom.replace(/\D/g, ""));
  const customOk = customValue >= customCapMin && customValue <= customCapMax;
  const cap = pick === "custom" ? (customOk ? customValue : null) : pick;
  const highest = Math.max(bills.nov.amount, bills.dec.amount);

  const onPin = useCallback(() => {
    setPinOpen(false);
    if (cap) onConfirm(cap);
  }, [cap, onConfirm]);

  return (
    <div className="flex h-full flex-col bg-white">
      <AppHeader title="Electricity bill" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        {intro}

        <h2 className="mt-6 text-[15px] font-bold">The most Paytm may ever debit</h2>
        <p className="mt-0.5 text-[12px] text-muted">
          Your bills have been up to {rupees(highest)}. Pick a limit you are comfortable with.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label="AutoPay limit">
          {[...autopayCaps, "custom" as const].map((c) => {
            const on = pick === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPick(c)}
                className={`rounded-xl border-2 py-2.5 text-[14px] font-semibold transition ${
                  on ? "border-sky bg-sky-soft text-navy" : "border-line bg-white hover:border-sky/50"
                }`}
              >
                {c === "custom" ? "Custom" : rupees(c)}
              </button>
            );
          })}
        </div>
        {pick === "custom" ? (
          <div className="anim-rise mt-3">
            <input
              inputMode="numeric"
              autoFocus
              placeholder={`${rupees(customCapMin)} to ${rupees(customCapMax)}`}
              value={custom ? rupees(customValue) : ""}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 5))}
              className="w-full rounded-xl border-2 border-line px-4 py-3 text-[17px] font-semibold outline-none focus:border-sky"
              aria-label="Custom limit"
            />
            {custom && !customOk ? (
              <div className="mt-1 text-[12px] text-warn">
                Pick between {rupees(customCapMin)} and {rupees(customCapMax)}.
              </div>
            ) : null}
          </div>
        ) : null}

        <ul className="mt-5 space-y-2 text-[13px]">
          <li className="flex gap-2">
            <BellRing size={16} className="mt-px shrink-0 text-sky" /> A message 24 hours before each debit
          </li>
          <li className="flex gap-2">
            <Lock size={16} className="mt-px shrink-0 text-sky" /> Never more than the limit you pick
          </li>
          <li className="flex gap-2">
            <CalendarCheck size={16} className="mt-px shrink-0 text-sky" /> Cancel any time from Bills
          </li>
        </ul>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line bg-white p-4">
        <Button variant="secondary" onClick={onNotNow}>
          Not now
        </Button>
        <Button disabled={!cap} onClick={() => setReviewOpen(true)}>
          Set up AutoPay
        </Button>
      </div>

      <BottomSheet open={reviewOpen} onClose={() => setReviewOpen(false)} title="Before you approve">
        <div className="rounded-2xl bg-sky-soft p-4 text-[15px] leading-snug">
          Paytm will never debit more than <strong>{cap ? rupees(cap) : ""}</strong> (the cap you chose). You get a message
          24 hours before each debit. Cancel any time from Bills.
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[13px]">
          <dt className="text-muted">Bill</dt>
          <dd className="text-right font-semibold">{board.short} electricity</dd>
          <dt className="text-muted">Pays</dt>
          <dd className="text-right font-semibold">The bill amount, on the due date</dd>
          <dt className="text-muted">Limit</dt>
          <dd className="text-right font-semibold">{cap ? rupees(cap) : ""} a month</dd>
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setReviewOpen(false)}>
            <X size={16} /> Change
          </Button>
          <Button
            onClick={() => {
              setReviewOpen(false);
              setPinOpen(true);
            }}
          >
            Continue to PIN
          </Button>
        </div>
      </BottomSheet>

      <DemoPinSheet
        open={pinOpen}
        amount={cap ?? 0}
        purpose="Approve AutoPay with a limit of"
        payee={`${board.short} electricity, every month`}
        onClose={() => setPinOpen(false)}
        onDone={onPin}
      />
    </div>
  );
}
