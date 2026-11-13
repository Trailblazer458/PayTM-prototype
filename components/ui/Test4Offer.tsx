import { Gift, Sparkles } from "lucide-react";
import type { RewardVariant } from "@/lib/journey";
import { test4Offers } from "@/lib/seed";
import { GuaranteePanel } from "./Guarantee";

/** Screen 3: what this user's Test 4 group sees. Groups get one each: guarantee, cashback, card rewards or nothing. */
export function Test4Offer({ variant }: { variant: RewardVariant }) {
  if (variant === "guarantee") return <GuaranteePanel />;
  if (variant === "nothing") return null;
  const cash = variant === "cashback";
  return (
    <div className="anim-rise flex items-center gap-2 rounded-xl border border-dashed border-warn bg-warn-soft px-3 py-2.5 text-[13px] font-semibold text-warn">
      {cash ? <Gift size={16} className="shrink-0" /> : <Sparkles size={16} className="shrink-0" />}
      {cash ? test4Offers.cashback : test4Offers.card_rewards}
    </div>
  );
}
