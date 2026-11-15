"use client";

import { BellRing, CircleCheck, Clock, Gift, Repeat, RotateCcw, Sparkles, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { profileFor } from "@/lib/bills";
import { cardReward, findCard, refundDeadline, test4Offers } from "@/lib/seed";
import { amountFor, effectiveVariant, pointsThisYear } from "@/lib/journey";
import { RewardsPopup } from "@/components/ui/RewardsPopup";
import { AutoPaySetup } from "@/components/ui/AutoPaySetup";
import { AppHeader, Button } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { StatusTracker, type StepState } from "@/components/ui/StatusTracker";

type Phase = "paid" | "sent" | "confirmed" | "stuck" | "refunded";

/** Screen 4: live status for the first payment. Same design for electricity, metro card and card bill. */
export function S4LiveStatus() {
  const { state, dispatch, showToast } = useJourney();
  const p = profileFor(state.segment);
  const amount = amountFor(state, "nov");
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

  // Paid by credit card: the card's reward pops up a moment after the payment is confirmed.
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const card = p.allowCard ? findCard(state.payMethods.nov) : undefined;
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
      `Sent to ${p.biller}`,
      phase === "stuck" || phase === "refunded" ? `Waiting for ${p.confirmer}` : p.sentSub,
      phase === "paid" ? "active" : phase === "stuck" ? "stuck" : phase === "refunded" ? "stuck" : "done",
    ),
    step(p.confirmedStep, phase === "confirmed" ? p.confirmedSub : undefined, phase === "confirmed" ? "done" : phase === "sent" ? "active" : "waiting"),
  ];

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Payment status" onBack={() => dispatch({ type: "GOTO", screen: 3 })} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="text-center">
          <div className="text-[13px] text-muted">
            {p.billName}, {p.label.nov}
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
                <div className="text-[15px] font-bold">{p.confirmedTitle}</div>
                <div className="text-[12px] text-muted">{p.reference}</div>
                {variant === "cashback" ? (
                  <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-warn">
                    <Gift size={13} /> ₹25 cashback is on its way
                  </div>
                ) : null}
                {variant === "card_rewards" && p.kind === "cardbill" ? (
                  <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-warn">
                    <Sparkles size={13} /> 500 bonus reward points added to your card
                  </div>
                ) : null}
              </div>
            </div>

            <section className="anim-rise rounded-2xl border-2 border-sky p-4" style={{ animationDelay: "250ms" }}>
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <BellRing size={18} className="text-sky" /> {p.reminderTitle}
              </div>
              <p className="mt-1.5 text-[14px] leading-snug">{p.reminderBody}</p>
              <p className="mt-1.5 text-[12px] text-muted">{p.reminderRule}</p>
              <Button className="mt-3" onClick={() => dispatch({ type: "REMINDER_CHOICE", value: "yes" })}>
                Got it
              </Button>
            </section>

            <section className="anim-rise rounded-2xl bg-card p-4" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <Repeat size={18} className="text-sky" /> {p.earlyTitle}
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{p.earlyBody}</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  dispatch({ type: "LOG", name: "autopay_setup_opened", detail: "from screen 4, after payment 1" });
                  setAutopayOpen(true);
                }}
              >
                Set up {p.autopayName}
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
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => {
                setPhase("refunded");
                dispatch({ type: "REFUNDED", bill: "nov" });
              }}
            >
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
              <p className="mt-1.5 text-[13px] leading-snug">Refunded automatically, within 24 hours as promised. {p.stillDue}</p>
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
            profile={p}
            onBack={() => setAutopayOpen(false)}
            onNotNow={() => setAutopayOpen(false)}
            onConfirm={(cap) => {
              dispatch({ type: "AUTOPAY_SET_UP", cap, source: "early" });
              showToast(`${p.autopayName} is on. No reminders needed.`);
            }}
            intro={
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                  <Repeat size={26} />
                </div>
                <h1 className="mt-3 text-[20px] font-bold leading-tight">{p.earlyIntroTitle}</h1>
                <p className="mt-1 text-[14px] text-muted">{p.earlyIntroBody}</p>
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
          onClose={() => setShowReward(false)}
        />
      ) : null}

      <DemoPinSheet
        open={pinOpen}
        amount={amount}
        payee={`${p.billName}, ${p.label.nov}`}
        onClose={() => setPinOpen(false)}
        onDone={onRetryPin}
      />
    </div>
  );
}
