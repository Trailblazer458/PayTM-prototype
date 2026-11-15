"use client";

import { ChevronRight, CreditCard, FileSearch, Landmark, Plus, Sparkles, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { cardBillProfile } from "@/lib/bills";
import { rupees } from "@/lib/format";
import { effectiveVariant } from "@/lib/journey";
import { cardBill, leadCard, savedCards } from "@/lib/seed";
import { AppHeader, Button } from "@/components/ui/kit";
import { DemoPinSheet } from "@/components/ui/DemoPinSheet";
import { Test4Offer } from "@/components/ui/Test4Offer";

const cardColours: Record<string, string> = {
  saffron: "from-[#f59e0b] to-[#b45309]",
  tarang: "from-[#0ea5e9] to-[#1e3a8a]",
  neelgiri: "from-[#10b981] to-[#065f46]",
};

/** A drawn card face. Fictional banks, last 4 digits only. */
function CardFace({ id, name, last4 }: { id: string; name: string; last4: string }) {
  return (
    <div className={`relative h-[72px] w-[112px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br p-2 text-white shadow ${cardColours[id]}`}>
      <div className="text-[8px] font-bold uppercase tracking-wide opacity-90">{name.split(" ")[0]} Bank</div>
      <div className="mt-2 h-3 w-4 rounded-sm bg-[#ffd56b]/80" />
      <div className="absolute bottom-2 left-2 font-mono text-[9px] tracking-widest">XXXX {last4}</div>
    </div>
  );
}

/** Screen 2 for S4: her saved credit cards. No number to type. */
export function CardPick() {
  const { dispatch, showToast } = useJourney();
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Pay credit card bill" onBack={() => dispatch({ type: "GOTO", screen: 1 })} />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <span className="inline-block rounded-full bg-card px-3 py-1 text-[12px] font-semibold">No extra fees</span>
        <div className="text-[13px] font-semibold text-muted">Your saved cards</div>
        {savedCards.map((c) => {
          const lead = c.id === leadCard.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                lead
                  ? dispatch({ type: "BILLER_ADDED", via: "saved_card" })
                  : showToast(`This demo follows the ${leadCard.name.split(" ")[0]} Bank card`)
              }
              className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left ${
                lead ? "border-sky" : "border-line"
              }`}
            >
              <CardFace id={c.id} name={c.name} last4={c.last4} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold">•• {c.last4}</span>
                <span className="block truncate text-[13px] text-muted">{c.name}</span>
                <span className="mt-1 block text-[12px] font-semibold text-ok">Settles in minutes</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => showToast("Not part of this demo")}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left"
        >
          <FileSearch size={22} className="shrink-0 text-sky" />
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Find your other cards in one tap</span>
            <span className="block text-[12px] text-muted">From your credit report, with your consent</span>
          </span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>
      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button variant="secondary" onClick={() => showToast("Not part of this demo")}>
          <Plus size={18} /> Add new card
        </Button>
      </div>
    </div>
  );
}

type AmountChoice = "total" | "minimum" | "custom";

/** Screen 3 for S4: pick total, minimum or a custom amount, see the guarantee, pay from the bank account. */
export function CardPay() {
  const { state, dispatch } = useJourney();
  const [choice, setChoice] = useState<AmountChoice>("total");
  const [custom, setCustom] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const customValue = Number(custom.replace(/\D/g, ""));
  const amount = choice === "total" ? cardBill.amount : choice === "minimum" ? cardBill.minimum : customValue;
  const valid = amount >= cardBill.minimum && amount <= cardBill.amount;

  const onPinDone = useCallback(() => {
    setPinOpen(false);
    dispatch({ type: "PAYMENT_STARTED", bill: "nov", method: "upi", amount });
  }, [dispatch, amount]);

  const options: { id: AmountChoice; label: string; value?: number }[] = [
    { id: "total", label: "Total due", value: cardBill.amount },
    { id: "minimum", label: "Minimum due", value: cardBill.minimum },
    { id: "custom", label: "Custom amount" },
  ];

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Pay credit card bill" onBack={() => dispatch({ type: "GOTO", screen: 2 })} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="anim-rise flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-[13px] font-semibold text-ok">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
          Saffron Bank is online. Bill found.
        </div>

        <section className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-warn">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="text-[15px] font-bold">•• {leadCard.last4}</div>
              <div className="text-[12px] text-muted">{leadCard.name}</div>
            </div>
          </div>
          <div className="mt-4 text-[14px] font-bold">Select amount</div>
          <div className="text-[12px] text-muted">Due date {cardBill.due} 2026</div>
          <div className="mt-2 divide-y divide-line" role="radiogroup" aria-label="Amount to pay">
            {options.map((o) => {
              const on = choice === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setChoice(o.id)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${on ? "border-sky" : "border-[#b3bfd1]"}`}>
                    {on ? <span className="h-2.5 w-2.5 rounded-full bg-sky" /> : null}
                  </span>
                  <span className="flex-1 text-[15px]">{o.label}</span>
                  {o.value ? <span className="text-[15px] font-bold">{rupees(o.value)}</span> : null}
                </button>
              );
            })}
          </div>
          {choice === "custom" ? (
            <div className="anim-rise">
              <input
                inputMode="numeric"
                autoFocus
                aria-label="Custom amount"
                placeholder={`${rupees(cardBill.minimum)} to ${rupees(cardBill.amount)}`}
                value={custom ? rupees(customValue) : ""}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border-2 border-line bg-white px-4 py-2.5 text-[17px] font-semibold outline-none focus:border-sky"
              />
              {custom && !valid ? (
                <p className="mt-1 text-[12px] text-warn">
                  Pick between {rupees(cardBill.minimum)} and {rupees(cardBill.amount)}.
                </p>
              ) : null}
            </div>
          ) : null}
          {choice !== "total" ? (
            <p className="mt-2 text-[12px] text-warn">Paying less than the total due means the bank charges interest on the rest.</p>
          ) : null}
        </section>

        <div className="flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-[13px] leading-snug">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-warn" />
          This statement earned {cardBill.statementPoints.toLocaleString("en-IN")} points on your card. Pay the total on time to keep
          them and avoid interest.
        </div>

        <Test4Offer variant={effectiveVariant(state)} guarantee={cardBillProfile.guarantee} cardBill />

        <section>
          <h2 className="mb-2 text-[13px] font-semibold text-muted">Pay with</h2>
          <div className="flex items-center gap-3 rounded-xl border-2 border-sky bg-sky-soft px-3 py-2.5">
            <Landmark size={20} className="shrink-0 text-sky" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">UPI</span>
              <span className="block text-[12px] text-muted">Free. Card bills are paid from your bank account</span>
            </span>
            <Zap size={16} className="text-ok" />
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button onClick={() => setPinOpen(true)} disabled={!valid}>
          Pay {rupees(amount || 0)}
        </Button>
      </div>

      <DemoPinSheet
        open={pinOpen}
        amount={amount}
        payee={`${leadCard.name} •• ${leadCard.last4}`}
        purpose="Paying by UPI"
        onClose={() => setPinOpen(false)}
        onDone={onPinDone}
      />
    </div>
  );
}
