"use client";

import {
  ChevronDown,
  CircleCheck,
  Clock,
  CreditCard,
  Home,
  Receipt,
  Repeat,
  ScanLine,
  Smartphone,
  TrainFront,
  Tv,
  User,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { rupees } from "@/lib/format";
import { profileFor } from "@/lib/bills";
import { householdFor, type ItemIcon } from "@/lib/household";
import { BottomSheet, Button, StatusChip } from "@/components/ui/kit";

export function TabBar({ active }: { active: "home" | "bills" }) {
  const { showToast } = useJourney();
  const tabs = [
    { k: "home", label: "Home", Icon: Home },
    { k: "scan", label: "Scan", Icon: ScanLine },
    { k: "bills", label: "Bills", Icon: Receipt },
    { k: "me", label: "Profile", Icon: User },
  ];
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-white py-2" aria-label="Tabs">
      {tabs.map(({ k, label, Icon }) => (
        <button
          key={k}
          type="button"
          onClick={() => k !== active && showToast("Not part of this demo")}
          aria-current={k === active ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${k === active ? "text-sky" : "text-muted"}`}
        >
          <Icon size={20} /> {label}
        </button>
      ))}
    </nav>
  );
}

function Row({
  Icon,
  title,
  sub,
  chips,
  children,
  highlight,
}: {
  Icon: typeof Zap;
  title: string;
  sub: string;
  chips: React.ReactNode;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className={`rounded-2xl p-3.5 ${highlight ? "border-2 border-sky/60 bg-white" : "bg-card"}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky shadow-sm">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold">{title}</div>
          <div className="text-[12px] text-muted">{sub}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{chips}</div>
        </div>
      </div>
      {children}
    </li>
  );
}

export const itemIcons: Record<ItemIcon, typeof Zap> = {
  zap: Zap,
  wifi: Wifi,
  phone: Smartphone,
  train: TrainFront,
  tv: Tv,
  card: CreditCard,
};

export function S7BillsTab() {
  const { state, dispatch, showToast } = useJourney();
  const [howOpen, setHowOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autopayOn = state.autopay.status === "active";
  const p = profileFor(state.segment);
  const home = householdFor(p.kind);

  const checkBottom = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 24);
  };
  useEffect(checkBottom, [state.airtel]);
  const showHint = state.airtel !== "unset" && !atBottom;

  const paidChip = (
    <StatusChip tone="ok">
      <CircleCheck size={12} /> Paid on Paytm
    </StatusChip>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="text-[18px] font-bold">Bills</div>
        <div className="text-[13px] font-semibold text-muted">December</div>
      </div>
      <div className="relative min-h-0 flex-1">
        {showHint ? (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
            className="anim-rise absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-white shadow-lg"
          >
            <ChevronDown size={18} className="animate-bounce" /> Scroll down to continue
          </button>
        ) : null}
        <div ref={scrollRef} onScroll={checkBottom} className="h-full overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
          <ul className="space-y-3">
            {home.items.map((it) => {
              const Icon = itemIcons[it.icon];
              if (it.status === "journey") {
                return (
                  <Row
                    key={it.id}
                    Icon={Icon}
                    title={it.title}
                    sub={state.autopay.setUpAfter === 1 ? home.journeyAutopaid : home.journeyPaid}
                    chips={
                      <>
                        {paidChip}
                        {autopayOn ? (
                          <StatusChip tone="sky">
                            <Repeat size={12} /> On autopilot, cap {rupees(state.autopay.cap ?? 0)}
                          </StatusChip>
                        ) : null}
                      </>
                    }
                  />
                );
              }
              if (it.status === "outside") {
                return (
                  <Row key={it.id} Icon={Icon} title={it.title} sub={it.sub} highlight chips={<StatusChip tone="muted">Paid outside Paytm</StatusChip>}>
                    <div className="mt-3 rounded-xl bg-sky-soft p-3">
                      <div className="text-[14px] font-semibold">Paid outside Paytm this month</div>
                      <p className="mt-0.5 text-[13px] leading-snug">Bring it here next month? It is covered by the same guarantee.</p>
                      {state.airtel === "unset" ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button variant="ghost" className="!py-2 !text-[13px]" onClick={() => dispatch({ type: "AIRTEL_CHOICE", value: "not_now" })}>
                            Not now
                          </Button>
                          <Button className="!py-2 !text-[13px]" onClick={() => dispatch({ type: "AIRTEL_CHOICE", value: "remind" })}>
                            Remind me next month
                          </Button>
                        </div>
                      ) : (
                        <div className="anim-rise mt-2 text-[13px] font-semibold text-ok">
                          {state.airtel === "remind" ? "Done. One reminder when it's next due." : "Okay. We won't ask again this month."}
                        </div>
                      )}
                      <button type="button" onClick={() => setHowOpen(true)} className="mt-2 text-[12px] font-semibold text-sky underline">
                        How do we know?
                      </button>
                    </div>
                  </Row>
                );
              }
              if (it.status === "due") {
                return (
                  <Row
                    key={it.id}
                    Icon={Icon}
                    title={it.title}
                    sub={it.sub}
                    chips={
                      <StatusChip tone="warn">
                        <Clock size={12} /> {it.dueChip}
                      </StatusChip>
                    }
                  >
                    <button
                      type="button"
                      onClick={() => showToast("Not part of this demo")}
                      className="mt-2 ml-[52px] text-[13px] font-semibold text-sky"
                    >
                      {it.dueAction}
                    </button>
                  </Row>
                );
              }
              return <Row key={it.id} Icon={Icon} title={it.title} sub={it.sub} chips={paidChip} />;
            })}
          </ul>

          <Button variant="ghost" className="mt-5" onClick={() => dispatch({ type: "NEXT" })}>
            Skip to the end of the month
          </Button>
        </div>
      </div>
      <TabBar active="bills" />

      <BottomSheet open={howOpen} onClose={() => setHowOpen(false)} title="How do we know?">
        <p className="text-[15px] leading-snug">
          We checked {home.outside.name}. It shows paid, with no payment made on Paytm. We never read your SMS.
        </p>
        <ol className="mt-4 space-y-2 text-[13px] text-muted">
          {home.outside.how.map((line, i) => (
            <li key={i}>
              {i + 1}. {line}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[12px] text-muted">This only works for bills you have saved on Paytm.</p>
        <Button className="mt-4" onClick={() => setHowOpen(false)}>
          Got it
        </Button>
      </BottomSheet>
    </div>
  );
}
