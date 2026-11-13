"use client";

import { Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { bills, board, findCard } from "@/lib/seed";
import { effectiveVariant, type PayMethod } from "@/lib/journey";
import { AppHeader, Button } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { PayMethodPicker } from "@/components/ui/PayMethodPicker";
import { Test4Offer } from "@/components/ui/Test4Offer";

export function S3BillFetched() {
  const { state, dispatch } = useJourney();
  const [pinOpen, setPinOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>("upi");
  const card = findCard(method);
  const bill = bills.nov;

  const onPinDone = useCallback(() => {
    setPinOpen(false);
    dispatch({ type: "PAYMENT_STARTED", bill: "nov", method });
  }, [dispatch, method]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Electricity bill" onBack={() => dispatch({ type: "GOTO", screen: 2 })} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="anim-rise flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-[13px] font-semibold text-ok">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
          Biller is online. Bill found.
        </div>

        <section className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-[15px] font-semibold">
                {board.short}, {board.area}
              </div>
              <div className="text-[12px] text-muted">Consumer number {board.consumerNumber}</div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-[13px]">
            <dt className="text-muted">Name on bill</dt>
            <dd className="text-right font-semibold">{board.maskedName}</dd>
            <dt className="text-muted">Bill for</dt>
            <dd className="text-right font-semibold">{bill.month} 2026</dd>
            <dt className="text-muted">Due date</dt>
            <dd className="text-right font-semibold">{bill.dueLong}</dd>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-[13px] text-muted">Amount due</span>
            <span className="text-[26px] font-bold">{rupees(bill.amount)}</span>
          </div>
          <p className="mt-1 text-[12px] text-warn">{board.short} may add a late fee if it is paid after {bill.due}.</p>
        </section>

        <Test4Offer variant={effectiveVariant(state)} />

        <PayMethodPicker value={method} onChange={setMethod} amount={bill.amount} />
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button onClick={() => setPinOpen(true)}>Pay {rupees(bill.amount)}</Button>
      </div>

      <DemoPinSheet
        open={pinOpen}
        amount={bill.amount}
        payee={`${board.short} electricity, ${bill.month}`}
        purpose={card ? `Paying with ${card.name} •• ${card.last4}` : "Paying by UPI"}
        onClose={() => setPinOpen(false)}
        onDone={onPinDone}
      />
    </div>
  );
}
