"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Target, TrendingUp, Wrench } from "lucide-react";
import { useJourney } from "@/hooks/useJourney";
import { FIRST_SCREEN, rewardVariants, S4_SIGNAL_EVENTS, SCREEN_COUNT, TEST4_SEGMENTS, type Toggles } from "@/lib/journey";
import { metaFor, NEXT_BILL_LINE, screen1Note, screen8RewardNote, screens, segments } from "@/lib/screens";
import { Wordmark } from "@/components/ui/kit";

export const DISCLAIMER = "Concept prototype for a case study. Simulated data. Not a live Paytm product.";

function Toggle({
  label,
  hint,
  k,
  goTo,
  steps,
  startAt,
}: {
  label: string;
  hint: string;
  k: keyof Toggles;
  goTo?: number;
  /** How-to steps, shown while the switch is on. */
  steps?: string[];
  /** Restart the journey (keeping switches) and jump to this screen. */
  startAt?: number;
}) {
  const { state, dispatch } = useJourney();
  const on = state.toggles[k];
  const flip = () => {
    dispatch({ type: "TOGGLE", key: k });
    if (!on && goTo) dispatch({ type: "GOTO", screen: goTo });
  };
  return (
    <div>
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={flip}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-sky" : "bg-[#c8d1df]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
      <span className="text-[13px] leading-snug">
        <span className="font-semibold">{label}</span>
        <span className="block text-muted">{hint}</span>
        {steps && !on ? <span className="block text-[12px] font-semibold text-sky-dark">Turn on to see how to try it.</span> : null}
      </span>
    </label>
    {steps && on ? (
      <div className="anim-rise mb-2 ml-12 rounded-xl bg-sky-soft p-3 text-[12px] leading-snug">
        <div className="mb-1 font-semibold">How to try it</div>
        <ol className="list-decimal space-y-1 pl-4">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {startAt ? (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "RESET", keepToggles: true });
              dispatch({ type: "GOTO", screen: startAt });
            }}
            className="mt-2.5 w-full rounded-lg bg-sky py-1.5 text-[13px] font-semibold text-white hover:bg-sky-dark"
          >
            Start from screen {startAt}
          </button>
        ) : null}
      </div>
    ) : null}
    </div>
  );
}

/** Test 4: Guarantee vs rewards. S2 and S4 users in four groups, one offer each. */
function Test4Picker() {
  const { state, dispatch } = useJourney();
  const inTest = TEST4_SEGMENTS.includes(state.segment);
  return (
    <div className="my-2 rounded-xl border border-line p-3">
      <div className="text-[13px] font-semibold">Test 4: Guarantee vs rewards</div>
      <p className="mt-0.5 text-[12px] leading-snug text-muted">
        S2 and S4 users are split into four groups: guarantee, cashback, card rewards or nothing. Results are read separately
        for each segment.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Test 4 group">
        {rewardVariants.map((v) => {
          const on = inTest && state.rewardVariant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => dispatch({ type: "SET_REWARD_VARIANT", variant: v.id })}
              className={`rounded-lg border-2 px-2 py-1.5 text-[12px] font-semibold transition ${
                on ? "border-sky bg-sky-soft" : "border-line hover:border-sky/50"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 rounded-lg bg-sky-soft p-2.5 text-[12px] leading-snug">
        <div className="mb-1 font-semibold">How to try it</div>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Pick S2 or S4 in the segment switcher below, then a group above.</li>
          <li>Tap Start from screen 1 below and see the offer on the first card.</li>
          <li>Walk to screen 3. The offer block changes with the group.</li>
          <li>Pay and turn on Show metric events. Each payment is tagged with its group and segment.</li>
        </ol>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "RESET", keepToggles: true });
            dispatch({ type: "GOTO", screen: 1 });
          }}
          className="mt-2.5 w-full rounded-lg bg-sky py-1.5 text-[13px] font-semibold text-white hover:bg-sky-dark"
        >
          Start from screen 1
        </button>
      </div>
      {inTest ? (
        <p className="mt-2 text-[11px] text-muted">Running on {state.segment}.</p>
      ) : (
        <p className="mt-2 text-[11px] text-muted">
          {state.segment} is not in this test, so it always gets the guarantee. Picking a group moves the story to S2.
        </p>
      )}
    </div>
  );
}

export function StepNav({
  compact = false,
  hint = "Click Next or Back to navigate, or use the mobile above.",
}: {
  compact?: boolean;
  hint?: string;
}) {
  const { state, dispatch } = useJourney();
  return (
    <div className={compact ? "" : "rounded-2xl bg-white px-4 py-3 shadow-sm"}>
      {!compact ? (
        <div className="mb-2.5">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-muted">Navigator</div>
          <div className="text-[12px] text-muted">{hint}</div>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          disabled={state.screen === FIRST_SCREEN}
          className="flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-[14px] font-semibold disabled:opacity-40"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5" role="tablist" aria-label="Screens">
          {screens.map((s) => (
            <button
              key={s.no}
              type="button"
              role="tab"
              aria-selected={state.screen === s.no}
              aria-label={s.no === 0 ? `Home: ${s.name}` : `Screen ${s.no}: ${s.name}`}
              title={s.no === 0 ? `Home. ${s.name}` : `${s.no}. ${s.name}`}
              onClick={() => dispatch({ type: "GOTO", screen: s.no })}
              className={`h-2.5 rounded-full transition-all ${
                state.screen === s.no ? "w-6 bg-sky" : s.no < state.screen ? "w-2.5 bg-navy/60" : "w-2.5 bg-[#c8d1df]"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "NEXT" })}
          disabled={state.screen === SCREEN_COUNT}
          className="flex items-center gap-1 rounded-xl bg-sky px-3 py-2 text-[14px] font-semibold text-white disabled:opacity-40"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
      {!compact ? <div className="mt-2 text-center text-[11px] text-muted">Arrow keys work too.</div> : null}
    </div>
  );
}

export function PresenterPanel() {
  const { state, dispatch } = useJourney();
  const m = metaFor(state.screen);
  const note =
    state.screen === 1
      ? screen1Note(state.segment)
      : state.screen === 8
        ? `${screen8RewardNote(state.segment)} ${m.note ?? ""}`.trim()
        : m.note;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-muted">
          <Wordmark className="text-[15px]" /> Recharge Engagement
        </div>
        <div
          className="shrink-0 whitespace-nowrap rounded-full bg-navy px-3 py-1 text-[14px] font-bold text-white"
          aria-live="polite"
        >
          {m.no === 0 ? "Home" : `Screen ${m.no} of ${SCREEN_COUNT}`}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-sky-dark">
          <span>{m.step}</span>
          <span className="text-line">|</span>
          <span>{m.phase}</span>
        </div>
        <h2 className="mt-1 text-[20px] font-bold leading-tight">{m.name}</h2>

        <dl className="mt-3 space-y-3 text-[14px] leading-snug">
          <div className="flex gap-2.5">
            <Target size={18} className="mt-0.5 shrink-0 text-warn" />
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">Barrier it solves</dt>
              <dd className="font-semibold">{m.barrier}</dd>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Wrench size={18} className="mt-0.5 shrink-0 text-sky-dark" />
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">What changed from Paytm today</dt>
              <dd>{m.change}</dd>
            </div>
          </div>
          <div className="flex gap-2.5">
            <TrendingUp size={18} className="mt-0.5 shrink-0 text-ok" />
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">Metric it moves</dt>
              <dd className="font-semibold">{m.metric}</dd>
            </div>
          </div>
        </dl>
        {note ? <p className="mt-3 rounded-xl bg-card px-3 py-2 text-[13px] text-muted">{note}</p> : null}
        {state.autopay.setUpAfter === 1 && (state.screen === 5 || state.screen === 6) ? (
          <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] font-semibold text-warn">
            {state.screen === 5
              ? "She chose AutoPay on screen 4, so this month Paytm sends a heads-up before the debit instead of a Pay now reminder."
              : "She already chose AutoPay after her first payment, so there is nothing to offer here. Trade-off: earlier mandates, but it skips the trust-first rule of offering AutoPay after the 2nd payment."}
          </p>
        ) : null}
        {state.screen === 1 ? (
          <p className="mt-2 rounded-xl bg-sky-soft px-3 py-2 text-[13px] font-semibold">{NEXT_BILL_LINE}</p>
        ) : null}
        {state.screen === 1 && state.toggles.paytmToday ? (
          <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] font-semibold text-warn">
            Now showing Paytm today: a Postpaid pop-up, a rating request and a scratch card come first. Electricity sits in
            the grid below. Switch the toggle off to see the redesign.
          </p>
        ) : null}
      </div>

      {/* On phones the navigator lives here, in the presenter sheet. On desktop it sits under the phone. */}
      <div className="md:hidden">
        <StepNav hint="Click Next or Back to navigate, or tap inside the app." />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-muted">Scenarios</div>
        <Toggle
          k="failurePath"
          label="Failure path (screen 4)"
          hint="The board does not confirm, so the refund kicks in."
          startAt={3}
          steps={[
            "Tap Start from screen 3 below.",
            "Tap Pay ₹2,340 in the phone and enter any 4 digits.",
            "Watch the tracker stop at Sent to UPPCL. Paytm promises a refund by 9:40 pm tomorrow.",
            "Tap Skip to tomorrow to see the automatic refund.",
            "Tap Try again now and pay again. This time it confirms and the story carries on.",
          ]}
        />
        <Test4Picker />
        <Toggle
          k="paytmToday"
          goTo={1}
          label="Paytm today (screen 1)"
          hint="Shows today's order after a payment as a simple mock, for comparison."
        />
        <Toggle k="showEvents" label="Show metric events" hint="Logs each event as it fires." />
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET", keepToggles: true })}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2 text-[14px] font-semibold hover:bg-card"
        >
          <RotateCcw size={16} /> Reset journey
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">Segment (changes home, screen 1 and the summary reward)</div>
        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Segment">
          {segments.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={state.segment === s.id}
              title={s.name}
              onClick={() => {
                dispatch({ type: "SET_SEGMENT", segment: s.id });
                if (state.toggles.paytmToday) dispatch({ type: "TOGGLE", key: "paytmToday" });
                // A new segment starts from the home screen, where its For you offer shows.
                dispatch({ type: "GOTO", screen: 0 });
              }}
              className={`rounded-lg border-2 py-1.5 text-[13px] font-bold transition ${
                state.segment === s.id ? "border-sky bg-sky-soft" : "border-line hover:border-sky/50"
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
        {(() => {
          const seg = segments.find((s) => s.id === state.segment) ?? segments[0];
          return (
            <p className="mt-2 text-[13px] leading-snug">
              <span className="font-semibold">{seg.name}.</span> <span className="text-muted">{seg.why}</span>
            </p>
          );
        })()}
      </div>

      {state.toggles.showEvents ? <EventLog /> : null}

      <p className="px-1 text-[12px] text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function EventLog() {
  const { state } = useJourney();
  const events = [...state.events].reverse();
  return (
    <div className="rounded-2xl bg-[#0f1a2e] p-4 font-mono text-[12px] text-[#cfe3ff] shadow-sm">
      <div className="mb-2 font-sans text-[12px] font-semibold uppercase tracking-wide text-[#8aa3c7]">Metric events</div>
      {events.length === 0 ? (
        <div className="text-[#8aa3c7]">No events yet. Tap through the phone.</div>
      ) : (
        <ul className="max-h-48 space-y-1 overflow-y-auto no-scrollbar">
          {events.map((e) => (
            <li key={e.id} className="anim-rise">
              <span className="text-[#8aa3c7]">{e.screen === 0 ? "Home" : `S${e.screen}`}</span>{" "}
              <span className="text-sky">{e.name}</span>
              {S4_SIGNAL_EVENTS.includes(e.name) ? (
                <span className="ml-1 rounded bg-[#ffd56b]/20 px-1 font-sans text-[10px] font-semibold text-[#ffd56b]">S4 signal</span>
              ) : null}
              {e.detail ? <span className="text-[#8aa3c7]"> {e.detail}</span> : null}
            </li>
          ))}
        </ul>
      )}
      {events.some((e) => S4_SIGNAL_EVENTS.includes(e.name)) ? (
        <p className="mt-2 font-sans text-[11px] leading-snug text-[#8aa3c7]">
          <span className="font-semibold text-[#ffd56b]">S4 signals: how Paytm spots a rewards cardholder.</span> Not success
          metrics.
        </p>
      ) : null}
    </div>
  );
}
