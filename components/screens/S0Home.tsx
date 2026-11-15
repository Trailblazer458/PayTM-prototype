"use client";

import {
  ArrowRightLeft,
  Bell,
  Car,
  ChevronRight,
  CreditCard,
  HeartPulse,
  Landmark,
  LayoutGrid,
  QrCode,
  Router,
  Satellite,
  Search,
  ShieldCheck,
  Smartphone,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { homeOffers, homeOfferSmallPrint, recharge, soloRecharge } from "@/lib/seed";
import { Wordmark } from "@/components/ui/kit";
import { TabBar } from "./S7BillsTab";

const NOT_IN_DEMO = "Not part of this demo";

/** "For you" offer card. Replaces today's points or coins banner. Changes by segment. */
function ForYouCard() {
  const { state, dispatch, showToast } = useJourney();
  const offer = homeOffers[state.segment];
  const Icon = offer.kind === "Insurance" ? (state.segment === "S1" ? HeartPulse : ShieldCheck) : Wallet;

  useEffect(() => {
    dispatch({ type: "LOG_ONCE", name: "home_offer_viewed", detail: `${state.segment}, ${offer.kind.toLowerCase()}` });
  }, [dispatch, state.segment, offer.kind]);

  return (
    <section className="anim-rise rounded-2xl bg-gradient-to-br from-[#e6f8fe] to-[#f4f6fa] p-4" aria-label="For you offer">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-sky-dark">For you</div>
      <div className="mt-2 flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky shadow-sm">
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-muted">{offer.kind}</div>
          <h2 className="text-[16px] font-bold leading-snug">{offer.title}</h2>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">{offer.body}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "LOG", name: "home_offer_tapped", detail: `${state.segment}, ${offer.kind.toLowerCase()}` });
          showToast("Offer details are not part of this demo");
        }}
        className="mt-3 flex items-center gap-1 rounded-full bg-navy px-4 py-1.5 text-[13px] font-semibold text-white"
      >
        {offer.cta} <ChevronRight size={15} />
      </button>
      <p className="mt-2.5 text-[10px] leading-snug text-muted">{homeOfferSmallPrint}</p>
    </section>
  );
}

function MoneyTransfer() {
  const { showToast } = useJourney();
  const items = [
    { label: "Scan and Pay", Icon: QrCode },
    { label: "To Mobile", Icon: Smartphone },
    { label: "To Bank", Icon: Landmark },
    { label: "Balance", Icon: ArrowRightLeft },
  ];
  return (
    <section className="rounded-2xl border border-line p-4">
      <h2 className="mb-3 text-[15px] font-semibold">UPI Money Transfer</h2>
      <div className="grid grid-cols-4">
        {items.map(({ label, Icon }) => (
          <button key={label} type="button" onClick={() => showToast(NOT_IN_DEMO)} className="flex flex-col items-center gap-1.5 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
              <Icon size={20} />
            </span>
            <span className="text-[11px] leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function RechargeAndBills() {
  const { dispatch, showToast } = useJourney();
  const items = [
    { label: "Mobile Recharge", Icon: Smartphone, live: true },
    { label: "Electricity Bill", Icon: Zap },
    { label: "DTH Recharge", Icon: Satellite },
    { label: "FASTag Recharge", Icon: Car },
    { label: "Broadband", Icon: Router },
    { label: "Credit Card", Icon: CreditCard },
    { label: "Loan EMI", Icon: Landmark },
    { label: "All Bills", Icon: LayoutGrid },
  ];
  return (
    <section className="rounded-2xl border border-line p-4">
      <h2 className="mb-3 text-[15px] font-semibold">Recharge and Bills</h2>
      <div className="grid grid-cols-4 gap-y-4">
        {items.map(({ label, Icon, live }) => (
          <button
            key={label}
            type="button"
            onClick={() => (live ? dispatch({ type: "NEXT" }) : showToast(NOT_IN_DEMO))}
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

/** Starts the journey: the recharge that leads to screen 1. */
function RechargeAgain() {
  const { state, dispatch } = useJourney();
  const solo = state.segment === "S3";
  const who = solo ? `Your ${soloRecharge.operator} prepaid` : `${recharge.forName}'s ${recharge.operator} prepaid`;
  const amount = solo ? soloRecharge.amount : recharge.amount;
  const number = solo ? soloRecharge.number : recharge.number;
  return (
    <section className="rounded-2xl border-2 border-sky bg-white p-3.5">
      <div className="text-[12px] font-semibold text-muted">Recharge again</div>
      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy">
          <Smartphone size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">{who}</div>
          <div className="text-[12px] text-muted">{number}. Plan expires in 2 days</div>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "NEXT" })}
          className="shrink-0 rounded-xl bg-sky px-3.5 py-2 text-[14px] font-bold text-white hover:bg-sky-dark"
        >
          Pay {rupees(amount)}
        </button>
      </div>
    </section>
  );
}

export function S0Home() {
  const { showToast } = useJourney();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
        <button type="button" aria-label="Profile" onClick={() => showToast(NOT_IN_DEMO)} className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10">
          <User size={18} />
        </button>
        <Wordmark className="flex-1 text-[22px]" />
        <button type="button" aria-label="Search" onClick={() => showToast(NOT_IN_DEMO)} className="rounded-full p-1.5 hover:bg-card">
          <Search size={20} />
        </button>
        <button type="button" aria-label="Notifications" onClick={() => showToast(NOT_IN_DEMO)} className="rounded-full p-1.5 hover:bg-card">
          <Bell size={20} />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <ForYouCard />
        <MoneyTransfer />
        <RechargeAgain />
        <RechargeAndBills />
      </div>
      <TabBar active="home" />
    </div>
  );
}
