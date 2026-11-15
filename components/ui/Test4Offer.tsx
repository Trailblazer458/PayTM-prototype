import { Gift, Sparkles } from "lucide-react";
import type { RewardVariant } from "@/lib/journey";
import { test4Offers } from "@/lib/seed";
import { GuaranteePanel } from "./Guarantee";

/** Screen 3: what this user's Test 4 group sees. Groups get one each: guarantee, cashback, card rewards or nothing. */
export function Test4Offer({
  variant,
  guarantee,
  cardBill = false,
}: {
  variant: RewardVariant;
  guarantee?: [string, string, string];
  /** On a card bill the bonus goes on the card being paid, not on a card used to pay. */
  cardBill?: boolean;
}) {
  if (variant === "guarantee") return <GuaranteePanel lines={guarantee} />;
  if (variant === "nothing") return null;
  const cash = variant === "cashback";
  return (
    <div className="anim-rise flex items-center gap-2 rounded-xl border border-dashed border-warn bg-warn-soft px-3 py-2.5 text-[13px] font-semibold text-warn">
      {cash ? <Gift size={16} className="shrink-0" /> : <Sparkles size={16} className="shrink-0" />}
      {cash ? test4Offers.cashback : cardBill ? test4Offers.card_rewards_card_bill : test4Offers.card_rewards}
    </div>
  );
}
