"use client";

import {
  Car,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Gift,
  Landmark,
  LayoutGrid,
  Repeat,
  Router,
  Satellite,
  Share2,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { effectiveVariant, type RewardVariant } from "@/lib/journey";
import { rupees } from "@/lib/format";
import { bills, board, cardReward, leadCard, otherBills, persona, recharge, savedCards, test4Offers } from "@/lib/seed";
import { PaytmToday } from "./PaytmToday";
import { AppHeader, BottomSheet, Button, Wordmark } from "@/components/ui/kit";

const NOT_IN_DEMO = "Not part of this demo";

export function SuccessHeader() {
  const { showToast } = useJourney();
  return (
    <div className="px-5 pb-5 pt-6 text-center">
      <div className="anim-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok text-white shadow-[0_8px_24px_-6px_rgba(18,161,80,0.6)]">
        <Check size={36} strokeWidth={3} />
      </div>
      <h1 className="mt-3 text-[20px] font-bold leading-tight">
        {rupees(recharge.amount)} recharge successful for {recharge.forName}
      </h1>
      <p className="mt-1 text-[13px] text-muted">
        {recharge.operator} prepaid {recharge.number}. {recharge.plan}.
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <Button variant="ghost" full={false} className="!py-1.5 !text-[13px]" onClick={() => showToast(NOT_IN_DEMO)}>
          <Download size={15} /> Receipt
        </Button>
        <Button variant="ghost" full={false} className="!py-1.5 !text-[13px]" onClick={() => showToast(NOT_IN_DEMO)}>
          <Share2 size={15} /> Share
        </Button>
      </div>
    </div>
  );
}

/** S4: the simple card rewards sheet. The seconds spent on it are a Want stage signal. */
function CardRewardsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const amount = bills.nov.amount;
  return (
    <BottomSheet open={open} onClose={onClose} title="Card rewards on this bill">
      <p className="text-[13px] text-muted">
        What each of your saved credit cards earns on your {rupees(amount)} {board.short} bill.
      </p>
      <ul className="mt-3 space-y-2">
        {savedCards.map((c, i) => (
          <li
            key={c.id}
            className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 ${i === 0 ? "border-sky bg-sky-soft" : "border-line"}`}
          >
            <CreditCard size={20} className="shrink-0 text-sky" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">
                {c.name} •• {c.last4}
              </span>
              {i === 0 ? <span className="block text-[11px] font-semibold text-sky-dark">Best on this bill</span> : null}
            </span>
            <span className="shrink-0 text-[14px] font-bold">{cardReward(c, amount)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted">
        Rewards are set by each card&apos;s bank. Fictional cards and example rates for this prototype.
      </p>
      <Button className="mt-4" onClick={onClose}>
        Got it
      </Button>
    </BottomSheet>
  );
}

/** S2 welcome back card: the Test 4 group she is in decides the hook. */
function s2Copy(variant: RewardVariant) {
  const base = `You used to pay your ${board.short} electricity bill here. It is still saved.`;
  switch (variant) {
    case "cashback":
      return { banner: test4Offers.cashback, body: `${base} Pay it again and get ₹25 cashback.`, guarantee: false };
    case "card_rewards":
      return { banner: test4Offers.card_rewards, body: `${base} Pay it again with a credit card for 500 bonus points.`, guarantee: false };
    case "nothing":
      return { banner: null, body: `${base} Pay it again in a few taps.`, guarantee: false };
    default:
      return {
        banner: "If the board does not confirm within 24 hours, you get a full refund automatically.",
        body: `${base} Pay it again with the Paytm Payment Guarantee.`,
        guarantee: true,
      };
  }
}

/** The first card after a recharge. Its wording changes by segment (presenter switcher). */
export function BillSuggestionCard() {
  const { state, dispatch } = useJourney();
  const seg = state.segment;
  const variant = effectiveVariant(state);
  const s2 = s2Copy(variant);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const openedAt = useRef(0);

  const copy = {
    S1: {
      Icon: Zap,
      title: "Pay your home's electricity bill here too",
      body: "Add it once and we'll remind you when it's due.",
      cta: "Add electricity bill",
    },
    S2: {
      Icon: Zap,
      title: `Welcome back, ${persona.firstName}`,
      body: s2.body,
      cta: "Pay electricity bill",
    },
    S3: {
      Icon: Repeat,
      title: "Put electricity on AutoPay too",
      body: "You already use AutoPay for your mobile recharge. Add electricity next to it. You set the limit and get a message before each debit.",
      cta: "Add electricity bill",
    },
    S4: {
      Icon: CreditCard,
      title: `Earn ${cardReward(leadCard, bills.nov.amount)} on your electricity bill`,
      body: `Pay it with your saved ${leadCard.name} •• ${leadCard.last4}. That is ${cardReward(leadCard, bills.nov.amount)} on a ${rupees(bills.nov.amount)} bill.`,
      cta: "Add electricity bill",
    },
  }[seg];
  const { Icon } = copy;
  // Test 4 groups (S2 and S4): only the guarantee group sees the guarantee line.
  const showGuarantee = variant === "guarantee";
  // The offer banner at the top: S2 has its own copy, S4 shows the Paytm offer for its group.
  const banner =
    seg === "S2"
      ? s2.banner
      : seg === "S4" && (variant === "cashback" || variant === "card_rewards")
        ? test4Offers[variant]
        : null;
  const bannerIsGuarantee = seg === "S2" && s2.guarantee;

  const onTap = () => {
    // A lapsed payer already has the bill saved, so the number is filled in.
    if (seg === "S2") dispatch({ type: "SET_CONSUMER_NUMBER", value: board.consumerNumber.replace(/\D/g, "") });
    dispatch({ type: "SUGGESTION_TAPPED" });
  };

  const openRewards = () => {
    openedAt.current = Date.now();
    setRewardsOpen(true);
  };
  const closeRewards = () => {
    setRewardsOpen(false);
    const seconds = Math.max(1, Math.round((Date.now() - openedAt.current) / 1000));
    dispatch({ type: "LOG", name: "card_rewards_page_time", detail: `${seconds} seconds` });
  };

  return (
    <section key={`${seg}-${variant}`} className="anim-rise rounded-2xl border-2 border-sky bg-sky-soft p-4" aria-label="Bill suggestion">
      {banner ? (
        <div
          className={`mb-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold leading-snug ${
            bannerIsGuarantee ? "bg-ok-soft" : "bg-warn-soft text-warn"
          }`}
        >
          {bannerIsGuarantee ? <ShieldCheck size={16} className="shrink-0 text-ok" /> : <Gift size={16} className="shrink-0" />}
          {banner}
        </div>
      ) : null}
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold leading-snug">{copy.title}</h2>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">{copy.body}</p>
        </div>
      </div>
      <Button className="mt-3" onClick={onTap}>
        {copy.cta}
      </Button>
      {showGuarantee ? (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] font-medium text-navy">
          <ShieldCheck size={14} className="text-ok" /> Covered by the Paytm Payment Guarantee
        </div>
      ) : null}
      {seg === "S4" ? (
        <div className="mt-1.5 text-center">
          <button type="button" onClick={openRewards} className="text-[13px] font-semibold text-sky underline">
            See card rewards
          </button>
          <div className="mt-0.5 text-[10px] text-muted">Fictional card and example reward rate for this prototype</div>
        </div>
      ) : null}
      <CardRewardsSheet open={rewardsOpen} onClose={closeRewards} />
    </section>
  );
}

function RechargeAnother() {
  const { showToast } = useJourney();
  const people = [
    { name: "Rakesh", number: otherBills.rakesh.number },
    { name: "Me", number: otherBills.own.number },
    { name: "New", number: "Any number" },
  ];
  return (
    <section className="rounded-2xl bg-card p-4">
      <h2 className="text-[15px] font-semibold">Recharge another number</h2>
      <div className="mt-3 flex gap-2">
        {people.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => showToast(NOT_IN_DEMO)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-white p-2 hover:bg-sky-soft"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-[13px] font-bold">
              {p.name === "New" ? "+" : p.name[0]}
            </span>
            <span className="text-[12px] font-semibold">{p.name}</span>
            <span className="text-[10px] text-muted">{p.number}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Offers() {
  const { showToast } = useJourney();
  return (
    <section>
      <h2 className="mb-2 text-[15px] font-semibold">Offers for you</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => showToast(NOT_IN_DEMO)}
          className="rounded-2xl bg-card p-3 text-left hover:bg-line"
        >
          <Wallet size={20} className="text-sky-dark" />
          <div className="mt-2 text-[13px] font-semibold leading-snug">Pay bills with Postpaid credit</div>
          <div className="mt-1 text-[11px] text-muted">Set up in 2 minutes</div>
        </button>
        <button
          type="button"
          onClick={() => showToast(NOT_IN_DEMO)}
          className="rounded-2xl bg-card p-3 text-left hover:bg-line"
        >
          <Gift size={20} className="text-warn" />
          <div className="mt-2 text-[13px] font-semibold leading-snug">You won a scratch card</div>
          <div className="mt-1 text-[11px] text-muted">Tap to scratch</div>
        </button>
      </div>
    </section>
  );
}

function BillGrid() {
  const { dispatch, showToast } = useJourney();
  const items = [
    { label: "Mobile Recharge", Icon: Smartphone },
    { label: "Electricity Bill", Icon: Zap, live: true },
    { label: "DTH Recharge", Icon: Satellite },
    { label: "FASTag Recharge", Icon: Car },
    { label: "Broadband", Icon: Router },
    { label: "Loan EMI", Icon: Landmark },
    { label: "Credit Card", Icon: CreditCard },
    { label: "All Bills", Icon: LayoutGrid },
  ];
  return (
    <section className="rounded-2xl border border-line p-4">
      <h2 className="mb-3 text-[15px] font-semibold">Recharge and pay bills</h2>
      <div className="grid grid-cols-4 gap-y-4">
        {items.map(({ label, Icon, live }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (live) {
                dispatch({ type: "LOG", name: "bill_grid_electricity_tapped" });
                dispatch({ type: "GOTO", screen: 2 });
              } else showToast(NOT_IN_DEMO);
            }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft text-sky-dark">
              <Icon size={20} />
            </span>
            <span className="text-[11px] leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function S1RechargeSuccess() {
  const { state, showToast } = useJourney();
  if (state.toggles.paytmToday) return <PaytmToday />;
  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <AppHeader title={<Wordmark className="text-[20px]" />} onBack={() => showToast(NOT_IN_DEMO)} />
      <SuccessHeader />
      <div className="space-y-4 px-4 pb-8">
        <BillSuggestionCard />
        <RechargeAnother />
        <Offers />
        <BillGrid />
        <button
          type="button"
          onClick={() => showToast(NOT_IN_DEMO)}
          className="flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3 text-[14px] font-semibold"
        >
          View all payments <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
