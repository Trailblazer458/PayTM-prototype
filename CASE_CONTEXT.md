# Case context: what the submission deck says

A summary of the finished deck (Paytm Case Study 2, Recharge Engagement), so the prototype matches it. If this file and BUILD_SPEC.md ever disagree, BUILD_SPEC.md wins for what to build.

## Problem statement
Most users pay one recurring category on Paytm. Get them to discover, try and regularly pay others.

## Recommendation
Target household managers who already recharge on Paytm. Make Paytm own the cue for their electricity bill and sell certainty, not coins.

## Why now
- WhatsApp launched household bill payments in India in September 2026.
- PhonePe already holds 36% of Bharat Connect bill payments and 57% of UPI AutoPay.
- After a payment, Paytm shows the bill grid 4th to 5th, behind a Postpaid pop-up, a rating request and a scratch card.

## Insights
- **Core:** every bill comes with a cue that says when and where to pay. For electricity, the board sends it. Whoever owns the cue gets the payment.
- **Supporting:** for essentials, people buy certainty, not rewards.

## The 11 barriers, by journey stage
| Stage | Code | Barrier | Call |
|---|---|---|---|
| Notice | B1 | Each bill's prompt comes from the board | Solve |
| Notice | B2 | Bills sit 4th to 5th after a payment | Solve |
| Notice | B3 | Paytm is filed as "the recharge app" | Design around |
| Want | B4 | Rewards are seen as fake | Design around |
| Want | B5 | Today's channel works and is free | Accept |
| Want | B6 | Someone else at home pays | Accept |
| Set up | B7 | Consumer number not to hand | Solve |
| First payment | B8 | Failure means a late fee or cut-off | Solve |
| First payment | B9 | ₹1 mandate for unknown future debits | Design around |
| Repeat | B10 | A family member's payment doesn't show | Solve |
| Repeat | B11 | Too many reminders get muted | Design around |

## Segments
Chosen: S1 Household manager (primary, recharges 2+ numbers), S2 Lapsed bill payer (test cohort, a bill stopped for 60+ days), S3 AutoPay recharger (AutoPay first), S4 Rewards cardholder (include).

**S4 Rewards cardholder** is anyone whose behaviour shows they chase credit card rewards. It is not limited to Paytm co-branded cards. Paytm spots them from 3 signals:
1. Bills paid by credit card even when UPI (Unified Payments Interface) is free.
2. Number of credit cards saved on Paytm, or whose card bills they pay on Paytm.
3. Time spent on Paytm's card rewards page.

The reason to pay here is the reward her own saved card earns on the bill.
Not now: S5 Solo young recharger (later), S6 Tenant or migrant (out), S7 Bills but no recharge (phase 2).

## The MVP journey and prototype screens
| Step | What | Solves | Prototype screens | Measure |
|---|---|---|---|---|
| 1 | Bill suggestion after a recharge | B2 | 1 | Tap rate |
| 2 | Add a bill with the consumer number | B7 | 2 | Numbers added per tap |
| 3 | Payment guarantee | B8 | 3 and 4 | Confirmed first time |
| 4 | Reminders from Paytm (at most 2 a month, only when due) | B1 | 5 | Cue-started payments |
| 5 | AutoPay offered after the 2nd payment, cap shown before PIN | Eases B9 | 6 | AutoPay after 2nd payment |
| 6 | Monthly bills summary, including paid outside Paytm | B10 | 7 and 8 | Bills moved to Paytm |

Phases: Discover (steps 1 and 2), Trust (step 3), Habit (steps 4 to 6).

## How it works
- **Spotting bills paid outside Paytm:** fetch each saved bill early in the cycle. If a later fetch shows no dues and Paytm did not process a payment, mark it "Paid outside Paytm". No SMS reading. Works only for billers saved on Paytm.
- **Payment guarantee:** the bill fetch doubles as a health check (if the board is down, don't take money), live status, refund within 24 hours if not confirmed (RBI's floor is 5 days), late fee covered up to a cap for reliable billers. Customer support runs it by hand first.
- **Monthly summary copy:** default "October sorted: 3 bills paid on time. 1 more could be on autopilot." If paid outside: "Electricity was paid outside Paytm. Bring it here next month?" No amounts in previews.

## Metrics
- **North star:** multi-category active users, paid 2+ recurring categories on Paytm in the last 60 days, read against a holdout. Watched alongside: paid a second category in 2 of the last 3 cycles.
- **Supporting:** reminder-started bill payments, bill suggestion tap rate, consumer numbers added per tap, first payment in 7 days confirmed first time, AutoPay after the 2nd payment, bills paid elsewhere that move to Paytm.
- **Guardrails:** opt-out, mute and uninstall rates. Recharge frequency must not fall. Failed, pending, complaint and double-payment rates.
- **Want stage (the S4 signals, measured as events):**
  - `bill_paid_by_card_when_upi_free`: a bill paid with a saved credit card instead of UPI.
  - `credit_cards_saved`: how many credit cards she has saved on Paytm.
  - `card_rewards_page_time`: seconds spent on the card rewards page.

## Test 4: Guarantee vs rewards
S2 and S4 users are split into four groups: guarantee, cashback, card rewards or nothing. Results are read separately for each segment. Card rewards matter most to S4, so leaving them out would miss the group most likely to respond.

We check which brings people back, at what cost, and whether they keep paying after the offer ends.

Pass: the guarantee brings back as many people as rewards do, costs less, and they keep paying after the offer ends. If it passes, keep the guarantee. Else: keep the reward that works best for that segment.

Read the result separately for S2 and S4, so each segment can end up with a different answer.

## Trade-offs worth showing in the prototype
- The bill suggestion goes first, which pushes down Postpaid, card and ETF offers that earn Paytm more. This is the hardest call.
- Remind only when due: fewer touchpoints, a healthier channel.
- AutoPay after the 2nd payment: slower mandate growth, but trust first.
- No SMS reading: policy-safe, but detects only saved billers.
