"use client";

import { CircleHelp, Info, Loader2, MapPin, TrainFront } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { metroProfile } from "@/lib/bills";
import { rupees } from "@/lib/format";
import type { PayMethod } from "@/lib/journey";
import { findCard, metroCard } from "@/lib/seed";
import { AppHeader, BottomSheet, Button } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { GuaranteePanel } from "@/components/ui/Guarantee";
import { PayMethodPicker } from "@/components/ui/PayMethodPicker";

/** S3: the metro card, as Paytm shows it. Fictional operator "City Metro", fictional card number. */
function MetroHeader({ onChange }: { onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky">
        <TrainFront size={22} />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold">City Metro</div>
        <div className="flex items-center gap-1 text-[12px] text-muted">
          <MapPin size={12} /> Picked from your location
        </div>
      </div>
      <button type="button" onClick={onChange} className="text-[14px] font-semibold text-sky">
        Change
      </button>
    </div>
  );
}

/** A drawn metro card back, with the card number highlighted. Not a real card. */
function SampleMetroCard() {
  return (
    <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label="Back of a sample metro card with the card number highlighted at the bottom">
      <rect x="1" y="1" width="318" height="188" rx="16" fill="#eef2f8" stroke="#c8d1df" />
      <text x="20" y="34" fontSize="13" fontWeight="700" fill="#002e6e">
        City Metro smart card
      </text>
      <text x="300" y="34" fontSize="9" fill="#5b6b85" textAnchor="end">
        SAMPLE
      </text>
      <text x="20" y="62" fontSize="9.5" fill="#5b6b85">
        Tap at the gate to enter and exit.
      </text>
      <text x="20" y="78" fontSize="9.5" fill="#5b6b85">
        Add value at any station machine.
      </text>
      <rect x="20" y="96" width="70" height="38" rx="6" fill="#dfe6f1" />
      <rect x="12" y="142" width="296" height="34" rx="8" fill="#e6f8fe" stroke="#00baf2" strokeWidth="2" />
      <text x="24" y="164" fontSize="10.5" fill="#002e6e" fontWeight="700">
        Card No.
      </text>
      <text x="296" y="165" fontSize="13" fill="#002e6e" fontWeight="800" textAnchor="end" letterSpacing="1">
        {metroCard.fullNumber}
      </text>
    </svg>
  );
}

function formatCard(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8, 10)].filter(Boolean).join(" ");
}

/** Screen 2 for S3: add the metro card with just its number. */
export function MetroAdd() {
  const { state, dispatch, showToast } = useJourney();
  const [whereOpen, setWhereOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const value = formatCard(state.consumerNumber);
  const complete = value.replace(/\D/g, "").length === 10;

  const add = () => {
    if (!complete || checking) return;
    setChecking(true);
    setTimeout(() => dispatch({ type: "BILLER_ADDED", via: "typed" }), 1000);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Metro card" onBack={() => dispatch({ type: "GOTO", screen: 1 })} />
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="text-[13px] font-semibold text-muted">Metro</div>
        <div className="mt-1.5">
          <MetroHeader onChange={() => showToast("The metro list is not part of this demo")} />
        </div>

        <label htmlFor="metro-card" className="mt-5 block text-[13px] font-semibold text-muted">
          Metro card number
        </label>
        <input
          id="metro-card"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          placeholder="10 digit number"
          value={value}
          onChange={(e) => dispatch({ type: "SET_CONSUMER_NUMBER", value: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="mt-1.5 w-full rounded-xl border-2 border-line bg-white px-4 py-3.5 text-[18px] font-semibold tracking-wider outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9aa7bb] focus:border-sky"
        />
        <div className="mt-1.5 text-[12px] text-muted">Printed on the back of your card</div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWhereOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold hover:bg-card"
          >
            <CircleHelp size={16} className="text-sky" /> Where do I find it?
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_CONSUMER_NUMBER", value: metroCard.fullNumber.replace(/\D/g, "") })}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold hover:bg-card"
          >
            Use demo card
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button onClick={add} disabled={!complete || checking}>
          {checking ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Checking with City Metro
            </>
          ) : (
            "Add card"
          )}
        </Button>
      </div>

      <BottomSheet open={whereOpen} onClose={() => setWhereOpen(false)} title="Where to find your card number">
        <p className="mb-3 text-[13px] text-muted">It is the 10 digit number at the bottom of the back of your metro card.</p>
        <SampleMetroCard />
        <Button
          className="mt-4"
          onClick={() => {
            setWhereOpen(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          Got it
        </Button>
      </BottomSheet>
    </div>
  );
}

/** Screen 3 for S3: pick the top-up amount, see the guarantee, pay. */
export function MetroPay() {
  const { dispatch, showToast } = useJourney();
  const [amount, setAmount] = useState(metroCard.topUp);
  const [method, setMethod] = useState<PayMethod>("upi");
  const [pinOpen, setPinOpen] = useState(false);
  const card = findCard(method);
  const valid = amount >= metroCard.minTopUp && amount <= metroCard.maxTopUp && amount % metroCard.step === 0;

  const onPinDone = useCallback(() => {
    setPinOpen(false);
    dispatch({ type: "PAYMENT_STARTED", bill: "nov", method, amount });
  }, [dispatch, method, amount]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Recharge metro card" onBack={() => dispatch({ type: "GOTO", screen: 2 })} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="anim-rise flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-[13px] font-semibold text-ok">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
          City Metro is online. Card found.
        </div>

        <section className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky">
              <TrainFront size={22} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">City Metro</div>
              <div className="text-[12px] text-muted">Card {metroCard.fullNumber}</div>
            </div>
            <button type="button" onClick={() => showToast("Only one card in this demo")} className="text-[14px] font-semibold text-sky">
              Change
            </button>
          </div>

          <label htmlFor="metro-amount" className="mt-4 block text-[13px] font-semibold text-muted">
            Top-up amount
          </label>
          <input
            id="metro-amount"
            inputMode="numeric"
            value={amount ? rupees(amount) : ""}
            onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "").slice(0, 5)) || 0)}
            className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-[26px] font-bold outline-none focus:ring-2 focus:ring-sky"
          />
          <p className={`mt-1.5 text-[12px] ${valid ? "text-muted" : "font-semibold text-warn"}`}>
            Minimum {rupees(metroCard.minTopUp)}, in multiples of {rupees(metroCard.step)}, up to {rupees(metroCard.maxTopUp)}.
          </p>
          <div className="mt-2.5 flex gap-2">
            {[100, 200, 500].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAmount((a) => Math.min(metroCard.maxTopUp, a + n))}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold hover:border-sky"
              >
                + {rupees(n)}
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl bg-sky-soft p-3 text-[12px] leading-snug">
          <Info size={16} className="mt-0.5 shrink-0 text-sky" />
          After topping up, tap your card at the Add Value Machine (AVM) at any station within 180 days to add the balance.
        </div>

        <GuaranteePanel lines={metroProfile.guarantee} />

        <PayMethodPicker value={method} onChange={setMethod} amount={amount} />
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button onClick={() => setPinOpen(true)} disabled={!valid}>
          Top up {rupees(amount)}
        </Button>
      </div>

      <DemoPinSheet
        open={pinOpen}
        amount={amount}
        payee={`City Metro card ${metroCard.number}`}
        purpose={card ? `Paying with ${card.name} •• ${card.last4}` : "Paying by UPI"}
        onClose={() => setPinOpen(false)}
        onDone={onPinDone}
      />
    </div>
  );
}
