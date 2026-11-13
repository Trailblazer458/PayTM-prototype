import { board } from "@/lib/seed";

/** A drawn sample electricity bill, with the consumer number highlighted. Not a real bill. */
export function SampleBill() {
  const row = (y: number, label: string, value: string) => (
    <g>
      <text x="16" y={y} fontSize="10" fill="#5b6b85">
        {label}
      </text>
      <text x="304" y={y} fontSize="10" fill="#002e6e" textAnchor="end" fontWeight="600">
        {value}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 320 260" className="w-full" role="img" aria-label="Sample electricity bill with the consumer number highlighted near the top">
      <rect x="1" y="1" width="318" height="258" rx="10" fill="#fffdf6" stroke="#d9cfae" />
      <rect x="1" y="1" width="318" height="38" rx="10" fill="#f3ead0" />
      <rect x="1" y="28" width="318" height="11" fill="#f3ead0" />
      <text x="16" y="25" fontSize="12" fontWeight="700" fill="#002e6e">
        {board.short} electricity bill
      </text>
      <text x="304" y="25" fontSize="9" fill="#8a7d52" textAnchor="end">
        SAMPLE
      </text>

      {/* Highlighted consumer number */}
      <rect x="8" y="48" width="304" height="30" rx="6" fill="#e6f8fe" stroke="#00baf2" strokeWidth="2" />
      <text x="16" y="67" fontSize="10.5" fill="#002e6e" fontWeight="700">
        Consumer No.
      </text>
      <text x="300" y="67" fontSize="12" fill="#002e6e" textAnchor="end" fontWeight="800" letterSpacing="0.5">
        {board.consumerNumber}
      </text>

      {row(98, "Name", board.maskedName)}
      {row(116, "Address", "Gomti Nagar, Lucknow")}
      {row(134, "Bill month", "Nov 2026")}
      {row(152, "Units used", "312")}
      <line x1="16" y1="164" x2="304" y2="164" stroke="#e3dcc4" strokeDasharray="3 3" />
      {row(182, "Amount payable", "Rs. 2,340")}
      {row(200, "Due date", "22 Nov 2026")}
      <rect x="16" y="214" width="120" height="30" fill="#ede6cf" />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={20 + i * 5} y="218" width={i % 3 === 0 ? 2.5 : 1.2} height="22" fill="#8a7d52" />
      ))}
      <text x="304" y="234" fontSize="8.5" fill="#8a7d52" textAnchor="end">
        Keep this bill for your records
      </text>
    </svg>
  );
}
