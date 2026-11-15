// One profile per bill the journey can follow. Screens 4 to 6 read their words and numbers from here,
// so electricity (S1, S2), the metro card (S3) and the credit card bill (S4) share one design.
// All names and numbers are fictional.

import { board, bills, cardBill, leadCard, metroCard } from "./seed";

export type BillKind = "electricity" | "metro" | "cardbill";
type BillKey = "nov" | "dec";

export interface BillProfile {
  kind: BillKind;
  /** Who receives and confirms the payment. */
  biller: string;
  /** "the board", "City Metro", "Saffron Bank" */
  confirmer: string;
  /** Short name of the bill, e.g. "UPPCL electricity" */
  billName: string;
  /** Plain name for sentences, e.g. "electricity", "your metro card" */
  shortName: string;
  /** What she pays, per payment. Metro amounts can be changed on screen 3. */
  amounts: Record<BillKey, number>;
  /** Label for each payment, e.g. "November" or "November top-up" */
  label: Record<BillKey, string>;
  dueLong: Record<BillKey, string>;
  dueShort: Record<BillKey, string>;
  /** Can she pay with a saved credit card? Card bills are paid from the bank account. */
  allowCard: boolean;
  guarantee: [string, string, string];
  // Screen 4: live status
  sentSub: string;
  confirmedStep: string;
  confirmedSub: string;
  confirmedTitle: string;
  reference: string;
  stillDue: string;
  reminderTitle: string;
  reminderBody: string;
  reminderRule: string;
  // AutoPay (screen 4 option and screen 6 offer)
  autopayName: "AutoPay" | "Auto top-up";
  earlyTitle: string;
  earlyBody: string;
  earlyIntroTitle: string;
  earlyIntroBody: string;
  offerTitle: string;
  caps: number[];
  customMin: number;
  customMax: number;
  capHint: string;
  paysText: string;
  payeeEveryMonth: string;
  // Screen 5: next month's cue
  jumpDate: string;
  jumpText: string;
  jumpCta: string;
  cueHeader: string;
  cueText: string;
  cueNote: string;
  autopayHeadsUpHeader: string;
  autopayHeadsUp: (cap: number) => string;
  autopayDone: string;
  autopayDebitDay: string;
  quickPaidSub: string;
}

const rs = (n: number) => "₹" + n.toLocaleString("en-IN");

export const electricityProfile: BillProfile = {
  kind: "electricity",
  biller: board.short,
  confirmer: "the board",
  billName: `${board.short} electricity`,
  shortName: "electricity",
  amounts: { nov: bills.nov.amount, dec: bills.dec.amount },
  label: { nov: bills.nov.month, dec: bills.dec.month },
  dueLong: { nov: bills.nov.dueLong, dec: bills.dec.dueLong },
  dueShort: { nov: bills.nov.due, dec: bills.dec.due },
  allowCard: true,
  guarantee: [
    "We check the board is online before we take your money.",
    "If the board does not confirm within 24 hours, you get a full refund automatically.",
    `If the board posts it late, we cover the late fee (up to ${rs(board.lateFeeCap)}).`,
  ],
  sentSub: "Board received the payment",
  confirmedStep: "Confirmed by the board",
  confirmedSub: "Your account with the board is updated",
  confirmedTitle: `Your ${board.short} bill is paid and confirmed.`,
  reference: "Board reference UP2611130042",
  stillDue: `Your ${board.short} bill is still due on ${bills.nov.dueLong}.`,
  reminderTitle: "Reminder is on for next month",
  reminderBody: "You'll be reminded for the bill next month. To turn this off, go to Settings > Notifications.",
  reminderRule: "At most 2 reminders a month, only when a bill is unpaid and due.",
  autopayName: "AutoPay",
  earlyTitle: "Avoid reminders and set up AutoPay",
  earlyBody: "Paytm pays this bill on the due date, within a limit you pick. You get a message 24 hours before each debit.",
  earlyIntroTitle: "Skip the reminders. Put electricity on AutoPay",
  earlyIntroBody: `From December, Paytm pays your ${board.short} bill on the due date, within the limit you pick.`,
  offerTitle: "You've paid electricity on Paytm two months in a row. Put it on autopilot?",
  caps: [2500, 3000, 4000],
  customMin: 2500,
  customMax: 10000,
  capHint: `Your bills have been up to ${rs(Math.max(bills.nov.amount, bills.dec.amount))}. Pick a limit you are comfortable with.`,
  paysText: "The bill amount, on the due date",
  payeeEveryMonth: `${board.short} electricity, every month`,
  jumpDate: "19 December 2026",
  jumpText: `Sunita's December ${board.short} bill of ${rs(bills.dec.amount)} is due on ${bills.dec.due}. She hasn't paid it yet, so Paytm sends her a reminder on WhatsApp.`,
  jumpCta: "Show the WhatsApp reminder",
  cueHeader: "Electricity bill due",
  cueText: `Your ${board.short} electricity bill of ${rs(bills.dec.amount)} is due on ${bills.dec.due}. Pay in 2 taps with the Paytm Payment Guarantee.`,
  cueNote: "Sent only because the bill is unpaid and due. Never more than 2 a month.",
  autopayHeadsUpHeader: "AutoPay tomorrow",
  autopayHeadsUp: (cap) =>
    `Your ${board.short} electricity bill of ${rs(bills.dec.amount)} will be paid by AutoPay tomorrow, ${bills.dec.due}. This is within your ${rs(cap)} limit. Nothing to do.`,
  autopayDone: `${rs(bills.dec.amount)} paid to ${board.short} by AutoPay.`,
  autopayDebitDay: bills.dec.due,
  quickPaidSub: "Paid from the reminder, before the due date.",
};

export const metroProfile: BillProfile = {
  kind: "metro",
  biller: "City Metro",
  confirmer: "City Metro",
  billName: `${metroCard.name} ${metroCard.number}`,
  shortName: "your metro card",
  amounts: { nov: metroCard.topUp, dec: metroCard.topUp },
  label: { nov: "November top-up", dec: "December top-up" },
  dueLong: { nov: "today", dec: "today" },
  dueShort: { nov: "today", dec: "today" },
  allowCard: true,
  guarantee: [
    "We check City Metro is online before we take your money.",
    "If City Metro does not confirm within 24 hours, you get a full refund automatically.",
    "If the top-up does not reach your card at the station, we refund it.",
  ],
  sentSub: "City Metro received the top-up",
  confirmedStep: "Confirmed by City Metro",
  confirmedSub: "Ready to collect at any station",
  confirmedTitle: "Your metro top-up is confirmed.",
  reference: "Tap your card at any station's Add Value Machine (AVM) within 180 days to add the balance.",
  stillDue: "Your metro card was not topped up.",
  reminderTitle: "Reminder is on for your next top-up",
  reminderBody:
    "You top up about once a month. We'll remind you when it's usually time. To turn this off, go to Settings > Notifications.",
  reminderRule: "At most 2 reminders a month, only around when you usually top up.",
  autopayName: "Auto top-up",
  earlyTitle: "Avoid reminders and set up auto top-up",
  earlyBody: "Paytm tops up your metro card once a month, within a limit you pick. You get a message 24 hours before each top-up.",
  earlyIntroTitle: "Skip the reminders. Put your metro card on auto top-up",
  earlyIntroBody: "From December, Paytm tops up your metro card once a month, within the limit you pick.",
  offerTitle: "You've topped up your metro card on Paytm two months in a row. Put it on autopilot?",
  caps: [300, 500, 1000],
  customMin: 100,
  customMax: 2000,
  capHint: `You usually top up ${rs(metroCard.topUp)}. Pick the most Paytm may top up in a month.`,
  paysText: `${rs(metroCard.topUp)}, once a month`,
  payeeEveryMonth: "Metro card, every month",
  jumpDate: "13 December 2026",
  jumpText: "It's a month since your last metro top-up. You usually top up about now, so Paytm sends a reminder on WhatsApp.",
  jumpCta: "Show the WhatsApp reminder",
  cueHeader: "Metro card top-up",
  cueText: `It's a month since you topped up your ${metroCard.name} ${metroCard.number}. Top up ${rs(metroCard.topUp)} in 2 taps with the Paytm Payment Guarantee.`,
  cueNote: "Sent only around when you usually top up. Never more than 2 a month.",
  autopayHeadsUpHeader: "Auto top-up tomorrow",
  autopayHeadsUp: (cap) =>
    `Your ${metroCard.name} ${metroCard.number} will be topped up with ${rs(metroCard.topUp)} tomorrow. This is within your ${rs(cap)} limit. Nothing to do.`,
  autopayDone: `${rs(metroCard.topUp)} added to your metro card by auto top-up. Tap it at any station to collect.`,
  autopayDebitDay: "14 Dec",
  quickPaidSub: "Topped up from the reminder. Tap your card at any station to collect.",
};

export const cardBillProfile: BillProfile = {
  kind: "cardbill",
  biller: "Saffron Bank",
  confirmer: "Saffron Bank",
  billName: `${leadCard.name} •• ${leadCard.last4}`,
  shortName: "your card bill",
  amounts: { nov: cardBill.amount, dec: cardBill.decAmount },
  label: { nov: "November statement", dec: "December statement" },
  dueLong: { nov: "28 November", dec: "28 December" },
  dueShort: { nov: cardBill.due, dec: cardBill.decDue },
  allowCard: false,
  guarantee: [
    "We check Saffron Bank is online before we take your money.",
    "If the bank does not confirm within 24 hours, you get a full refund automatically.",
    `If the bank posts it late, we cover the late fee (up to ${rs(cardBill.lateFeeCap)}).`,
  ],
  sentSub: "Saffron Bank received the payment",
  confirmedStep: "Confirmed by Saffron Bank",
  confirmedSub: "Your card limit is restored",
  confirmedTitle: "Your Saffron Bank card bill is paid and confirmed.",
  reference: "Bank reference SB2611130318",
  stillDue: `Your Saffron Bank card bill is still due on 28 November.`,
  reminderTitle: "Reminder is on for next month",
  reminderBody: "You'll be reminded for the card bill next month. To turn this off, go to Settings > Notifications.",
  reminderRule: "At most 2 reminders a month, only when a bill is unpaid and due.",
  autopayName: "AutoPay",
  earlyTitle: "Avoid reminders and set up AutoPay",
  earlyBody: "Paytm pays the total due on the due date, within a limit you pick. You get a message 24 hours before each debit.",
  earlyIntroTitle: "Skip the reminders. Put your card bill on AutoPay",
  earlyIntroBody: "From December, Paytm pays your Saffron Bank card bill on the due date, within the limit you pick.",
  offerTitle: "You've paid your card bill on Paytm two months in a row. Put it on autopilot?",
  caps: [20000, 25000, 40000],
  customMin: 5000,
  customMax: 200000,
  capHint: `Your card bills have been up to ${rs(Math.max(cardBill.amount, cardBill.decAmount))}. Pick a limit you are comfortable with.`,
  paysText: "The total due, on the due date",
  payeeEveryMonth: "Saffron Bank card bill, every month",
  jumpDate: "25 December 2026",
  jumpText: `Your December Saffron Bank card bill of ${rs(cardBill.decAmount)} is due on ${cardBill.decDue}. You haven't paid it yet, so Paytm sends a reminder on WhatsApp.`,
  jumpCta: "Show the WhatsApp reminder",
  cueHeader: "Card bill due",
  cueText: `Your ${leadCard.name} •• ${leadCard.last4} bill of ${rs(cardBill.decAmount)} is due on ${cardBill.decDue}. Pay in 2 taps with the Paytm Payment Guarantee and keep your points safe.`,
  cueNote: "Sent only because the bill is unpaid and due. Never more than 2 a month.",
  autopayHeadsUpHeader: "AutoPay tomorrow",
  autopayHeadsUp: (cap) =>
    `Your Saffron Bank card bill of ${rs(cardBill.decAmount)} will be paid by AutoPay tomorrow, ${cardBill.decDue}. This is within your ${rs(cap)} limit. Nothing to do.`,
  autopayDone: `${rs(cardBill.decAmount)} paid to Saffron Bank by AutoPay.`,
  autopayDebitDay: cardBill.decDue,
  quickPaidSub: "Paid from the reminder, before the due date. No late fee, no interest.",
};

export function billKindFor(segment: string): BillKind {
  if (segment === "S3") return "metro";
  if (segment === "S4") return "cardbill";
  return "electricity";
}

export function profileFor(segment: string): BillProfile {
  const kind = billKindFor(segment);
  return kind === "metro" ? metroProfile : kind === "cardbill" ? cardBillProfile : electricityProfile;
}
