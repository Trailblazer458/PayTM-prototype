// All values are fictional. Use these everywhere so the story stays consistent.

export const persona = {
  name: "Sunita Verma",
  firstName: "Sunita",
  age: 42,
  city: "Lucknow",
  segment: "S1 Household manager",
};

export const recharge = {
  amount: 349,
  forName: "Maa",
  number: "98XXX XX421",
  operator: "Jio",
  plan: "28 days, 1.5 GB a day",
};

export const board = {
  short: "UPPCL",
  full: "Uttar Pradesh Power Corporation Limited",
  area: "Lucknow",
  consumerNumber: "4521 0098 76",
  maskedName: "R**** V****",
  lateFeeCap: 200,
};

export const bills = {
  nov: { month: "November", amount: 2340, due: "22 Nov", dueLong: "22 November" },
  dec: { month: "December", amount: 2180, due: "22 Dec", dueLong: "22 December" },
} as const;

export type BillKey = keyof typeof bills;

export const refundDeadline = "9:40 pm tomorrow";

export const autopayCaps = [2500, 3000, 4000] as const;
export const customCapMin = 2500;
export const customCapMax = 10000;

/** Other bills saved on Paytm, shown on the Bills tab (screen 7) and the summary (screen 8). */
export const otherBills = {
  airtel: { name: "Airtel postpaid", who: "Family plan", number: "98XXX XX107", amount: 799 },
  maa: { name: "Maa's Jio prepaid", who: "Maa", number: recharge.number, amount: recharge.amount },
  own: { name: "My Airtel prepaid", who: "Sunita", number: "99XXX XX552", amount: 299 },
  rakesh: { name: "Rakesh's Vi prepaid", who: "Rakesh", number: "97XXX XX318", amount: 299, due: "Due in 5 days" },
};

/**
 * Her 3 saved credit cards. Fictional banks, example reward rates, last 4 digits only.
 * The first card is the one the S4 story leads with.
 */
export type SavedCard = {
  id: string;
  name: string;
  last4: string;
  kind: "points" | "cashback" | "miles";
  /** reward units per ₹1 spent */
  rate: number;
};

export const savedCards: SavedCard[] = [
  { id: "saffron", name: "Saffron Bank Rewards Card", last4: "4821", kind: "points", rate: 0.5 },
  { id: "tarang", name: "Tarang Bank Cashback Card", last4: "1907", kind: "cashback", rate: 0.01 },
  { id: "neelgiri", name: "Neelgiri Bank Travel Card", last4: "6634", kind: "miles", rate: 0.02 },
];

export const leadCard = savedCards[0];

export function findCard(id: string | undefined): SavedCard | undefined {
  return savedCards.find((c) => c.id === id);
}

/** "1,170 points", "₹23 cashback" or "47 air miles" for this card on this amount. */
export function cardReward(card: SavedCard, amount: number): string {
  const n = Math.round(amount * card.rate);
  if (card.kind === "cashback") return `₹${n.toLocaleString("en-IN")} cashback`;
  if (card.kind === "miles") return `${n.toLocaleString("en-IN")} air miles`;
  return `${n.toLocaleString("en-IN")} points`;
}

export function cardLabel(card: SavedCard): string {
  return `${card.name} •• ${card.last4}`;
}

/** S3 Solo young recharger: one number, small frequent top-ups. */
export const soloRecharge = { amount: 199, number: "99XXX XX552", operator: "Jio", plan: "20 days, 1 GB a day" };

/** S3 next bill: a metro card recharge. Fictional card number, generic city metro. */
export const metroCard = {
  name: "Metro card",
  number: "•• 7710",
  fullNumber: "3071 5528 64",
  balance: 40,
  topUp: 300,
  minTopUp: 100,
  step: 50,
  maxTopUp: 2000,
};

/** S4 next bill: her credit card bills. The lead card is the one the story follows. */
export const cardBill = {
  amount: 18450,
  minimum: 920,
  due: "28 Nov",
  decAmount: 15780,
  decDue: "28 Dec",
  lateFeeCap: 500,
  /** Points this statement's spends earned on the card. Example rate. */
  statementPoints: 9225,
};

/** Her other card bills, for the S4 Bills tab and summary. */
export const otherCardBills = {
  tarang: { amount: 7340, due: "2 Dec" },
  neelgiri: { amount: 4120, due: "Due in 5 days" },
};

/** S3's other bills, for the Bills tab and summary. Generic streaming service. */
export const streamingPlan = { name: "StreamBox Premium", amount: 149, renewed: "5 Dec" };

/** S4 card points tracker: points already earned on bills paid here this year, before this journey. */
export const pointsEarlierThisYear = 6380;

/** Home "For you" offer card, by segment. Fictional terms. No real lender or insurer names. */
export const homeOffers = {
  S1: {
    kind: "Insurance",
    title: "Family health insurance",
    body: "Cover your family of 4 for ₹5 lakh. Plans from ₹612 a month.",
    cta: "See plans",
  },
  S2: {
    kind: "Short-term credit",
    title: "Pay bills now, pay back in 30 days",
    body: "A short-term credit line for your bills, up to ₹5,000.",
    cta: "Check limit",
  },
  S3: {
    kind: "Paytm Postpaid",
    title: "Spend now, pay next month",
    body: "A credit line up to ₹10,000 for top-ups, food and games.",
    cta: "Check limit",
  },
  S4: {
    kind: "Insurance",
    title: "Purchase protection for card spends",
    body: "Cover what you buy on your credit cards. From ₹49 a year.",
    cta: "See cover",
  },
} as const;

export const homeOfferSmallPrint =
  "Loans and credit by partner lenders, subject to eligibility. Insurance by partner insurers.";

/** S3 coupon streak. Generic merchants, from the gift voucher catalogue, funded by merchants. */
export const coupons = {
  food: { label: "Food", merchant: "Tiffin Point", offer: "₹100 off orders above ₹299", code: "TIFFIN100" },
  fashion: { label: "Fashion", merchant: "StyleKart", offer: "15% off, up to ₹250", code: "STYLE15" },
  gaming: { label: "Gaming", merchant: "PlayZone", offer: "₹150 game credit", code: "PLAY150" },
} as const;

/** Test 4 offers. Paytm-funded, example amounts. */
export const test4Offers = {
  cashback: "₹25 cashback on this bill",
  card_rewards: "500 bonus reward points when you pay this bill with a credit card",
  card_rewards_card_bill: "500 bonus reward points on your card when you pay this bill here",
};

/** Screens 5 to 8 happen in December. */
export const decemberReminderDate = "19 December 2026";
export const summaryMonth = "December";
