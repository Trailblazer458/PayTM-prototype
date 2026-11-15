"use client";

import { Gamepad2, Shirt, Sparkles, Ticket, Utensils } from "lucide-react";
import { useEffect } from "react";
import { useJourney } from "@/hooks/useJourney";
import { pointsEarnedHere, pointsThisYear, type CouponCategory } from "@/lib/journey";
import { coupons, leadCard } from "@/lib/seed";

/** Summary reward by segment. No coins, no scratch cards, no lucky draws. */
export function SegmentReward() {
  const { state } = useJourney();
  if (state.segment === "S3") return <CouponStreakDone />;
  if (state.segment === "S4") return <PointsTracker />;
  return <ProgressMeter />;
}

/** A. Progress meter (S1, S2): 3 of 4 home bills sorted. */
function ProgressMeter() {
  const { state, dispatch } = useJourney();
  useEffect(() => {
    dispatch({ type: "LOG_ONCE", name: "progress_meter_viewed", detail: `${state.segment}, 3 of 4` });
  }, [dispatch, state.segment]);
  return (
    <section className="rounded-2xl border border-line p-4" aria-label="Home bills progress">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold">3 of 4 home bills sorted</h2>
        <span className="text-[13px] font-semibold text-ok">75%</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 rounded-full ${i < 3 ? "bg-ok" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-2 text-[13px] text-muted">Airtel postpaid is the 4th. Bring it here to make it 4 of 4.</p>
    </section>
  );
}

/** D. Card points tracker (S4): points earned paying bills here this year. */
function PointsTracker() {
  const { state, dispatch } = useJourney();
  const total = pointsThisYear(state);
  const now = pointsEarnedHere(state);
  useEffect(() => {
    dispatch({ type: "LOG_ONCE", name: "points_tracker_viewed", detail: `${total} points this year` });
  }, [dispatch, total]);
  return (
    <section className="rounded-2xl border border-line p-4" aria-label="Card points tracker">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-warn">
        <Sparkles size={15} /> Card points
      </div>
      <h2 className="mt-1 text-[17px] font-bold leading-snug">
        You earned {total.toLocaleString("en-IN")} points paying bills here this year
      </h2>
      <p className="mt-1 text-[13px] text-muted">
        {now > 0
          ? `${now.toLocaleString("en-IN")} of them this month and last, with your ${leadCard.name} •• ${leadCard.last4}.`
          : `Pay your next bill with your ${leadCard.name} •• ${leadCard.last4} to add to it.`}
      </p>
      <p className="mt-2 text-[10px] text-muted">Fictional card and example reward rate for this prototype.</p>
    </section>
  );
}

const icons: Record<CouponCategory, typeof Utensils> = { food: Utensils, fashion: Shirt, gaming: Gamepad2 };

/** E. Coupon streak (S3): 2 months in a row done, so she picks one coupon. */
function CouponStreakDone() {
  const { state, dispatch } = useJourney();
  useEffect(() => {
    dispatch({ type: "LOG_ONCE", name: "coupon_streak_progress", detail: "month 2 of 2" });
    dispatch({ type: "LOG_ONCE", name: "coupon_unlocked", detail: "2 months in a row" });
  }, [dispatch]);
  const picked = state.coupon ? coupons[state.coupon] : null;

  return (
    <section className="rounded-2xl border border-line p-4" aria-label="Coupon streak">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Coupon streak</h2>
        <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[12px] font-semibold text-ok">Month 2 of 2 done</span>
      </div>
      <div className="mt-3 flex gap-2" aria-hidden>
        <span className="h-2 flex-1 rounded-full bg-ok" />
        <span className="h-2 flex-1 rounded-full bg-ok" />
      </div>

      {picked ? (
        <div className="anim-rise mt-3 rounded-xl border-2 border-dashed border-sky bg-sky-soft p-3 text-center">
          <Ticket size={22} className="mx-auto text-sky" />
          <div className="mt-1 text-[14px] font-bold">
            {picked.merchant}: {picked.offer}
          </div>
          <div className="mt-1.5 inline-block rounded-lg bg-white px-3 py-1 font-mono text-[15px] font-bold tracking-wider">
            {picked.code}
          </div>
          <div className="mt-1.5 text-[11px] text-muted">Use this code at checkout. Valid for 30 days.</div>
        </div>
      ) : (
        <>
          <p className="mt-2.5 text-[13px] text-muted">You recharged 2 months in a row. Pick one coupon.</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Pick a coupon">
            {(Object.keys(coupons) as CouponCategory[]).map((k) => {
              const c = coupons[k];
              const Icon = icons[k];
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={false}
                  onClick={() => dispatch({ type: "COUPON_PICKED", category: k })}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-line bg-white p-2.5 text-center hover:border-sky"
                >
                  <Icon size={22} className="text-sky" />
                  <span className="text-[13px] font-bold">{c.label}</span>
                  <span className="text-[10px] leading-tight text-muted">
                    {c.merchant}: {c.offer}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-2 text-[10px] text-muted">Example merchants for this prototype.</p>
    </section>
  );
}
