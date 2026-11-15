"use client";

import { BellRing, CircleCheck, Clock, Gift, Repeat, RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { bills, board, cardReward, findCard, refundDeadline, test4Offers } from "@/lib/seed";
import { effectiveVariant, pointsThisYear } from "@/lib/journey";
import { RewardsPopup } from "@/components/ui/RewardsPopup";
import { AutoPaySetup } from "@/components/ui/AutoPaySetup";
import { AppHeader, Button } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { StatusTracker, type StepState } from "@/components/ui/StatusTracker";

type Phase = "paid" | "sent" | "confirmed" | "stuck" | "refunded";

export function S4LiveStatus() {
  const { state, dispatch, showToast } = useJourney();
  const amount = bills.nov.amount;
  const alreadyConfirmed = state.payments.nov === "confirmed";
  const [phase, setPhase] = useState<Phase>(alreadyConfirmed ? "confirmed" : state.payments.nov === "refunded" ? "refunded" : "paid");
  const [attempt, setAttempt] = useState(1);
  const [pinOpen, setPinOpen] = useState(false);
  const [autopayOpen, setAutopayOpen] = useState(false);
  const started = useRef(false);

  // Arrived by the presenter's Next with nothing paid yet: start the payment so the story still works.
  useEffect(() => {
    if (!started.current && state.payments.nov === "none") {
      started.current = true;
      dispatch({ type: "PAYMENT_STARTED", bill: "nov" });
    }
  }, [state.payments.nov, dispatch]);

  // Animate the tracker over about 4 seconds. Runs once per attempt.
  const failRef = useRef(state.toggles.failurePath);
  failRef.current = state.toggles.failurePath;
  const startPhase = useRef(phase);
  useEffect(() => {
    if (attempt === 1 && startPhase.current !== "paid") return;
    const fail = failRef.current && attempt === 1;
    const t1 = setTimeout(() => setPhase("sent"), 1300);
    const t2 = setTimeout(
      () => {
        if (fail) {
          setPhase("stuck");
          dispatch({ type: "PAYMENT_FAILED", bill: "nov" });
        } else {
          setPhase("confirmed");
          setJustConfirmed(true);
          dispatch({ type: "PAYMENT_CONFIRMED", bill: "nov" });
        }
      },
      fail ? 3600 : 4000,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [attempt, dispatch]);

  // Paid by credit card: the card's reward pops up a moment after the board confirms.
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const card = findCard(state.payMethods.nov);
  const variant = effectiveVariant(state);
  const bonus = variant === "card_rewards" && card ? test4Offers.card_rewards.split(" when ")[0] : undefined;
  useEffect(() => {
    if (!justConfirmed || !card) return;
    const t = setTimeout(() => {
      setShowReward(true);
      dispatch({ type: "LOG", name: "card_rewards_credited", detail: cardReward(card, amount) });
    }, 700);
    return () => clearTimeout(t);
  }, [justConfirmed, card, amount, dispatch]);

  const onRetryPin = useCallback(() => {
    setPinOpen(false);
    dispatch({ type: "PAYMENT_STARTED", bill: "nov" });
    setAttempt((a) => a + 1);
    setPhase("paid");
  }, [dispatch]);

  const step = (label: string, sub: string | undefined, s: StepState) => ({ label, sub, state: s });
  const steps = [
    step("Paid", card ? `${rupees(amount)} from your ${card.name} •• ${card.last4}` : `${rupees(amount)} by UPI from your bank account`, "done"),
    step(
      `Sent to ${board.short}`,
      phase === "stuck" || phase === "refunded" ? "Waiting for the board" : "Board received the payment",
      phase === "paid" ? "active" : phase === "stuck" ? "stuck" : phase === "refunded" ? "stuck" : "done",
    ),
    step(
      "Confirmed by the board",
      phase === "confirmed" ? "Your account with the board is updated" : undefined,
      phase === "confirmed" ? "done" : phase === "sent" ? "active" : "waiting",
    ),
  ];

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Payment status" onBack={() => dispatch({ type: "GOTO", screen: 3 })} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="text-center">
          <div className="text-[13px] text-muted">
            {board.short} electricity, {bills.nov.month}
          </div>
          <div className="text-[28px] font-bold">{rupees(amount)}</div>
        </div>

        <section className="rounded-2xl bg-card p-4">
          <StatusTracker steps={steps} />
        </section>

        {phase === "confirmed" ? (
          <>
            <div className="anim-rise flex items-start gap-2.5 rounded-2xl bg-ok-soft p-4">
              <CircleCheck size={22} className="shrink-0 text-ok" />
              <div>
                <div className="text-[15px] font-bold">Your {board.short} bill is paid and confirmed.</div>
                <div className="text-[12px] text-muted">Board reference UP2611130042</div>
                {variant === "cashback" ? (
                  <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-warn">
                    <Gift size={13} /> ₹25 cashback is on its way
                  </div>
                ) : null}
              </div>
            </div>

            <section className="anim-rise rounded-2xl border-2 border-sky p-4" style={{ animationDelay: "250ms" }}>
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <BellRing size={18} className="text-sky" /> Reminder is on for next month
              </div>
              <p className="mt-1.5 text-[14px] leading-snug">
                You&apos;ll be reminded for the bill next month. To turn this off, go to Settings &gt; Notifications.
              </p>
              <p className="mt-1.5 text-[12px] text-muted">At most 2 reminders a month, only when a bill is unpaid and due.</p>
              <Button className="mt-3" onClick={() => dispatch({ type: "REMINDER_CHOICE", value: "yes" })}>
                Got it
              </Button>
            </section>

            <section className="anim-rise rounded-2xl bg-card p-4" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <Repeat size={18} className="text-sky" /> Avoid reminders and set up AutoPay
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                Paytm pays this bill on the due date, within a limit you pick. You get a message 24 hours before each debit.
              </p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  dispatch({ type: "LOG", name: "autopay_setup_opened", detail: "from screen 4, after payment 1" });
                  setAutopayOpen(true);
                }}
              >
                Set up AutoPay
              </Button>
            </section>
          </>
        ) : null}

        {phase === "stuck" ? (
          <section className="anim-rise rounded-2xl border-2 border-warn/40 bg-warn-soft p-4">
            <div className="flex items-center gap-2 text-[15px] font-bold text-warn">
              <Clock size={18} /> Not confirmed yet
            </div>
            <p className="mt-1.5 text-[14px] leading-snug">
              We are retrying. If it is not confirmed by {refundDeadline}, {rupees(amount)} comes back to your account
              automatically.
            </p>
            <p className="mt-2 text-[12px] text-muted">You do not need to call anyone or raise a complaint.</p>
            <Button variant="ghost" className="mt-3" onClick={() => {
              setPhase("refunded");
              dispatch({ type: "REFUNDED", bill: "nov" });
            }}>
              Skip to tomorrow, {refundDeadline.replace(" tomorrow", "")}
            </Button>
          </section>
        ) : null}

        {phase === "refunded" ? (
          <section className="anim-rise space-y-3">
            <div className="rounded-2xl bg-ok-soft p-4">
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <Undo2 size={18} className="text-ok" /> {rupees(amount)} is back in your account
              </div>
              <p className="mt-1.5 text-[13px] leading-snug">
                Refunded automatically, within 24 hours as promised. Your {board.short} bill is still due on {bills.nov.dueLong}.
              </p>
            </div>
            <Button onClick={() => setPinOpen(true)}>
              <RotateCcw size={17} /> Try again now
            </Button>
          </section>
        ) : null}
      </div>

      {autopayOpen ? (
        <div className="anim-sheet absolute inset-0 z-30">
          <AutoPaySetup
            onBack={() => setAutopayOpen(false)}
            onNotNow={() => setAutopayOpen(false)}
            onConfirm={(cap) => {
              dispatch({ type: "AUTOPAY_SET_UP", cap, source: "early" });
              showToast("AutoPay is on. No reminders needed for this bill.");
            }}
            intro={
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                  <Repeat size={26} />
                </div>
                <h1 className="mt-3 text-[20px] font-bold leading-tight">Skip the reminders. Put electricity on AutoPay</h1>
                <p className="mt-1 text-[14px] text-muted">
                  From December, Paytm pays your {board.short} bill on the due date, within the limit you pick.
                </p>
              </>
            }
          />
        </div>
      ) : null}

      {showReward && card ? (
        <RewardsPopup
          card={card}
          amount={amount}
          bonus={bonus}
          yearTotal={state.segment === "S4" ? pointsThisYear(state) : undefined}
          onClose={() => setShowReward(false)} />
      ) : null}

      <DemoPinSheet
        open={pinOpen}
        amount={amount}
        payee={`${board.short} electricity, ${bills.nov.month}`}
        onClose={() => setPinOpen(false)}
        onDone={onRetryPin}
      />
    </div>
  );
}
