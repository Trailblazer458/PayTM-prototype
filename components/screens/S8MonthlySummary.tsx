"use client";

import { BellRing, CircleCheck, Clock, Repeat } from "lucide-react";
import { useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import type { JourneyState } from "@/lib/journey";
import { rupees } from "@/lib/format";
import { summaryMonth } from "@/lib/seed";
import { profileFor } from "@/lib/bills";
import { householdFor, type HouseItem } from "@/lib/household";
import { itemIcons } from "./S7BillsTab";
import { AppHeader, Button, Wordmark } from "@/components/ui/kit";
import { SegmentReward } from "@/components/ui/SegmentReward";

/** The push preview. Never shows amounts. */
export function previewText(s: JourneyState): string {
  const tail = s.autopay.status === "active" ? "1 more could be paid here." : "1 more could be on autopilot.";
  const home = householdFor(profileFor(s.segment).kind);
  return `${summaryMonth} sorted: ${home.paidCount} ${home.paidNoun}. ${tail}`;
}

function LockScreen({ onOpen, text }: { onOpen: () => void; text: string }) {
  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-[#0b2a5b] via-[#13407f] to-[#1d6fa8] px-4 pt-12 text-white">
      <div className="text-[13px] font-medium opacity-80">Wednesday, 31 December</div>
      <div className="text-[64px] font-semibold leading-none tracking-tight">8:00</div>
      <button
        type="button"
        onClick={onOpen}
        className="anim-rise mt-10 w-full rounded-2xl bg-white/90 p-3.5 text-left text-navy shadow-lg backdrop-blur hover:bg-white"
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[8px] shadow">
              <Wordmark />
            </span>
            Paytm
          </span>
          <span className="text-muted">now</span>
        </div>
        <div className="mt-1.5 text-[14px] leading-snug">{text}</div>
      </button>
      <div className="mt-auto mb-6 text-[12px] opacity-70">Tap the notification</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <ul className="space-y-1.5">{children}</ul>
    </section>
  );
}

function Item({ icon, label, right }: { icon: React.ReactNode; label: string; right: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-[14px]">
      {icon}
      <span className="flex-1 font-medium">{label}</span>
      <span className="text-[13px] text-muted">{right}</span>
    </li>
  );
}

export function S8MonthlySummary() {
  const { state, dispatch } = useJourney();
  const [open, setOpen] = useState(false);
  const autopayOn = state.autopay.status === "active";
  const p = profileFor(state.segment);
  const home = householdFor(p.kind);
  const ok = <CircleCheck size={18} className="shrink-0 text-ok" />;
  const iconOf = (it: HouseItem, cls: string) => {
    const Icon = itemIcons[it.icon];
    return <Icon size={18} className={`shrink-0 ${cls}`} />;
  };

  if (!open) {
    return (
      <LockScreen
        text={previewText(state)}
        onOpen={() => {
          setOpen(true);
          dispatch({ type: "LOG", name: "summary_opened" });
        }}
      />
    );
  }

  const paid = home.items.filter((it) => it.status === "journey" || it.status === "paid");
  const outside = home.items.filter((it) => it.status === "outside");
  const due = home.items.filter((it) => it.status === "due");
  const journey = home.items.find((it) => it.status === "journey");

  return (
    <div className="flex h-full flex-col">
      <AppHeader title={`${summaryMonth} bills`} onBack={() => setOpen(false)} />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="anim-rise rounded-2xl bg-ok-soft p-4">
          <div className="text-[22px] font-bold">{summaryMonth} sorted</div>
          <div className="text-[14px]">
            {home.paidCount} {home.paidNoun} on Paytm.
          </div>
        </div>

        <SegmentReward />

        <Section title="Paid on Paytm">
          {paid.map((it) => (
            <Item key={it.id} icon={ok} label={it.title} right={it.summary} />
          ))}
        </Section>

        <Section title="On autopilot">
          {autopayOn && journey ? (
            <Item
              icon={<Repeat size={18} className="shrink-0 text-sky" />}
              label={journey.title}
              right={`cap ${rupees(state.autopay.cap ?? 0)}`}
            />
          ) : (
            <li className="rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] text-muted">Nothing yet</li>
          )}
        </Section>

        <Section title="Paid outside Paytm">
          {outside.map((it) => (
            <Item key={it.id} icon={iconOf(it, "text-muted")} label={it.title} right={it.summary} />
          ))}
        </Section>

        <Section title="Pending">
          {due.length ? (
            due.map((it) => <Item key={it.id} icon={<Clock size={18} className="shrink-0 text-warn" />} label={it.title} right={it.summary} />)
          ) : (
            <li className="rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] text-muted">Nothing pending</li>
          )}
        </Section>

        <NextAction />
      </div>
    </div>
  );
}

function NextAction() {
  const { state, dispatch } = useJourney();
  const autopayOn = state.autopay.status === "active";
  const p = profileFor(state.segment);
  const home = householdFor(p.kind);

  // The journey bill has been paid on Paytm twice, so it can go on autopilot.
  if (!autopayOn) {
    return (
      <section className="rounded-2xl border-2 border-sky p-4">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-sky-dark">Your next step</div>
        <div className="mt-1 text-[15px] font-bold">Put {p.shortName} on autopilot</div>
        <p className="mt-0.5 text-[13px] text-muted">Paid on Paytm two months in a row. You choose the limit.</p>
        <Button
          className="mt-3"
          onClick={() => {
            dispatch({ type: "LOG", name: "summary_action_tapped", detail: `autopay ${p.kind}` });
            dispatch({ type: "GOTO", screen: 6 });
          }}
        >
          Put {p.shortName} on autopilot
        </Button>
      </section>
    );
  }

  // The bill paid outside Paytm has never been paid here, so the next step is a reminder, not AutoPay.
  return (
    <section className="rounded-2xl border-2 border-sky p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-sky-dark">Your next step</div>
      <div className="mt-1 text-[15px] font-bold">Bring {home.outside.name} to Paytm</div>
      {state.airtel === "remind" ? (
        <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-ok">
          <BellRing size={16} /> Reminder set. One message when it is next due.
        </div>
      ) : (
        <>
          <p className="mt-0.5 text-[13px] text-muted">Covered by the same guarantee. One reminder, only when it is due.</p>
          <Button
            className="mt-3"
            onClick={() => {
              dispatch({ type: "LOG", name: "summary_action_tapped", detail: "remind paid outside" });
              dispatch({ type: "AIRTEL_CHOICE", value: "remind" });
            }}
          >
            Remind me next month
          </Button>
        </>
      )}
    </section>
  );
}
