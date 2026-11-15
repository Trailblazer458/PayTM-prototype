"use client";

import { Sparkles } from "lucide-react";
import type { SavedCard } from "@/lib/seed";
import { cardReward } from "@/lib/seed";
import { Button } from "./kit";

/** Shown inside the phone once a bill paid by credit card is confirmed. */
export function RewardsPopup({
  card,
  amount,
  bonus,
  yearTotal,
  onClose,
}: {
  card: SavedCard;
  amount: number;
  /** Test 4 card rewards group: Paytm's extra bonus on top of the card's own reward. */
  bonus?: string;
  /** S4 card points tracker: points earned paying bills here this year. */
  yearTotal?: number;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center px-6" role="dialog" aria-modal="true" aria-label="Card rewards credited">
      <button type="button" aria-label="Close" tabIndex={-1} className="anim-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="anim-pop relative w-full rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd56b] to-[#f5a300] text-white shadow-[0_8px_24px_-6px_rgba(245,163,0,0.7)]">
          <Sparkles size={32} />
        </div>
        <div className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-warn">Card rewards</div>
        <div className="mt-1 text-[24px] font-extrabold leading-tight">{cardReward(card, amount)} credited</div>
        <p className="mt-1.5 text-[14px] leading-snug text-muted">
          Earned on this bill with your {card.name} •• {card.last4}.
        </p>
        {yearTotal ? (
          <p className="mt-2 text-[13px] font-semibold text-navy">
            This year: {yearTotal.toLocaleString("en-IN")} points from bills paid here
          </p>
        ) : null}
        {bonus ? <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] font-semibold text-warn">Plus {bonus}</p> : null}
        <Button className="mt-5" onClick={onClose}>
          Great
        </Button>
        <div className="mt-2 text-[10px] text-muted">Example reward rate for this prototype</div>
      </div>
    </div>
  );
}
