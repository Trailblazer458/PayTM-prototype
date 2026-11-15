"use client";

import { CalendarClock, CircleCheck, CreditCard, ExternalLink, Info, Landmark, Repeat, ShieldCheck, TrainFront, Zap } from "lucide-react";
import { StatusTracker, type StepState } from "@/components/ui/StatusTracker";
import { useCallback, useEffect, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { profileFor, type BillProfile } from "@/lib/bills";
import { board, cardReward, findCard, metroCard } from "@/lib/seed";
import { amountFor, pointsThisYear, type PayMethod } from "@/lib/journey";
import { PayMethodPicker } from "@/components/ui/PayMethodPicker";
import { RewardsPopup } from "@/components/ui/RewardsPopup";
import { AppHeader, Button, Wordmark } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { WaBody, WaBubble, WaDate, WaHeader, WaInputBar } from "@/components/ui/WhatsApp";

const kindIcon = { electricity: Zap, metro: TrainFront, cardbill: CreditCard } as const;

/** The second line under the saved bill: how Paytm knows which account it is. */
function savedRef(p: BillProfile): string {
  if (p.kind === "metro") return `City Metro card ${metroCard.fullNumber}`;
  if (p.kind === "cardbill") return "Saffron Bank credit card";
  return `Consumer number ${board.consumerNumber}`;
}

function QuickPay({ p, onClose, onPaid }: { p: BillProfile; onClose: () => void; onPaid: (method: PayMethod) => void }) {
  const [pinOpen, setPinOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>("upi");
  const card = p.allowCard ? findCard(method) : undefined;
  const amount = p.amounts.dec;
  const Icon = kindIcon[p.kind];
  const onPin = useCallback(() => {
    setPinOpen(false);
    onPaid(card ? method : "upi");
  }, [onPaid, method, card]);
  return (
    <div className="anim-sheet absolute inset-0 z-30 flex flex-col bg-white">
      <AppHeader title={<Wordmark className="text-[20px]" />} onBack={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 no-scrollbar">
        <div className="text-[13px] font-semibold text-muted">Your saved {p.kind === "metro" ? "card" : "bill"}</div>
        <section className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky">
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">
                {p.billName}, {p.label.dec}
              </div>
              <div className="text-[12px] text-muted">{savedRef(p)}</div>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-[13px] text-muted">
              {p.kind === "metro" ? "Your usual top-up" : p.kind === "cardbill" ? `Total due, ${p.dueLong.dec}` : `Due ${p.dueLong.dec}`}
            </span>
            <span className="text-[26px] font-bold">{rupees(amount)}</span>
          </div>
        </section>
        <div className="flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2.5 text-[13px] font-semibold">
          <ShieldCheck size={16} className="text-ok" /> Biller is online. Covered by the Paytm Payment Guarantee.
        </div>
        <div className="pb-4">
          {p.allowCard ? (
            <PayMethodPicker value={method} onChange={setMethod} amount={amount} />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border-2 border-sky bg-sky-soft px-3 py-2.5">
              <Landmark size={20} className="shrink-0 text-sky" />
              <span>
                <span className="block text-[14px] font-semibold">UPI</span>
                <span className="block text-[12px] text-muted">Free. Card bills are paid from your bank account</span>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 border-t border-line p-4">
        <Button onClick={() => setPinOpen(true)}>
          {p.kind === "metro" ? "Top up" : "Pay"} {rupees(amount)}
        </Button>
      </div>
      <DemoPinSheet
        open={pinOpen}
        amount={amount}
        payee={`${p.billName}, ${p.label.dec}`}
        purpose={card ? `Paying with ${card.name} •• ${card.last4}` : "Paying by UPI"}
        onClose={() => setPinOpen(false)}
        onDone={onPin}
      />
    </div>
  );
}

/** Same live status UI as screen 4. */
function QuickSuccess({ p, onContinue, instant }: { p: BillProfile; onContinue: () => void; instant: boolean }) {
  const { state, dispatch } = useJourney();
  const [phase, setPhase] = useState<"paid" | "sent" | "confirmed">(instant ? "confirmed" : "paid");
  const [showReward, setShowReward] = useState(false);
  const card = p.allowCard ? findCard(state.payMethods.dec) : undefined;
  const amount = p.amounts.dec;

  // Paid by credit card: the card's reward pops up a moment after the payment is confirmed.
  useEffect(() => {
    if (instant || phase !== "confirmed" || !card) return;
    const t = setTimeout(() => {
      setShowReward(true);
      dispatch({ type: "LOG", name: "card_rewards_credited", detail: cardReward(card, amount) });
    }, 700);
    return () => clearTimeout(t);
  }, [instant, phase, card, amount, dispatch]);
  useEffect(() => {
    if (instant) return;
    const t1 = setTimeout(() => setPhase("sent"), 1300);
    const t2 = setTimeout(() => setPhase("confirmed"), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [instant]);

  const steps: { label: string; sub?: string; state: StepState }[] = [
    {
      label: "Paid",
      sub: card ? `${rupees(amount)} from your ${card.name} •• ${card.last4}` : `${rupees(amount)} by UPI from your bank account`,
      state: "done",
    },
    { label: `Sent to ${p.biller}`, sub: p.sentSub, state: phase === "paid" ? "active" : "done" },
    {
      label: p.confirmedStep,
      sub: phase === "confirmed" ? p.confirmedSub : undefined,
      state: phase === "confirmed" ? "done" : phase === "sent" ? "active" : "waiting",
    },
  ];

  return (
    <div className="anim-fade absolute inset-0 z-30 flex flex-col bg-white">
      <AppHeader title="Payment status" />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="text-center">
          <div className="text-[13px] text-muted">
            {p.billName}, {p.label.dec}
          </div>
          <div className="text-[28px] font-bold">{rupees(amount)}</div>
        </div>
        <section className="rounded-2xl bg-card p-4">
          <StatusTracker steps={steps} />
        </section>
        {phase === "confirmed" ? (
          <div className="anim-rise flex items-start gap-2.5 rounded-2xl bg-ok-soft p-4">
            <CircleCheck size={22} className="shrink-0 text-ok" />
            <div>
              <div className="text-[15px] font-bold">{p.confirmedTitle}</div>
              <div className="text-[12px] text-muted">{p.quickPaidSub}</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="shrink-0 border-t border-line p-4">
        <Button onClick={onContinue} disabled={phase !== "confirmed"}>
          Continue
        </Button>
      </div>
      {showReward && card ? (
        <RewardsPopup
          card={card}
          amount={amount}
          yearTotal={state.segment === "S4" ? pointsThisYear(state) : undefined}
          onClose={() => setShowReward(false)}
        />
      ) : null}
    </div>
  );
}

/** Makes the jump in time clear: the cue arrives about a month after the first payment. */
function MonthLater({ onContinue, date, text, cta }: { onContinue: () => void; date: string; text: string; cta: string }) {
  return (
    <div className="anim-fade absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b2a5b] to-[#13407f] px-7 text-center text-white">
      <div className="anim-pop flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
        <CalendarClock size={34} />
      </div>
      <div className="mt-5 text-[13px] font-semibold uppercase tracking-wider text-sky">One month later</div>
      <div className="mt-1 text-[28px] font-bold leading-tight">{date}</div>
      <p className="mt-3 text-[15px] leading-snug text-white/85">{text}</p>
      <Button className="mt-7" onClick={onContinue}>
        {cta}
      </Button>
    </div>
  );
}

const paytmAvatar = (
  <span className="text-[10px] font-extrabold">
    <span className="text-navy">Pay</span>
    <span className="text-sky">tm</span>
  </span>
);

/** Last month's confirmation, at the top of the chat. */
function FirstPaymentBubble({ p, extra }: { p: BillProfile; extra?: string }) {
  const { state } = useJourney();
  return (
    <>
      <WaDate>13 November 2026</WaDate>
      <WaBubble time="9:46 am">
        {p.billName}: {rupees(amountFor(state, "nov"))} paid and confirmed by {p.confirmer}.{extra ? ` ${extra}` : ""}
      </WaBubble>
    </>
  );
}

/**
 * Branch: she chose AutoPay (or auto top-up) on screen 4 after her first payment.
 * No "Pay now" reminder. Paytm sends a heads-up 24 hours before the debit, then confirms it.
 */
function AutoPayChat({ p }: { p: BillProfile }) {
  const { state, dispatch, showToast } = useJourney();
  const cap = state.autopay.cap ?? 0;
  const decPaid = state.payments.dec === "confirmed";
  const [showJump, setShowJump] = useState(!decPaid);
  const [debited, setDebited] = useState(decPaid);

  return (
    <div className="relative flex h-full flex-col">
      <WaHeader name="Paytm Bill Payments" sub="Business account" verified avatar={paytmAvatar} />
      <WaBody>
        <FirstPaymentBubble p={p} extra={`${p.autopayName} is on, with a limit of ${rupees(cap)}.`} />
        <WaDate>{p.jumpDate}</WaDate>
        <div className="anim-rise max-w-[86%] self-start overflow-hidden rounded-xl rounded-tl-sm bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-sky-soft px-3 py-2.5 text-[13px] font-bold text-navy">
            <Repeat size={16} className="text-sky" /> {p.autopayHeadsUpHeader}
          </div>
          <div className="px-3 pb-1.5 pt-2 text-[14px] leading-snug text-[#111b21]">
            {p.autopayHeadsUp(cap)}
            <div className="mt-0.5 text-right text-[10px] text-[#667781]">10:02 am</div>
          </div>
          <button
            type="button"
            onClick={() => showToast(`Pause or cancel ${p.autopayName} any time from Bills`)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[#e9edef] py-2.5 text-[14px] font-semibold text-[#00a884] hover:bg-[#f5f6f6]"
          >
            <ExternalLink size={15} /> Manage {p.autopayName}
          </button>
        </div>

        {debited ? (
          <WaBubble time="9:15 am">
            <span className="font-semibold">{p.autopayDone}</span> Confirmed by {p.confirmer}.
          </WaBubble>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDebited(true);
              dispatch({ type: "PAYMENT_CONFIRMED", bill: "dec", via: "autopay" });
            }}
            className="mx-auto mt-2 rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-white shadow"
          >
            Skip to {p.autopayDebitDay}, the debit day
          </button>
        )}

        <div className="mx-auto mt-auto flex max-w-[92%] items-start gap-1.5 rounded-lg bg-[#fff8c5] px-3 py-2 text-[11px] leading-snug text-[#54656f]">
          <Info size={13} className="mt-px shrink-0" /> Sent 24 hours before each {p.autopayName} debit. No reminders needed.
        </div>
      </WaBody>
      {debited ? (
        <div className="shrink-0 border-t border-line bg-white p-3">
          <Button onClick={() => dispatch({ type: "NEXT" })}>Continue</Button>
        </div>
      ) : (
        <WaInputBar />
      )}

      {showJump ? (
        <MonthLater
          date={p.jumpDate}
          onContinue={() => setShowJump(false)}
          text={`${p.autopayName} is on, so Paytm sends a heads-up on WhatsApp the day before it pays.`}
          cta="Show the WhatsApp heads-up"
        />
      ) : null}
    </div>
  );
}

export function S5WhatsAppReminder() {
  const { state } = useJourney();
  const p = profileFor(state.segment);
  if (state.autopay.status === "active" && state.autopay.setUpAfter === 1) return <AutoPayChat p={p} />;
  return <ReminderChat p={p} />;
}

function ReminderChat({ p }: { p: BillProfile }) {
  const { state, dispatch } = useJourney();
  const [view, setView] = useState<"chat" | "pay" | "done">("chat");
  const decPaid = state.payments.dec === "confirmed";
  // Coming back to this screen after paying: show the confirmed status straight away.
  const [paidBeforeOpen] = useState(decPaid);
  // Show the time jump on the way in, unless December is already paid (coming back from screen 6).
  const [showJump, setShowJump] = useState(!decPaid);
  const Icon = kindIcon[p.kind];

  const onPaid = useCallback(
    (method: PayMethod) => {
      dispatch({ type: "PAY_METHOD_CHOSEN", bill: "dec", method });
      dispatch({ type: "PAYMENT_CONFIRMED", bill: "dec" });
      setView("done");
    },
    [dispatch],
  );

  return (
    <div className="relative flex h-full flex-col">
      <WaHeader name="Paytm Bill Payments" sub="Business account" verified avatar={paytmAvatar} />
      <WaBody>
        <FirstPaymentBubble p={p} />
        <WaDate>{p.jumpDate}</WaDate>
        <div className="anim-rise max-w-[86%] self-start overflow-hidden rounded-xl rounded-tl-sm bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-sky-soft px-3 py-2.5 text-[13px] font-bold text-navy">
            <Icon size={16} className="text-sky" /> {p.cueHeader}
          </div>
          <div className="px-3 pb-1.5 pt-2 text-[14px] leading-snug text-[#111b21]">
            {p.cueText}
            <div className="mt-0.5 text-right text-[10px] text-[#667781]">10:02 am</div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (decPaid) {
                setView("done");
                return;
              }
              dispatch({ type: "PAYMENT_STARTED", bill: "dec" });
              setView("pay");
            }}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[#e9edef] py-2.5 text-[14px] font-semibold text-[#00a884] hover:bg-[#f5f6f6]"
          >
            <ExternalLink size={15} /> {p.kind === "metro" ? "Top up now" : "Pay now"}
          </button>
        </div>
        <div className="mx-auto mt-auto flex max-w-[92%] items-start gap-1.5 rounded-lg bg-[#fff8c5] px-3 py-2 text-[11px] leading-snug text-[#54656f]">
          <Info size={13} className="mt-px shrink-0" /> {p.cueNote}
        </div>
      </WaBody>
      <WaInputBar />

      {showJump ? <MonthLater date={p.jumpDate} text={p.jumpText} cta={p.jumpCta} onContinue={() => setShowJump(false)} /> : null}
      {view === "pay" ? <QuickPay p={p} onClose={() => setView("chat")} onPaid={onPaid} /> : null}
      {view === "done" ? <QuickSuccess p={p} instant={paidBeforeOpen} onContinue={() => dispatch({ type: "NEXT" })} /> : null}
    </div>
  );
}
