import { describe, expect, it } from "vitest";
import {
  canOfferAutopay,
  effectiveVariant,
  pointsEarnedHere,
  pointsThisYear,
  initialState,
  parseStored,
  reducer,
  type Action,
  type JourneyState,
} from "./journey";
import { screen1Note, screens } from "./screens";

const run = (actions: Action[], from: JourneyState = initialState) => actions.reduce(reducer, from);

describe("screen order", () => {
  it("has a home screen 0, then 8 screens numbered 1 to 8", () => {
    expect(screens.map((s) => s.no)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("starts on home, Next walks to 8 and stops, Back stops at home", () => {
    const seen: number[] = [];
    let s = initialState;
    for (let i = 0; i < 10; i++) {
      seen.push(s.screen);
      s = reducer(s, { type: "NEXT" });
    }
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 8]);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "BACK" });
    expect(s.screen).toBe(0);
  });

  it("the tap journey moves through the screens in order", () => {
    const s1 = run([{ type: "SUGGESTION_TAPPED" }]);
    expect(s1.screen).toBe(2);
    const s2 = run([{ type: "SET_CONSUMER_NUMBER", value: "4521009876" }, { type: "BILLER_ADDED", via: "typed" }], s1);
    expect(s2.screen).toBe(3);
    const s3 = run([{ type: "PAYMENT_STARTED", bill: "nov" }], s2);
    expect(s3.screen).toBe(4);
    const s4 = run([{ type: "PAYMENT_CONFIRMED", bill: "nov" }, { type: "REMINDER_CHOICE", value: "yes" }], s3);
    expect(s4.screen).toBe(5);
    const s5 = run([{ type: "PAYMENT_STARTED", bill: "dec" }, { type: "PAYMENT_CONFIRMED", bill: "dec" }, { type: "NEXT" }], s4);
    expect(s5.screen).toBe(6);
    const s6 = run([{ type: "AUTOPAY_SET_UP", cap: 3000 }], s5);
    expect(s6.screen).toBe(7);
    expect(s6.autopay).toEqual({ status: "active", cap: 3000, setUpAfter: 2 });
    expect(s6.events.map((e) => e.name)).toEqual([
      "bill_suggestion_tapped",
      "biller_added",
      "first_payment_started",
      "first_payment_confirmed",
      "reminder_on_by_default",
      "reminder_payment_started",
      "reminder_payment_confirmed",
      "autopay_set_up",
    ]);
  });

  it("a short consumer number does not add the biller", () => {
    const s = run([{ type: "GOTO", screen: 2 }, { type: "SET_CONSUMER_NUMBER", value: "1234" }, { type: "BILLER_ADDED", via: "typed" }]);
    expect(s.screen).toBe(2);
    expect(s.billerAdded).toBe(false);
  });
});

describe("AutoPay only after two payments", () => {
  it("is refused with no payments", () => {
    const s = reducer(initialState, { type: "AUTOPAY_SET_UP", cap: 3000 });
    expect(s.autopay.status).toBe("none");
    expect(canOfferAutopay(s)).toBe(false);
  });

  it("is refused after one payment", () => {
    const s = run([
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
      { type: "AUTOPAY_SET_UP", cap: 3000 },
    ]);
    expect(s.autopay.status).toBe("none");
  });

  it("is allowed after two confirmed payments", () => {
    const s = run([
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
      { type: "PAYMENT_STARTED", bill: "dec" },
      { type: "PAYMENT_CONFIRMED", bill: "dec" },
      { type: "AUTOPAY_SET_UP", cap: 4000 },
    ]);
    expect(s.autopay).toEqual({ status: "active", cap: 4000, setUpAfter: 2 });
  });

  it("she can choose it herself after one confirmed payment, and the story goes on to next month", () => {
    const s = run([
      { type: "GOTO", screen: 4 },
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
      { type: "AUTOPAY_SET_UP", cap: 3000, source: "early" },
    ]);
    expect(s.autopay).toEqual({ status: "active", cap: 3000, setUpAfter: 1 });
    expect(s.screen).toBe(5);
    expect(s.events.at(-1)?.detail).toBe("cap ₹3000, after payment 1");
  });

  it("she cannot choose it before any payment is confirmed", () => {
    const s = reducer(initialState, { type: "AUTOPAY_SET_UP", cap: 3000, source: "early" });
    expect(s.autopay.status).toBe("none");
  });

  it("a bill paid by AutoPay is logged as an AutoPay payment", () => {
    const s = run([
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
      { type: "AUTOPAY_SET_UP", cap: 3000, source: "early" },
      { type: "PAYMENT_CONFIRMED", bill: "dec", via: "autopay" },
    ]);
    expect(s.payments.dec).toBe("confirmed");
    expect(s.events.at(-1)?.name).toBe("autopay_payment_confirmed");
  });

  it("jumping to screen 6 fills in the two payments it needs", () => {
    const s = reducer(initialState, { type: "GOTO", screen: 6 });
    expect(canOfferAutopay(s)).toBe(true);
  });
});

describe("failure path", () => {
  const failed = run([
    { type: "TOGGLE", key: "failurePath" },
    { type: "GOTO", screen: 3 },
    { type: "PAYMENT_STARTED", bill: "nov" },
    { type: "PAYMENT_FAILED", bill: "nov" },
    { type: "REFUNDED", bill: "nov" },
  ]);

  it("ends in a refund, logged as events", () => {
    expect(failed.payments.nov).toBe("refunded");
    expect(failed.events.map((e) => e.name)).toEqual(["first_payment_started", "payment_not_confirmed", "refund_issued"]);
  });

  it("a refunded payment does not count towards AutoPay", () => {
    const s = run([
      { type: "PAYMENT_STARTED", bill: "dec" },
      { type: "PAYMENT_CONFIRMED", bill: "dec" },
      { type: "AUTOPAY_SET_UP", cap: 3000 },
    ], failed);
    expect(s.autopay.status).toBe("none");
  });

  it("starting a payment again never un-confirms a paid bill", () => {
    const s = run([
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
      { type: "PAYMENT_STARTED", bill: "nov" },
    ]);
    expect(s.payments.nov).toBe("confirmed");
  });

  it("a retry after the refund confirms the payment", () => {
    const s = run([{ type: "PAYMENT_STARTED", bill: "nov" }, { type: "PAYMENT_CONFIRMED", bill: "nov" }], failed);
    expect(s.payments.nov).toBe("confirmed");
  });
});

describe("S4 signals: how Paytm spots a rewards cardholder", () => {
  it("paying with a saved credit card logs bill_paid_by_card_when_upi_free", () => {
    const s = run([{ type: "GOTO", screen: 3 }, { type: "PAYMENT_STARTED", bill: "nov", method: "saffron" }]);
    expect(s.payMethods.nov).toBe("saffron");
    expect(s.events.map((e) => e.name)).toContain("bill_paid_by_card_when_upi_free");
  });

  it("paying by UPI does not log the card event", () => {
    const s = run([{ type: "GOTO", screen: 3 }, { type: "PAYMENT_STARTED", bill: "nov", method: "upi" }]);
    expect(s.events.map((e) => e.name)).not.toContain("bill_paid_by_card_when_upi_free");
  });

  it("the quick-pay card payment in December logs it too", () => {
    const s = run([
      { type: "GOTO", screen: 5 },
      { type: "PAYMENT_STARTED", bill: "dec" },
      { type: "PAY_METHOD_CHOSEN", bill: "dec", method: "tarang" },
    ]);
    expect(s.payMethods.dec).toBe("tarang");
    expect(s.events.map((e) => e.name)).toEqual(["reminder_payment_started", "bill_paid_by_card_when_upi_free"]);
  });

  it("credit_cards_saved fires once, with a count, when the S4 journey starts", () => {
    const s = run([
      { type: "SET_SEGMENT", segment: "S4" },
      { type: "SET_SEGMENT", segment: "S1" },
      { type: "SET_SEGMENT", segment: "S4" },
    ]);
    const hits = s.events.filter((e) => e.name === "credit_cards_saved");
    expect(hits).toHaveLength(1);
    expect(hits[0].detail).toBe("3 cards");
  });

  it("a reset while on S4 starts a new S4 journey and logs it again", () => {
    const s = run([{ type: "SET_SEGMENT", segment: "S4" }, { type: "RESET", keepToggles: true }]);
    expect(s.events.map((e) => e.name)).toEqual(["credit_cards_saved"]);
  });

  it("other segments never log it", () => {
    const s = run([{ type: "SET_SEGMENT", segment: "S2" }, { type: "RESET", keepToggles: true }]);
    expect(s.events).toHaveLength(0);
  });
});

describe("Test 4: Guarantee vs rewards", () => {
  it("defaults to the guarantee only group", () => {
    expect(initialState.rewardVariant).toBe("guarantee");
  });

  it("picking a group from S1 moves the story to S2", () => {
    const s = reducer(initialState, { type: "SET_REWARD_VARIANT", variant: "nothing" });
    expect(s.segment).toBe("S2");
    expect(effectiveVariant(s)).toBe("nothing");
  });

  it("picking a group on S4 keeps S4, which is also in the test", () => {
    const s = run([
      { type: "SET_SEGMENT", segment: "S4" },
      { type: "SET_REWARD_VARIANT", variant: "card_rewards" },
    ]);
    expect(s.segment).toBe("S4");
    expect(effectiveVariant(s)).toBe("card_rewards");
  });

  it("tags each payment with the segment, so results are read per segment", () => {
    const s = run([
      { type: "SET_SEGMENT", segment: "S4" },
      { type: "SET_REWARD_VARIANT", variant: "cashback" },
      { type: "GOTO", screen: 3 },
      { type: "PAYMENT_STARTED", bill: "nov" },
    ]);
    expect(s.events.find((e) => e.name === "first_payment_started")?.detail).toBe("test 4 group: cashback, segment S4");
  });

  it("payments outside S2 and S4 are not tagged with a group", () => {
    const s = run([{ type: "GOTO", screen: 3 }, { type: "PAYMENT_STARTED", bill: "nov" }]);
    expect(s.events[0].detail).toBeUndefined();
  });

  it("other segments always get the guarantee", () => {
    const s = run([
      { type: "SET_REWARD_VARIANT", variant: "cashback" },
      { type: "SET_SEGMENT", segment: "S1" },
    ]);
    expect(effectiveVariant(s)).toBe("guarantee");
  });

  it("tags the first payment events with the group", () => {
    const s = run([
      { type: "SET_REWARD_VARIANT", variant: "card_rewards" },
      { type: "GOTO", screen: 3 },
      { type: "PAYMENT_STARTED", bill: "nov" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
    ]);
    const tags = s.events.filter((e) => e.name.startsWith("first_payment")).map((e) => e.detail);
    expect(tags).toEqual(["test 4 group: card rewards, segment S2", "test 4 group: card rewards, segment S2"]);
  });
});

describe("screen 1 note follows the segment", () => {
  it("shows each segment's own signal", () => {
    expect(screen1Note("S1")).toContain("recharges 2 or more numbers");
    expect(screen1Note("S2")).toContain("60 or more days");
    expect(screen1Note("S2")).not.toContain("recharges 2 or more numbers");
    expect(screen1Note("S3")).toContain("one number");
    expect(screen1Note("S3")).toContain("metro card");
    expect(screen1Note("S4")).toContain("credit card bill");
    expect(screen1Note("S4")).toContain("by credit card even when UPI");
  });
});

describe("home offer and reward events", () => {
  it("LOG_ONCE logs a view only once per journey", () => {
    const s = run([
      { type: "LOG_ONCE", name: "home_offer_viewed", detail: "S1, insurance" },
      { type: "LOG_ONCE", name: "home_offer_viewed", detail: "S1, insurance" },
      { type: "LOG_ONCE", name: "home_offer_viewed", detail: "S3, paytm postpaid" },
    ]);
    expect(s.events.map((e) => e.detail)).toEqual(["S1, insurance", "S3, paytm postpaid"]);
  });

  it("a home screen view is logged on screen 0", () => {
    const s = reducer(initialState, { type: "LOG_ONCE", name: "home_offer_viewed", detail: "S1, insurance" });
    expect(s.events[0].screen).toBe(0);
  });

  it("picking a coupon redeems it once, with its category", () => {
    const s = run([
      { type: "COUPON_PICKED", category: "gaming" },
      { type: "COUPON_PICKED", category: "food" },
    ]);
    expect(s.coupon).toBe("gaming");
    expect(s.events.filter((e) => e.name === "coupon_redeemed").map((e) => e.detail)).toEqual(["gaming"]);
  });

  it("the points tracker adds confirmed points-card payments to this year's total", () => {
    const s = run([
      { type: "GOTO", screen: 3 },
      { type: "PAYMENT_STARTED", bill: "nov", method: "saffron" },
      { type: "PAYMENT_CONFIRMED", bill: "nov" },
    ]);
    expect(pointsEarnedHere(s)).toBe(1170);
    expect(pointsThisYear(s)).toBe(6380 + 1170);
  });

  it("cashback cards and unconfirmed payments do not add points", () => {
    const s = run([{ type: "GOTO", screen: 3 }, { type: "PAYMENT_STARTED", bill: "nov", method: "tarang" }]);
    expect(pointsEarnedHere(s)).toBe(0);
  });
});

describe("reset and storage", () => {
  it("reset returns to screen 1 with a clean log", () => {
    const s = run([{ type: "GOTO", screen: 7 }, { type: "LOG", name: "x" }, { type: "RESET" }]);
    expect(s).toEqual(initialState);
  });

  it("reset can keep the presenter toggles", () => {
    const s = run([
      { type: "TOGGLE", key: "failurePath" },
      { type: "SET_REWARD_VARIANT", variant: "cashback" },
      { type: "GOTO", screen: 5 },
      { type: "RESET", keepToggles: true },
    ]);
    expect(s.screen).toBe(0);
    expect(s.toggles.failurePath).toBe(true);
    expect(s.rewardVariant).toBe("cashback");
  });

  it("stored state round-trips, bad data is ignored", () => {
    const s = reducer(initialState, { type: "GOTO", screen: 4 });
    expect(parseStored(JSON.stringify(s))).toEqual(s);
    expect(parseStored("not json")).toBeNull();
    expect(parseStored(null)).toBeNull();
  });
});
