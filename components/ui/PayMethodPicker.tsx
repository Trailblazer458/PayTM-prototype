"use client";

import { CreditCard, Landmark } from "lucide-react";
import type { PayMethod } from "@/lib/journey";
import { cardReward, savedCards } from "@/lib/seed";

/** UPI (default, free) or one of her saved credit cards. Simulated cards, last 4 digits only. */
export function PayMethodPicker({
  value,
  onChange,
  amount,
}: {
  value: PayMethod;
  onChange: (m: PayMethod) => void;
  amount: number;
}) {
  const options = [
    { id: "upi", title: "UPI", sub: "Free. Straight from your bank account", Icon: Landmark },
    ...savedCards.map((c) => ({
      id: c.id,
      title: `${c.name} •• ${c.last4}`,
      sub: `Credit card. Earns ${cardReward(c, amount)}`,
      Icon: CreditCard,
    })),
  ];
  return (
    <section aria-label="Pay with">
      <h2 className="mb-2 text-[13px] font-semibold text-muted">Pay with</h2>
      <div className="space-y-2" role="radiogroup" aria-label="Payment method">
        {options.map(({ id, title, sub, Icon }) => {
          const on = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition ${
                on ? "border-sky bg-sky-soft" : "border-line bg-white hover:border-sky/50"
              }`}
            >
              <Icon size={20} className={`shrink-0 ${on ? "text-sky" : "text-muted"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{title}</span>
                <span className="block text-[12px] text-muted">{sub}</span>
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  on ? "border-sky" : "border-[#b3bfd1]"
                }`}
              >
                {on ? <span className="h-2.5 w-2.5 rounded-full bg-sky" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-muted">Simulated cards with example reward rates.</p>
    </section>
  );
}
