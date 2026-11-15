"use client";

import { CircleCheck, Repeat } from "lucide-react";
import { useCallback } from "react";
import { useJourney } from "@/hooks/useJourney";
import { amountFor, canOfferAutopay } from "@/lib/journey";
import { profileFor, type BillProfile } from "@/lib/bills";
import { rupees } from "@/lib/format";
import { AppHeader, Button } from "@/components/ui/kit";
import { AutoPaySetup } from "@/components/ui/AutoPaySetup";

/** The two payments that earned the offer. */
function PaidTwice({ p }: { p: BillProfile }) {
  const { state } = useJourney();
  return (
    <div className="mt-3 flex gap-2">
      {(["nov", "dec"] as const).map((b) => (
        <div key={b} className="flex flex-1 items-center gap-1.5 rounded-xl bg-ok-soft px-2.5 py-2 text-[12px] font-semibold">
          <CircleCheck size={15} className="shrink-0 text-ok" /> {b === "nov" ? "Nov" : "Dec"} {rupees(amountFor(state, b))} on time
        </div>
      ))}
    </div>
  );
}

/** She already chose AutoPay (or auto top-up) on screen 4, so there is nothing to offer. */
function AlreadyOn({ p, cap }: { p: BillProfile; cap: number }) {
  const { dispatch } = useJourney();
  return (
    <div className="flex h-full flex-col">
      <AppHeader title={p.billName} onBack={() => dispatch({ type: "GOTO", screen: 5 })} />
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
          <Repeat size={26} />
        </div>
        <h1 className="mt-3 text-[20px] font-bold leading-tight">{p.autopayName} is on</h1>
        <p className="mt-1 text-[14px] text-muted">
          You set it up after your first payment. December was paid by {p.autopayName}, on time.
        </p>
        <PaidTwice p={p} />
        <dl className="mt-5 grid grid-cols-2 gap-y-2 rounded-2xl bg-card p-4 text-[13px]">
          <dt className="text-muted">Bill</dt>
          <dd className="text-right font-semibold">{p.billName}</dd>
          <dt className="text-muted">Limit</dt>
          <dd className="text-right font-semibold">{rupees(cap)} a month</dd>
          <dt className="text-muted">Before each debit</dt>
          <dd className="text-right font-semibold">A message 24 hours ahead</dd>
        </dl>
        <p className="mt-3 text-[12px] text-muted">Change the limit or cancel any time from Bills.</p>
      </div>
      <div className="shrink-0 border-t border-line p-4">
        <Button onClick={() => dispatch({ type: "NEXT" })}>Continue</Button>
      </div>
    </div>
  );
}

export function S6AutoPay() {
  const { state, dispatch, showToast } = useJourney();
  const p = profileFor(state.segment);

  const onConfirm = useCallback(
    (cap: number) => {
      dispatch({ type: "AUTOPAY_SET_UP", cap, source: "offer" });
      showToast(`${p.autopayName} is on. Never more than ${rupees(cap)} a month.`);
    },
    [dispatch, showToast, p.autopayName],
  );

  if (state.autopay.status === "active" && state.autopay.setUpAfter === 1) {
    return <AlreadyOn p={p} cap={state.autopay.cap ?? 0} />;
  }

  if (!canOfferAutopay(state)) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center text-[14px] text-muted">
        {p.autopayName} is offered only after two confirmed payments on Paytm.
      </div>
    );
  }

  return (
    <AutoPaySetup
      profile={p}
      onBack={() => dispatch({ type: "GOTO", screen: 5 })}
      onConfirm={onConfirm}
      onNotNow={() => {
        dispatch({ type: "AUTOPAY_DECLINED" });
        showToast("No problem. You can turn it on any time from Bills.");
      }}
      intro={
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
            <Repeat size={26} />
          </div>
          <h1 className="mt-3 text-[20px] font-bold leading-tight">{p.offerTitle}</h1>
          <PaidTwice p={p} />
        </>
      }
    />
  );
}
