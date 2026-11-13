import type { BillKey } from "./seed";
import { board, findCard, savedCards } from "./seed";

export const SCREEN_COUNT = 8;
export type ScreenNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PaymentStatus = "none" | "pending" | "confirmed" | "refunded";
export type Segment = "S1" | "S2" | "S3" | "S4";
/** Test 4: Guarantee vs rewards. Which group this user is in. */
export type RewardVariant = "guarantee" | "cashback" | "card_rewards" | "nothing";
/** "upi" or a saved card id */
export type PayMethod = string;

export const rewardVariants: { id: RewardVariant; label: string }[] = [
  { id: "guarantee", label: "Guarantee only" },
  { id: "cashback", label: "Cashback" },
  { id: "card_rewards", label: "Card rewards" },
  { id: "nothing", label: "Nothing" },
];

export interface MetricEvent {
  id: number;
  name: string;
  screen: ScreenNo;
  detail?: string;
}

export interface Toggles {
  failurePath: boolean;
  showEvents: boolean;
  paytmToday: boolean;
}

export interface JourneyState {
  screen: ScreenNo;
  segment: Segment;
  toggles: Toggles;
  rewardVariant: RewardVariant;
  /** How each bill was paid: "upi" or a saved card id. */
  payMethods: Record<BillKey, PayMethod>;
  consumerNumber: string;
  billerAdded: boolean;
  payments: Record<BillKey, PaymentStatus>;
  reminder: "unset" | "yes" | "no";
  /** setUpAfter: which payment she set it up after (1 = her own choice on screen 4, 2 = the screen 6 offer). */
  autopay: { status: "none" | "active" | "declined"; cap: number | null; setUpAfter?: 1 | 2 | null };
  airtel: "unset" | "remind" | "not_now";
  events: MetricEvent[];
  nextEventId: number;
}

export type Action =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "GOTO"; screen: number }
  | { type: "SUGGESTION_TAPPED" }
  | { type: "SET_CONSUMER_NUMBER"; value: string }
  | { type: "BILLER_ADDED"; via: "typed" | "family" }
  | { type: "PAYMENT_STARTED"; bill: BillKey; method?: PayMethod }
  /** For a payment already started (quick pay): she has now picked how to pay. */
  | { type: "PAY_METHOD_CHOSEN"; bill: BillKey; method: PayMethod }
  | { type: "PAYMENT_CONFIRMED"; bill: BillKey; via?: "autopay" }
  | { type: "PAYMENT_FAILED"; bill: BillKey }
  | { type: "REFUNDED"; bill: BillKey }
  | { type: "REMINDER_CHOICE"; value: "yes" | "no" }
  /** source "offer": the screen 6 offer after 2 payments. "early": her own choice on screen 4 after 1 payment. */
  | { type: "AUTOPAY_SET_UP"; cap: number; source?: "offer" | "early" }
  | { type: "AUTOPAY_DECLINED" }
  | { type: "AIRTEL_CHOICE"; value: "remind" | "not_now" }
  | { type: "LOG"; name: string; detail?: string }
  | { type: "TOGGLE"; key: keyof Toggles }
  | { type: "SET_SEGMENT"; segment: Segment }
  | { type: "SET_REWARD_VARIANT"; variant: RewardVariant }
  | { type: "RESET"; keepToggles?: boolean }
  | { type: "HYDRATE"; state: JourneyState };

export const initialState: JourneyState = {
  screen: 1,
  segment: "S1",
  toggles: { failurePath: false, showEvents: false, paytmToday: false },
  rewardVariant: "guarantee",
  payMethods: { nov: "upi", dec: "upi" },
  consumerNumber: "",
  billerAdded: false,
  payments: { nov: "none", dec: "none" },
  reminder: "unset",
  autopay: { status: "none", cap: null },
  airtel: "unset",
  events: [],
  nextEventId: 1,
};

export function confirmedPayments(s: JourneyState): number {
  return (Object.values(s.payments) as PaymentStatus[]).filter((p) => p === "confirmed").length;
}

/** Paytm only offers AutoPay once two bills have been paid and confirmed on Paytm. */
export function canOfferAutopay(s: JourneyState): boolean {
  return confirmedPayments(s) >= 2;
}

/** She can choose AutoPay herself once one bill has been paid and confirmed. */
export function canChooseAutopay(s: JourneyState): boolean {
  return confirmedPayments(s) >= 1;
}

export function clampScreen(n: number): ScreenNo {
  const r = Math.min(SCREEN_COUNT, Math.max(1, Math.round(n)));
  return r as ScreenNo;
}

/**
 * When the presenter jumps ahead, fill in what the earlier steps would have produced,
 * so every screen has the state it needs. Only fills gaps, never overwrites a choice.
 */
export function fillPrerequisites(s: JourneyState, target: ScreenNo): JourneyState {
  let next = s;
  if (target >= 3 && !next.billerAdded) {
    next = { ...next, billerAdded: true, consumerNumber: next.consumerNumber || board.consumerNumber };
  }
  if (target >= 5 && next.payments.nov !== "confirmed") {
    next = { ...next, payments: { ...next.payments, nov: "confirmed" } };
  }
  if (target >= 6 && next.payments.dec !== "confirmed") {
    next = { ...next, payments: { ...next.payments, dec: "confirmed" } };
  }
  return next;
}

function log(s: JourneyState, name: string, detail?: string): JourneyState {
  const ev: MetricEvent = { id: s.nextEventId, name, screen: s.screen, detail };
  return { ...s, events: [...s.events, ev], nextEventId: s.nextEventId + 1 };
}

/** Test 4 runs on S2 and S4 users. Results are read separately for each segment. */
export const TEST4_SEGMENTS: Segment[] = ["S2", "S4"];

export function inTest4(s: JourneyState): boolean {
  return TEST4_SEGMENTS.includes(s.segment);
}

/** S2 and S4 users get their Test 4 group. Everyone else always gets the guarantee. */
export function effectiveVariant(s: JourneyState): RewardVariant {
  return inTest4(s) ? s.rewardVariant : "guarantee";
}

/** Test 4 group and segment, attached to the first payment events of S2 and S4 users. */
function variantTag(s: JourneyState): string | undefined {
  return inTest4(s) ? `test 4 group: ${s.rewardVariant.replace("_", " ")}, segment ${s.segment}` : undefined;
}

/** Records how a bill is paid. Want stage signal: a credit card chosen although UPI is free. */
function choosePayMethod(s: JourneyState, bill: BillKey, method: PayMethod): JourneyState {
  const next = { ...s, payMethods: { ...s.payMethods, [bill]: method } };
  const card = findCard(method);
  return card ? log(next, "bill_paid_by_card_when_upi_free", `${bill} bill, ${card.name} ending ${card.last4}`) : next;
}

/** Want stage signal: logged once per journey when the S4 story starts. */
function startS4(s: JourneyState): JourneyState {
  if (s.events.some((e) => e.name === "credit_cards_saved")) return s;
  return log(s, "credit_cards_saved", `${savedCards.length} cards`);
}

function goTo(s: JourneyState, target: number): JourneyState {
  const screen = clampScreen(target);
  return { ...fillPrerequisites(s, screen), screen };
}

export function reducer(s: JourneyState, a: Action): JourneyState {
  switch (a.type) {
    case "NEXT":
      return goTo(s, s.screen + 1);
    case "BACK":
      return goTo(s, s.screen - 1);
    case "GOTO":
      return goTo(s, a.screen);

    case "SUGGESTION_TAPPED":
      return goTo(log(s, "bill_suggestion_tapped", `segment ${s.segment}`), 2);

    case "SET_CONSUMER_NUMBER":
      return { ...s, consumerNumber: a.value };

    case "BILLER_ADDED": {
      if (s.consumerNumber.replace(/\D/g, "").length < 10) return s;
      return goTo(log({ ...s, billerAdded: true }, "biller_added", `via ${a.via}`), 3);
    }

    case "PAYMENT_STARTED": {
      if (s.payments[a.bill] === "confirmed") return a.bill === "nov" && s.screen === 3 ? { ...s, screen: 4 } : s;
      const method = a.method ?? s.payMethods[a.bill] ?? "upi";
      const name = a.bill === "nov" ? "first_payment_started" : "reminder_payment_started";
      const detail = a.bill === "nov" ? variantTag(s) : undefined;
      let next = log({ ...s, payments: { ...s.payments, [a.bill]: "pending" } }, name, detail);
      next = choosePayMethod(next, a.bill, method);
      return a.bill === "nov" && next.screen === 3 ? { ...next, screen: 4 } : next;
    }

    case "PAY_METHOD_CHOSEN":
      return choosePayMethod(s, a.bill, a.method);

    case "PAYMENT_CONFIRMED": {
      if (s.payments[a.bill] === "confirmed") return s;
      const name =
        a.bill === "nov" ? "first_payment_confirmed" : a.via === "autopay" ? "autopay_payment_confirmed" : "reminder_payment_confirmed";
      const detail = a.bill === "nov" ? variantTag(s) : undefined;
      return log({ ...s, payments: { ...s.payments, [a.bill]: "confirmed" } }, name, detail);
    }

    case "PAYMENT_FAILED":
      if (s.payments[a.bill] !== "pending") return s;
      return log(s, "payment_not_confirmed", `bill ${a.bill}, retrying`);

    case "REFUNDED":
      if (s.payments[a.bill] !== "pending") return s;
      return log({ ...s, payments: { ...s.payments, [a.bill]: "refunded" } }, "refund_issued", "automatic, within 24 hours");

    case "REMINDER_CHOICE":
      return goTo(log({ ...s, reminder: a.value }, a.value === "yes" ? "reminder_on_by_default" : "reminder_turned_off"), 5);

    case "AUTOPAY_SET_UP": {
      const early = a.source === "early";
      if (a.cap <= 0 || (early ? !canChooseAutopay(s) : !canOfferAutopay(s))) return s;
      const after = early ? 1 : 2;
      const next = log(
        { ...s, autopay: { status: "active", cap: a.cap, setUpAfter: after } },
        "autopay_set_up",
        `cap ₹${a.cap}, after payment ${after}`,
      );
      // Early: carry on to next month, where AutoPay pays the bill. Offer: on to the Bills tab.
      return goTo(next, early ? 5 : 7);
    }

    case "AUTOPAY_DECLINED":
      return goTo(log({ ...s, autopay: { status: "declined", cap: null } }, "autopay_declined"), 7);

    case "AIRTEL_CHOICE":
      return log(
        { ...s, airtel: a.value },
        a.value === "remind" ? "moved_from_elsewhere_invite_accepted" : "moved_from_elsewhere_invite_dismissed",
      );

    case "LOG":
      return log(s, a.name, a.detail);

    case "TOGGLE":
      return { ...s, toggles: { ...s.toggles, [a.key]: !s.toggles[a.key] } };

    case "SET_SEGMENT":
      return a.segment === "S4" ? startS4({ ...s, segment: a.segment }) : { ...s, segment: a.segment };

    case "SET_REWARD_VARIANT": {
      // Test 4 runs on S2 and S4 users. From any other segment, picking a group moves the story to S2.
      const next = { ...s, rewardVariant: a.variant };
      return inTest4(next) ? next : { ...next, segment: "S2" };
    }

    case "RESET": {
      if (!a.keepToggles) return initialState;
      const fresh = { ...initialState, toggles: s.toggles, segment: s.segment, rewardVariant: s.rewardVariant };
      return fresh.segment === "S4" ? startS4(fresh) : fresh;
    }

    case "HYDRATE":
      return a.state;
  }
}

export const STORAGE_KEY = "paytm-recharge-journey-v2";

export function parseStored(raw: string | null): JourneyState | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<JourneyState>;
    if (typeof p.screen !== "number") return null;
    const toggles = { ...initialState.toggles, ...p.toggles } as Toggles & { cashback?: boolean };
    delete toggles.cashback; // from before Test 4 replaced the cashback toggle
    return {
      ...initialState,
      ...p,
      toggles,
      payMethods: { ...initialState.payMethods, ...p.payMethods },
      screen: clampScreen(p.screen),
    };
  } catch {
    return null;
  }
}
