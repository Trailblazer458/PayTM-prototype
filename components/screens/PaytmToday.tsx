"use client";

import { Car, Coins, CreditCard, Gift, Landmark, LayoutGrid, Satellite, Smartphone, Star, X, Zap } from "lucide-react";
import { useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { AppHeader, Button, Wordmark } from "@/components/ui/kit";
import { SuccessHeader } from "./S1RechargeSuccess";

/**
 * A simple recreated mock of the order after a payment today:
 * Postpaid pop-up, rating request, scratch card, then the bill grid.
 * Drawn in code. No screenshots, logos or brand assets.
 */

function Order({ n }: { n: number }) {
  return (
    <span className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-warn text-[12px] font-bold text-white shadow">
      {n}
    </span>
  );
}

export function PaytmToday() {
  const { showToast } = useJourney();
  const [popup, setPopup] = useState(true);
  const msg = "This is Paytm today. Switch the toggle off to see the redesign.";

  const grid = [
    { label: "DTH Recharge", Icon: Satellite },
    { label: "Electricity Bill", Icon: Zap },
    { label: "FASTag Recharge", Icon: Car },
    { label: "Loan EMI", Icon: Landmark },
    { label: "Mobile Recharge", Icon: Smartphone },
    { label: "Credit Card", Icon: CreditCard },
    { label: "All Bills", Icon: LayoutGrid },
  ];

  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="bg-warn px-3 py-1 text-center text-[11px] font-semibold text-white">Paytm today, recreated as a simple mock</div>
        <AppHeader title={<Wordmark className="text-[20px]" />} onBack={() => showToast(msg)} />
        <SuccessHeader />
        <div className="space-y-4 px-4 pb-8">
          <section className="relative rounded-2xl bg-card p-4 text-center">
            <Order n={2} />
            <div className="text-[15px] font-semibold">Enjoying Paytm? Rate us</div>
            <div className="mt-2 flex justify-center gap-1.5 text-[#f5b301]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={24} />
              ))}
            </div>
            <button type="button" onClick={() => showToast(msg)} className="mt-2 text-[13px] font-semibold text-muted">
              Later
            </button>
          </section>

          <button
            type="button"
            onClick={() => showToast(msg)}
            className="relative flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#3b1d8f] to-[#6b2fd6] p-4 text-left text-white"
          >
            <Order n={3} />
            <Gift size={28} />
            <span>
              <span className="block text-[15px] font-bold">You won a scratch card</span>
              <span className="block text-[12px] opacity-80">Plus win up to 10,000 coins on bills</span>
            </span>
          </button>

          <section className="relative rounded-2xl border border-line p-4">
            <Order n={4} />
            <h2 className="mb-3 text-[15px] font-semibold">Recommended services</h2>
            <div className="grid grid-cols-4 gap-y-4">
              {grid.map(({ label, Icon }) => (
                <button key={label} type="button" onClick={() => showToast(msg)} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-navy">
                    <Icon size={20} />
                  </span>
                  <span className="text-[11px] leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {popup ? (
        <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Postpaid offer">
          <div className="anim-fade absolute inset-0 bg-black/50" />
          <div className="anim-sheet relative rounded-t-3xl bg-white px-5 pb-6 pt-5 text-center">
            <Order n={1} />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPopup(false)}
              className="absolute right-4 top-4 rounded-full bg-card p-1.5"
            >
              <X size={18} />
            </button>
            <div className="text-[13px] font-semibold text-muted">
              <Wordmark /> Postpaid
            </div>
            <div className="mt-2 text-[20px] font-bold leading-tight">Pay bills with Postpaid. Win coins.</div>
            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-2xl bg-warn-soft px-5 py-3 text-warn">
              <Coins size={26} />
              <span className="text-left">
                <span className="block text-[12px]">Earn up to</span>
                <span className="block text-[22px] font-extrabold leading-none">10,000 coins</span>
              </span>
            </div>
            <Button className="mt-5" onClick={() => showToast(msg)}>
              Set up your account
            </Button>
            <div className="mt-2 text-[11px] text-muted">Close the pop-up to see what comes next</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
