# Paytm Recharge Engagement: prototype build spec

This is the clickable prototype for Paytm Case Study 2, "Recharge Engagement". The submission deck is finished. This prototype is the "live prototype" it links to (deck slides 1 and 7). Its job is to let a judge who has never met us walk the MVP journey in a few minutes and see which barrier each screen removes and which metric it moves.

Read `CASE_CONTEXT.md` for the full reasoning behind the deck. This file records what to build.

## The problem in one paragraph

Most Paytm users pay one recurring category on Paytm, usually a mobile recharge. Paytm needs them to discover, try and regularly pay other recurring bills. Our core insight is that every bill comes with a cue, a prompt that says when and where to pay. For electricity, the board sends it, so the board's channel gets the payment. **Whoever owns the cue gets the payment.** The supporting insight is that for essentials people buy certainty, not rewards: a failed bill costs a late fee or a cut-off, while a coin is worth little.

## What the prototype must prove

1. Paytm can own the cue for a bill the user has never added (step 1 and step 4).
2. Adding a bill is easy even when the consumer number is not to hand (step 2).
3. A payment guarantee removes the fear of a failed bill payment (step 3).
4. AutoPay works when it is offered after trust is built, with the cap shown up front (step 5).
5. Paytm can see bills paid elsewhere and invite them back without nagging (step 6).

## Persona and seed data (all fictional)

- **Sunita Verma, 42, Lucknow.** Segment S1, Household manager. She recharges three numbers on Paytm every month: her own, her husband Rakesh's and her mother's. She pays electricity through the board's own website when the SMS from the board arrives. The family's Airtel postpaid bill is paid by Rakesh on another app.
- Electricity board: Uttar Pradesh Power Corporation Limited (UPPCL), Lucknow. Consumer number: 4521 0098 76 (fictional). Name on bill: R**** V**** (masked).
- Bill 1 (November): ₹2,340, due 22 Nov. Bill 2 (December): ₹2,180, due 22 Dec.
- The recharge that opens the journey: ₹349 for Maa (98XXX XX421).
- Use these exact values everywhere so the story stays consistent.

## The eight screens (core scope, build these first)

Each screen lists what it shows, the barrier it solves (barrier codes match the deck) and the metric it moves.

### Screen 1. Recharge success with a bill suggestion (step 1)
- Top: "₹349 recharge successful for Maa" with the usual success tick.
- **The first card under the success message is the bill suggestion**, not an offer. Copy idea: "Pay your home's electricity bill here too. Add it once and we'll remind you when it's due." Button: "Add electricity bill". A small line: "Covered by the Paytm Payment Guarantee."
- Below it, in this order: "Recharge another number", then the existing offers (Postpaid credit, scratch card) moved down, then the full bill grid. Nothing is removed. Only order and prominence change.
- Solves **B2**: bills sit 4th to 5th after a payment today. Signal used: she recharges 2+ numbers.
- Metric: bill suggestion tap rate after a recharge.

### Screen 2. Add a bill with just the consumer number (step 2)
- The board is pre-selected from her location: "UPPCL, Lucknow" with a "Change" link.
- One field: consumer number.
- "Where do I find it?" opens a bottom sheet with a drawn sample electricity bill that highlights where the consumer number sits.
- "Ask family" opens a mock WhatsApp share with a pre-filled message: "Can you send me the consumer number from our electricity bill? I want to pay it on Paytm." Show a simulated reply arriving with the number, which auto-fills the field.
- Solves **B7**: the consumer number is not to hand.
- Metric: consumer numbers added per card tap.

### Screen 3. Bill fetched, with the payment guarantee (step 3)
- "Board is online. Bill found." Name masked, amount ₹2,340, due date 22 Nov, and a note of the board's late fee.
- **Paytm Payment Guarantee** panel, three short lines:
  1. We check the board is online before we take your money.
  2. If the board does not confirm within 24 hours, you get a full refund automatically.
  3. If the board posts it late, we cover the late fee (up to ₹200).
- **Payment method choice:** UPI (default, free) or one of her 3 saved credit cards. Use fictional bank card names with only the last 4 digits shown. The same choice appears on the quick-pay screen (screen 5). Paying by card logs `bill_paid_by_card_when_upi_free` and shows the reward that card earns once the board confirms.
- Pay button opens a simulated UPI PIN sheet. Label it clearly as a demo ("Demo: enter any 4 digits"). Never use the real UPI or NPCI PIN screen branding.
- **Test 4: Guarantee vs rewards** (presenter picker, "guarantee only" by default). Presenter line: "S2 and S4 users are split into four groups: guarantee, cashback, card rewards or nothing. Results are read separately for each segment." We check which brings people back, at what cost, and whether they keep paying after the offer ends.
  - Pass: the guarantee brings back as many people as rewards do, costs less, and they keep paying after the offer ends. If it passes, keep the guarantee. Else: keep the reward that works best for that segment.
  - Read the result separately for S2 and S4, so each segment can end up with a different answer.
  - The picker works in both the S2 and S4 versions of the segment switcher. On S1 or S3, picking a group moves the story to S2. Segments outside the test always get the guarantee.
  - The picked group changes the first card on screen 1 (S2 welcome back card, S4 card rewards card) and the offer block on screen 3. Only the guarantee group sees the guarantee.
  - First payment events are tagged with the group and the segment, so results can be read per segment.
- Solves **B8**: a failure means a late fee or a cut-off.
- Metric: first payment within 7 days, confirmed first time.

### Screen 4. Live status (step 3, continued)
- A three-step tracker that animates over about 4 seconds: Paid → Sent to UPPCL → Confirmed by the board.
- After confirmation: "Your UPPCL bill is paid and confirmed." Then one question: "Want a reminder when next month's bill is due?" with "Yes, remind me" and "No thanks". Explain: "At most 2 reminders a month, only when a bill is unpaid and due."
- Failure path (presenter toggle): the tracker stops at "Sent to UPPCL" and shows "Not confirmed yet. We are retrying. If it is not confirmed by 9:40 pm tomorrow, ₹2,340 comes back to your account automatically." Then a simulated refund confirmation.
- Solves **B8**, continued.

### Screen 5. Reminder from Paytm on WhatsApp (step 4)
- Jump to December. A mock WhatsApp chat with a verified "Paytm Bill Payments" business account.
- Message: "Your UPPCL electricity bill of ₹2,180 is due on 22 Dec. Pay in 2 taps with the Paytm Payment Guarantee." Button: "Pay now".
- "Pay now" opens a quick-pay screen with the saved bill, then the demo PIN, then a short success.
- Small note under the chat: "Sent only because the bill is unpaid and due. Never more than 2 a month."
- Solves **B1**: each bill's prompt comes from the board. Now Paytm owns the cue.
- Metric: bill payments started by a Paytm reminder.

### Screen 6. AutoPay offered after the second payment (step 5)
- "You've paid electricity on Paytm two months in a row. Put it on autopilot?"
- The user picks the maximum amount Paytm may ever debit: chips for ₹2,500, ₹3,000, ₹4,000 and "Custom". **Nothing is pre-selected.** The confirm button stays disabled until she picks.
- Before the PIN: "Paytm will never debit more than ₹3,000 (the cap you chose). You get a message 24 hours before each debit. Cancel any time from Bills."
- "Not now" is as visible as "Set up AutoPay". No dark patterns.
- Eases **B9**: a ₹1 mandate for unknown future debits.
- Metric: AutoPay set up after the 2nd payment.

### Screen 7. Paid outside Paytm (step 6)
- The Bills tab. Each saved bill shows a status chip: "Paid on Paytm", "Due in 5 days" or "Paid outside Paytm".
- Airtel postpaid shows "Paid outside Paytm this month" with a gentle line: "Bring it here next month? It is covered by the same guarantee." Buttons: "Remind me next month" and "Not now".
- A small "How do we know?" link explains: "We checked the bill. It cleared without a payment on Paytm. We never read your SMS."
- Solves **B10**: a family member's payment does not show.
- Metric: bills paid elsewhere that move to Paytm after a summary.

### Screen 8. Monthly summary (step 6)
- Opens from a push notification preview. **Notification previews never show amounts.** Preview text: "November sorted: 3 bills paid on time. 1 more could be on autopilot."
- The summary: paid on Paytm (with an on-time tick), on autopilot, paid outside Paytm, and pending. One clear next action: "Put Airtel postpaid on autopilot" (only if it has been paid on Paytm twice, otherwise "Remind me next month").
- Metric: multi-category active users (the north star): paid 2+ recurring categories on Paytm in the last 60 days.

## Presenter layer (part of the core build)

Judges will open this on a laptop, so the desktop view needs a way to tell the story.

- **Layout:** on desktop, the phone sits in the centre (about 390 × 844) with a presenter panel on the right. Under 768px, show only the phone, full screen, with a small "i" button that opens the panel as a sheet.
- **Presenter panel, per screen:** step number and name, "Screen N of 8", the barrier it solves (for example "B2: Bills sit 4th to 5th after a payment"), what changed from Paytm today in one line, and the metric it moves.
- **Navigation:** Back and Next buttons, arrow keys, and a row of 8 dots. Tapping inside the phone must also move the story forward naturally.
- **Scenarios:** failure path toggle on screen 4, the Test 4 picker (guarantee only, cashback, card rewards, nothing), and Reset journey.
- **Metric events (toggle, off by default):** a small log that shows events as they fire, for example `bill_suggestion_tapped`, `biller_added`, `first_payment_confirmed`, `reminder_payment_started`, `autopay_set_up`, `moved_from_elsewhere`. This shows how each screen would be measured.
- **Want stage metrics** (the S4 signals), also in the log:
  - `bill_paid_by_card_when_upi_free`: fires when the user pays with a saved credit card instead of UPI on screen 3 or on the quick-pay screen.
  - `credit_cards_saved`: fires once with a count when the S4 journey starts. She has 3 fictional saved cards.
  - `card_rewards_page_time`: the S4 version of screen 1 has a small "See card rewards" link that opens a simple rewards sheet. The seconds spent on it are logged when the sheet closes.
- **Footer:** "Concept prototype for a case study. Simulated data. Not a live Paytm product."

## Nice to have, after the core works

- **Segment switcher** in the presenter panel. It changes screen 1 only:
  - S1 Household manager: the default above.
  - S2 Lapsed bill payer: a "Welcome back" card naming the bill she used to pay, with the guarantee up front.
  - S3 AutoPay recharger: offer AutoPay first, for a category next to the mandate she already holds.
  - S4 Rewards cardholder: anyone whose behaviour shows they chase credit card rewards, not only Paytm co-brand cardholders. Spotted from 3 signals: bills paid by credit card even when UPI is free, the number of credit cards saved on Paytm (or whose bills they pay here), and time spent on Paytm's card rewards page. Screen 1 shows the reward her saved credit card would earn on this electricity bill as the reason to pay here, with a "See card rewards" link. Use a fictional bank card name.
- **"Paytm today" comparison:** a toggle on screen 1 that shows the current order (Postpaid pop-up, rating request, scratch card, then the grid) recreated as a simple mock. Do not use the screenshots in `reference/` inside the app (see below).

## Out of scope

LPG flow, bill scanning, SMS reading, a shared household view, DTH and OTT pushes, coins, segments S5 to S7, any real payment, any real login, any backend.

## Design

- Mobile-first, looks like a modern Indian payments app. White background, navy `#002E6E` for headings and primary text, Paytm-style sky blue `#00BAF2` for accents and primary buttons, soft grey cards with 12 to 16px corners. Use one clean sans-serif font (for example Inter).
- **Do not copy Paytm's logo file or other brand assets.** Write "Paytm" as plain styled text. Draw icons with an open icon set (for example Lucide). The sample bill and WhatsApp chat are drawn in code.
- `reference/current-paytm/` holds hands-on screenshots of today's Paytm screens. Use them only to understand the current layout and tone. **They contain real personal details (a real name and phone number), so never copy them into the app, never commit them and never deploy them.** Keep `reference/` in `.gitignore`.

## Copy rules (the deck follows the same rules)

- Plain, short language. No em dashes and no semicolons in any user-facing text.
- Write abbreviations in full on first use in the presenter panel (for example "Unified Payments Interface (UPI)").
- Amounts in Indian format with the ₹ sign (₹2,340).

## Tech

- Next.js (App Router), React, TypeScript and Tailwind, as in the TripGenie project. Static only: no database, no API routes, no LLM.
- One journey state machine in `lib/journey.ts` (current screen, toggles, payments made, AutoPay state, event log). Persist it to `sessionStorage` so a refresh does not lose the place. Reset clears it.
- A few `vitest` tests for the state machine: the screen order, AutoPay only after two payments, and the failure path leading to a refund.
- Run `npm run build` and the tests before calling anything done.
- Deploy to Vercel from a GitHub repository. The final output is a public URL to paste into deck slides 1 and 7.

## Definition of done

- All 8 screens can be walked end to end on a phone and on a laptop, by tapping or with the presenter's Next button.
- The failure path toggle and the Test 4 picker work, and Reset returns to screen 1.
- The presenter panel shows the barrier, the change and the metric for every screen, and they match `CASE_CONTEXT.md`.
- Build and tests pass, and a Vercel URL is live.
- Nothing from `reference/` is in the repository or the deployed site.
