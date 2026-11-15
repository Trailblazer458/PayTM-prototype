// Presenter panel text for each screen. Matches CASE_CONTEXT.md.
// Abbreviations are written in full the first time they appear on each screen,
// because a judge may jump straight to any screen.

export interface ScreenMeta {
  no: number;
  step: string;
  name: string;
  phase: "Discover" | "Trust" | "Habit";
  barrier: string;
  change: string;
  metric: string;
  note?: string;
}

export const screens: ScreenMeta[] = [
  {
    no: 0,
    step: "Home",
    name: "Home with a For you offer",
    phase: "Discover",
    barrier: "None directly. It pays for the bill-first order on screen 1",
    change:
      "Today a points or coins banner sits on the home screen. Here a For you card shows one credit or insurance offer chosen for the segment, above the UPI (Unified Payments Interface) Money Transfer section.",
    metric: "Home offer tap rate, and revenue per user against a holdout",
    note: "This card earns back some of the revenue lost when bills move above Postpaid and card offers after a payment. Tap Recharge again to start the journey.",
  },
  {
    no: 1,
    step: "Step 1",
    name: "Bill suggestion after a recharge",
    phase: "Discover",
    barrier: "B2: Bills sit 4th to 5th after a payment",
    change:
      "Today a Postpaid pop-up, a rating request and a scratch card come before any bill. Here the bill suggestion is the first card. Nothing is removed. Only the order changes.",
    metric: "Bill suggestion tap rate after a recharge",
    // The signal depends on the segment, see screen1Note().
    note: undefined,
  },
  {
    no: 2,
    step: "Step 2",
    name: "Add a bill with just the consumer number",
    phase: "Discover",
    barrier: "B7: Consumer number not in hand",
    change:
      "Today she picks the board from a long list and must find the number alone. Here the board is chosen from her city, a sample bill shows where the number sits, and family can send it on WhatsApp.",
    metric: "Consumer numbers added per card tap",
  },
  {
    no: 3,
    step: "Step 3",
    name: "Bill fetched, with the payment guarantee",
    phase: "Trust",
    barrier: "B8: Failure means a late fee or a cut-off",
    change:
      "Today there is no promise if the board does not confirm. Here the bill fetch doubles as a health check, and a 24 hour automatic refund and late fee cover are shown before she pays.",
    metric: "First payment within 7 days, confirmed first time",
    note: "The Reserve Bank of India (RBI) floor for refunds is 5 days. We promise 24 hours. She can pay by UPI (Unified Payments Interface), which is free, or by a saved credit card. Try the Test 4 picker to see the guarantee against rewards.",
  },
  {
    no: 4,
    step: "Step 3, continued",
    name: "Live status",
    phase: "Trust",
    barrier: "B8: Failure means a late fee or a cut-off",
    change:
      "Today a stuck payment just says pending. Here she sees each step, and if the biller is slow she knows exactly when her money comes back.",
    metric: "First payment confirmed first time",
    note: "Reminders are on by default and she can turn them off in Settings. She can also choose AutoPay here instead, after her first payment. Design around B11 (too many reminders get muted): at most 2 reminders a month, only when a bill is unpaid and due. Guardrail: reminder opt-out rate. Try the failure path toggle.",
  },
  {
    no: 5,
    step: "Step 4",
    name: "Reminder from Paytm on WhatsApp",
    phase: "Habit",
    barrier: "B1: Each bill's prompt comes from the board",
    change:
      "Today the board's Short Message Service (SMS) text is the cue, so the board's website gets the payment. Here Paytm sends the cue, only when the bill is unpaid and due.",
    metric: "Bill payments started by a Paytm reminder",
    note: "Whoever owns the cue gets the payment.",
  },
  {
    no: 6,
    step: "Step 5",
    name: "AutoPay offered after the second payment",
    phase: "Habit",
    barrier: "Eases B9: ₹1 mandate for unknown future debits",
    change:
      "Today AutoPay asks for a ₹1 mandate up front for debits she cannot see. Here it comes after two good payments, she picks the cap herself, and the cap is shown before the Personal Identification Number (PIN).",
    metric: "AutoPay set up after the 2nd payment",
    note: "Trade-off: slower mandate growth, but trust first. Nothing is pre-selected and Not now is as visible as Set up.",
  },
  {
    no: 7,
    step: "Step 6",
    name: "Paid outside Paytm",
    phase: "Habit",
    barrier: "B10: A family member's payment doesn't show",
    change:
      "Today a bill paid on another app just goes quiet. Here Paytm spots it from the bill fetch, without reading Short Message Service (SMS) texts, and invites it back once.",
    metric: "Bills paid elsewhere that move to Paytm after a summary",
    note: "How it works: fetch each saved bill early in the cycle. If a later fetch shows no dues and Paytm processed no payment, mark it Paid outside Paytm. Works only for saved billers.",
  },
  {
    no: 8,
    step: "Step 6",
    name: "Monthly summary",
    phase: "Habit",
    barrier: "B10: A family member's payment doesn't show",
    change:
      "Today there is no monthly view across bills. Here one summary shows what is sorted and gives one next action. Notification previews never show amounts.",
    metric:
      "North star: multi-category active users, who paid 2 or more recurring categories on Paytm in the last 60 days",
    note: "Guardrails: opt-out, mute and uninstall rates. Recharge frequency must not fall.",
  },
];

export const segments = [
  {
    id: "S1",
    name: "Household manager",
    why: "Recharges 2 or more numbers. Default story. Bill suggestion first.",
    signal: "she recharges 2 or more numbers on Paytm",
  },
  {
    id: "S2",
    name: "Lapsed bill payer",
    why: "A bill stopped for 60 or more days. Welcome back card. Also in Test 4, so its offer follows the group, the guarantee by default.",
    signal: "a bill she used to pay on Paytm has had no payment for 60 or more days",
  },
  {
    id: "S3",
    name: "Solo young recharger",
    why: "One number, small frequent top-ups, no bills. Spends on food delivery or gaming through Paytm UPI. Next bill: a metro card. Reward: a coupon streak.",
    signal:
      "they recharge one number with small, frequent top-ups, pay no bills, and spend on food delivery or gaming through Paytm UPI (Unified Payments Interface)",
  },
  {
    id: "S4",
    name: "Rewards cardholder",
    why: "Chases credit card rewards, on any bank's card. The reward her saved card earns on this bill is the reason to pay here. Also in Test 4.",
    signal:
      "she pays bills by credit card even when UPI (Unified Payments Interface) is free, has 3 credit cards saved on Paytm and spends time on the card rewards page",
  },
] as const;

export const NEXT_BILL_LINE = "The next bill is chosen per segment. Electricity is one of several.";

const nextBill: Record<string, string> = {
  S1: "electricity",
  S2: "the bill they stopped paying, with the guarantee up front",
  S3: "a metro card recharge (or an OTT, over-the-top streaming, subscription)",
  S4: "their credit card bill, with the card points they would earn",
};

/** Screen 1 presenter note. The signal and next bill change with the segment, the trade-off does not. */
export function screen1Note(segment: string): string {
  const seg = segments.find((s) => s.id === segment) ?? segments[0];
  return `Signal used (${seg.id}): ${seg.signal}. Next bill for ${seg.id}: ${nextBill[seg.id]}. Trade-off: this pushes down offers that earn Paytm more.`;
}

/** Screen 8 presenter note: which reward this segment gets. No coins, scratch cards or lucky draws. */
export function screen8RewardNote(segment: string): string {
  if (segment === "S3")
    return "Reward for S3: a coupon streak. Recharge 2 months in a row and pick one coupon. Coupons come from Paytm's existing gift voucher catalogue and are funded by merchants.";
  if (segment === "S4")
    return "Reward for S4: a card points tracker. Points are shown at payment and added up for the year here.";
  return `Reward for ${segment}: a progress meter, 3 of 4 home bills sorted. No coins, no scratch cards, no lucky draws.`;
}

export function metaFor(no: number): ScreenMeta {
  return screens.find((m) => m.no === no) ?? screens[0];
}
