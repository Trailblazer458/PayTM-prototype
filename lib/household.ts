// The bills each segment has saved on Paytm, for the Bills tab (screen 7) and the summary (screen 8).
// One bill is the one the journey followed. One was paid outside Paytm. All fictional.

import type { BillKind } from "./bills";
import { bills, board, cardBill, leadCard, metroCard, otherBills, otherCardBills, savedCards, soloRecharge, streamingPlan } from "./seed";

export type ItemIcon = "zap" | "wifi" | "phone" | "train" | "tv" | "card";

export interface HouseItem {
  id: string;
  icon: ItemIcon;
  title: string;
  /** Bills tab line for items other than the journey bill. */
  sub: string;
  status: "journey" | "paid" | "outside" | "due";
  /** Summary right-hand text, e.g. "₹349, on time". */
  summary: string;
  /** For "due" items: the chip and the action. */
  dueChip?: string;
  dueAction?: string;
}

export interface Household {
  items: HouseItem[];
  /** The bill paid outside Paytm, with how Paytm knows. */
  outside: { name: string; how: [string, string, string] };
  /** Summary headline count and the notification preview noun. */
  paidCount: number;
  paidNoun: string;
  /** Journey bill lines on the Bills tab: paid by hand, or by AutoPay set up after payment 1. */
  journeyPaid: string;
  journeyAutopaid: string;
}

const rs = (n: number) => "₹" + n.toLocaleString("en-IN");
const tarang = savedCards[1];
const neelgiri = savedCards[2];

const electricity: Household = {
  items: [
    { id: "elec", icon: "zap", title: `${board.short} electricity`, sub: "", status: "journey", summary: `${rs(bills.dec.amount)}, on time` },
    {
      id: "airtel",
      icon: "wifi",
      title: otherBills.airtel.name,
      sub: `${otherBills.airtel.who}, ${otherBills.airtel.number}`,
      status: "outside",
      summary: "Paid elsewhere",
    },
    {
      id: "rakesh",
      icon: "phone",
      title: otherBills.rakesh.name,
      sub: otherBills.rakesh.number,
      status: "due",
      summary: "Due 3 Jan",
      dueChip: otherBills.rakesh.due,
      dueAction: `Recharge ${rs(otherBills.rakesh.amount)}`,
    },
    {
      id: "maa",
      icon: "phone",
      title: otherBills.maa.name,
      sub: `${rs(otherBills.maa.amount)} recharged, ${otherBills.maa.number}`,
      status: "paid",
      summary: `${rs(otherBills.maa.amount)}, on time`,
    },
    {
      id: "own",
      icon: "phone",
      title: otherBills.own.name,
      sub: `${rs(otherBills.own.amount)} recharged, ${otherBills.own.number}`,
      status: "paid",
      summary: `${rs(otherBills.own.amount)}, on time`,
    },
  ],
  outside: {
    name: otherBills.airtel.name,
    how: [
      `Early in the month we fetched your saved Airtel postpaid bill. It showed ${rs(otherBills.airtel.amount)} due.`,
      "A later fetch showed nothing due.",
      "Paytm did not process that payment, so it was paid somewhere else.",
    ],
  },
  paidCount: 3,
  paidNoun: "bills paid on time",
  journeyPaid: `${rs(bills.dec.amount)} paid 19 Dec. Confirmed by the board.`,
  journeyAutopaid: `${rs(bills.dec.amount)} paid by AutoPay on 22 Dec. Confirmed by the board.`,
};

const metro: Household = {
  items: [
    { id: "metro", icon: "train", title: `${metroCard.name} ${metroCard.number}`, sub: "", status: "journey", summary: `${rs(metroCard.topUp)} top-up, on time` },
    {
      id: "stream",
      icon: "tv",
      title: streamingPlan.name,
      sub: `Streaming plan, ${rs(streamingPlan.amount)} a month`,
      status: "outside",
      summary: "Paid elsewhere",
    },
    {
      id: "jio",
      icon: "phone",
      title: `My ${soloRecharge.operator} prepaid`,
      sub: `${rs(soloRecharge.amount)} recharged, ${soloRecharge.number}`,
      status: "paid",
      summary: `${rs(soloRecharge.amount)}, on time`,
    },
  ],
  outside: {
    name: streamingPlan.name,
    how: [
      `Your ${streamingPlan.name} plan is saved on Paytm. It was due to renew on ${streamingPlan.renewed}.`,
      "A later check showed it renewed.",
      "Paytm did not process that payment, so it was paid somewhere else.",
    ],
  },
  paidCount: 2,
  paidNoun: "payments made on time",
  journeyPaid: `${rs(metroCard.topUp)} topped up 13 Dec. Confirmed by City Metro.`,
  journeyAutopaid: `${rs(metroCard.topUp)} added by auto top-up on 14 Dec. Confirmed by City Metro.`,
};

const cardbill: Household = {
  items: [
    { id: "saffron", icon: "card", title: `${leadCard.name} •• ${leadCard.last4}`, sub: "", status: "journey", summary: `${rs(cardBill.decAmount)}, on time` },
    {
      id: "tarang",
      icon: "card",
      title: `${tarang.name} •• ${tarang.last4}`,
      sub: `Card bill, ${rs(otherCardBills.tarang.amount)}`,
      status: "outside",
      summary: "Paid elsewhere",
    },
    {
      id: "neelgiri",
      icon: "card",
      title: `${neelgiri.name} •• ${neelgiri.last4}`,
      sub: `Card bill, ${rs(otherCardBills.neelgiri.amount)}`,
      status: "due",
      summary: "Due 3 Jan",
      dueChip: otherCardBills.neelgiri.due,
      dueAction: `Pay ${rs(otherCardBills.neelgiri.amount)}`,
    },
  ],
  outside: {
    name: `${tarang.name} bill`,
    how: [
      `Early in the month we fetched your saved ${tarang.name} bill. It showed ${rs(otherCardBills.tarang.amount)} due.`,
      "A later fetch showed nothing due.",
      "Paytm did not process that payment, so it was paid somewhere else, likely in the bank's app.",
    ],
  },
  paidCount: 1,
  paidNoun: "card bill paid on time",
  journeyPaid: `${rs(cardBill.decAmount)} paid 25 Dec. Confirmed by Saffron Bank.`,
  journeyAutopaid: `${rs(cardBill.decAmount)} paid by AutoPay on 28 Dec. Confirmed by Saffron Bank.`,
};

export function householdFor(kind: BillKind): Household {
  return kind === "metro" ? metro : kind === "cardbill" ? cardbill : electricity;
}
