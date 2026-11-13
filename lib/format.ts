/** ₹2,340 style. Indian digit grouping (₹1,00,000). */
export function rupees(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}
