import { BadgeIndianRupee, Clock, ShieldCheck, Wifi } from "lucide-react";
import { rupees } from "@/lib/format";
import { board } from "@/lib/seed";

export function GuaranteePanel() {
  const lines = [
    { Icon: Wifi, text: "We check the board is online before we take your money." },
    { Icon: Clock, text: "If the board does not confirm within 24 hours, you get a full refund automatically." },
    { Icon: BadgeIndianRupee, text: `If the board posts it late, we cover the late fee (up to ${rupees(board.lateFeeCap)}).` },
  ];
  return (
    <section className="rounded-2xl border-2 border-ok/40 bg-ok-soft p-4" aria-label="Paytm Payment Guarantee">
      <div className="flex items-center gap-2 text-[15px] font-bold">
        <ShieldCheck size={20} className="text-ok" /> Paytm Payment Guarantee
      </div>
      <ul className="mt-3 space-y-2.5">
        {lines.map(({ Icon, text }, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-snug">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ok">
              <Icon size={14} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
