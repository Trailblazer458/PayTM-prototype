"use client";

import { CircleCheck, Repeat } from "lucide-react";
import { useCallback } from "react";
import { useJourney } from "@/hooks/useJourney";
import { canOfferAutopay } from "@/lib/journey";
import { rupees } from "@/lib/format";
import { bills, board } from "@/lib/seed";
import { AppHeader, Button } from "@/components/ui/kit";
import { AutoPaySetup } from "@/components/ui/AutoPaySetup";

function PaidTwice() {
  return (
    <div className="mt-3 flex gap-2">
      {[bills.nov, bills.dec].map((b) => (
        <div key={b.month} className="flex flex-1 items-center gap-1.5 rounded-xl bg-ok-soft px-2.5 py-2 text-[12px] font-semibold">
          <CircleCheck size={15} className="text-ok" /> {b.month.slice(0, 3)} {rupees(b.amount)} on time
        </div>
      ))}
    </div>
  );
}

/** She already chose AutoPay on screen 4, so there is nothing to offer. */
function AlreadyOn({ cap }: { cap: number }) {
  const { dispatch } = useJourney();
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Electricity bill" onBack={() => dispatch({ type: "GOTO", screen: 5 })} />
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
          <Repeat size={26} />
        </div>
        <h1 className="mt-3 text-[20px] font-bold leading-tight">Electricity is on autopilot</h1>
        <p className="mt-1 text-[14px] text-muted">
          You set up AutoPay after your first payment. December was paid by AutoPay, on time.
        </p>
        <PaidTwice />
        <dl className="mt-5 grid grid-cols-2 gap-y-2 rounded-2xl bg-card p-4 text-[13px]">
          <dt className="text-muted">Bill</dt>
          <dd className="text-right font-semibold">{board.short} electricity</dd>
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

  const onConfirm = useCallback(
    (cap: number) => {
      dispatch({ type: "AUTOPAY_SET_UP", cap, source: "offer" });
      showToast(`AutoPay is on. Never more than ${rupees(cap)}.`);
    },
    [dispatch, showToast],
  );

  if (state.autopay.status === "active" && state.autopay.setUpAfter === 1) {
    return <AlreadyOn cap={state.autopay.cap ?? 0} />;
  }

  if (!canOfferAutopay(state)) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center text-[14px] text-muted">
        AutoPay is offered only after two confirmed payments on Paytm.
      </div>
    );
  }

  return (
    <AutoPaySetup
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
          <h1 className="mt-3 text-[20px] font-bold leading-tight">
            You&apos;ve paid electricity on Paytm two months in a row. Put it on autopilot?
          </h1>
          <PaidTwice />
        </>
      }
    />
  );
}
