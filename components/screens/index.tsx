"use client";

import type { ScreenNo } from "@/lib/journey";
import { S0Home } from "./S0Home";
import { S1RechargeSuccess } from "./S1RechargeSuccess";
import { S2AddBill } from "./S2AddBill";
import { S3BillFetched } from "./S3BillFetched";
import { S4LiveStatus } from "./S4LiveStatus";
import { S5WhatsAppReminder } from "./S5WhatsAppReminder";
import { S6AutoPay } from "./S6AutoPay";
import { S7BillsTab } from "./S7BillsTab";
import { S8MonthlySummary } from "./S8MonthlySummary";

export function ScreenView({ screen }: { screen: ScreenNo }) {
  switch (screen) {
    case 0:
      return <S0Home />;
    case 1:
      return <S1RechargeSuccess />;
    case 2:
      return <S2AddBill />;
    case 3:
      return <S3BillFetched />;
    case 4:
      return <S4LiveStatus />;
    case 5:
      return <S5WhatsAppReminder />;
    case 6:
      return <S6AutoPay />;
    case 7:
      return <S7BillsTab />;
    case 8:
      return <S8MonthlySummary />;
  }
}
