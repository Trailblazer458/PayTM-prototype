"use client";

import { Delete, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/format";
import { BottomSheet } from "./kit";

/**
 * A simulated PIN pad. Deliberately not styled like the real UPI or NPCI screen.
 * Any 4 digits are accepted.
 */
export function DemoPinSheet({
  open,
  amount,
  payee,
  purpose,
  onClose,
  onDone,
}: {
  open: boolean;
  amount: number;
  payee: string;
  purpose?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [digits, setDigits] = useState("");

  useEffect(() => {
    if (!open) setDigits("");
  }, [open]);

  useEffect(() => {
    if (digits.length !== 4) return;
    const t = setTimeout(onDone, 450);
    return () => clearTimeout(t);
  }, [digits, onDone]);

  const press = (d: string) => setDigits((v) => (v.length < 4 ? v + d : v));

  return (
    <BottomSheet open={open} onClose={onClose} title="Confirm payment">
      <div className="mb-3 rounded-xl border-2 border-dashed border-warn bg-warn-soft px-3 py-2 text-center text-[13px] font-semibold text-warn">
        Demo: enter any 4 digits. No money moves.
      </div>
      <div className="text-center">
        <div className="text-[13px] text-muted">{purpose ?? "Paying"}</div>
        <div className="text-[15px] font-semibold">{payee}</div>
        <div className="mt-1 text-[30px] font-bold">{rupees(amount)}</div>
      </div>
      <div className="mt-4 flex justify-center gap-4" aria-label={`${digits.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${i < digits.length ? "border-navy bg-navy" : "border-muted"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[12px] text-muted">
        <ShieldCheck size={14} /> Demo PIN pad, not a real bank screen
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className="h-12 rounded-xl bg-card text-[20px] font-semibold hover:bg-line active:scale-95"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          type="button"
          onClick={() => press("0")}
          className="h-12 rounded-xl bg-card text-[20px] font-semibold hover:bg-line active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          aria-label="Delete digit"
          onClick={() => setDigits((v) => v.slice(0, -1))}
          className="flex h-12 items-center justify-center rounded-xl hover:bg-card"
        >
          <Delete size={22} />
        </button>
      </div>
    </BottomSheet>
  );
}
