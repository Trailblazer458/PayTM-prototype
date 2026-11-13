"use client";

import { CircleHelp, Loader2, MapPin, ShieldCheck, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/hooks/useJourney";
import { board } from "@/lib/seed";
import { AppHeader, BottomSheet, Button } from "@/components/ui/kit";
import { SampleBill } from "@/components/ui/SampleBill";
import { WaBody, WaBubble, WaDate, WaHeader, WaInputBar, WaTyping } from "@/components/ui/WhatsApp";

const ASK_MESSAGE = "Can you send me the consumer number from our electricity bill? I want to pay it on Paytm.";

function formatConsumer(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8, 10)].filter(Boolean).join(" ");
}

/** Full-phone overlay: the share message goes out, Rakesh replies with the number. */
function AskFamilyChat({ onReceived, onClose }: { onReceived: () => void; onClose: () => void }) {
  const [phase, setPhase] = useState<"sent" | "typing" | "replied">("sent");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), 900);
    const t2 = setTimeout(() => setPhase("replied"), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="anim-fade absolute inset-0 z-40 flex flex-col bg-white">
      <WaHeader name="Rakesh" sub={phase === "typing" ? "typing..." : "online"} avatar="R" onBack={onClose} />
      <WaBody>
        <WaDate>Today</WaDate>
        <WaBubble out time="9:42 am">
          {ASK_MESSAGE}
        </WaBubble>
        {phase === "typing" ? <WaTyping /> : null}
        {phase === "replied" ? (
          <>
            <WaBubble time="9:43 am">Here you go</WaBubble>
            <WaBubble time="9:43 am">
              <span className="font-semibold tracking-wide">{board.consumerNumber}</span>
            </WaBubble>
          </>
        ) : null}
      </WaBody>
      {phase === "replied" ? (
        <div className="anim-rise shrink-0 border-t border-line bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-navy">
            <Zap size={16} className="text-sky" /> Paytm found a consumer number in this reply
          </div>
          <Button onClick={onReceived}>Use {board.consumerNumber} on Paytm</Button>
        </div>
      ) : (
        <WaInputBar />
      )}
    </div>
  );
}

export function S2AddBill() {
  const { state, dispatch, showToast } = useJourney();
  const [whereOpen, setWhereOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [viaFamily, setViaFamily] = useState(false);
  const [flash, setFlash] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = formatConsumer(state.consumerNumber);
  const complete = value.replace(/\D/g, "").length === 10;

  const fetchBill = () => {
    if (!complete || checking) return;
    setChecking(true);
    setTimeout(() => dispatch({ type: "BILLER_ADDED", via: viaFamily ? "family" : "typed" }), 1100);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Electricity bill" onBack={() => dispatch({ type: "GOTO", screen: 1 })} />
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 no-scrollbar">
        <div className="text-[13px] font-semibold text-muted">Electricity board</div>
        <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-card p-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky">
            <Zap size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold">
              {board.short}, {board.area}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-muted">
              <MapPin size={12} /> Picked from your location
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast("The board list is not part of this demo")}
            className="text-[14px] font-semibold text-sky"
          >
            Change
          </button>
        </div>

        <label htmlFor="consumer" className="mt-5 block text-[13px] font-semibold text-muted">
          Consumer number
        </label>
        <input
          id="consumer"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          placeholder="10 digit number"
          value={value}
          onChange={(e) => {
            setViaFamily(false);
            dispatch({ type: "SET_CONSUMER_NUMBER", value: e.target.value.replace(/\D/g, "").slice(0, 10) });
          }}
          onKeyDown={(e) => e.key === "Enter" && fetchBill()}
          className={`mt-1.5 w-full rounded-xl border-2 px-4 py-3.5 text-[18px] font-semibold tracking-wider outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9aa7bb] focus:border-sky ${
            flash ? "border-ok bg-ok-soft" : "border-line bg-white"
          }`}
        />
        {viaFamily ? (
          <div className="anim-rise mt-1.5 text-[12px] font-semibold text-ok">Filled in from Rakesh&apos;s reply</div>
        ) : (
          <div className="mt-1.5 text-[12px] text-muted">Printed near the top of your paper bill</div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWhereOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold hover:bg-card"
          >
            <CircleHelp size={16} className="text-sky" /> Where do I find it?
          </button>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold hover:bg-card"
          >
            <Users size={16} className="text-sky" /> Ask family
          </button>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-sky-soft p-3 text-[12px] leading-snug">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" />
          We check the board is online and fetch your bill before you pay anything.
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        <Button onClick={fetchBill} disabled={!complete || checking}>
          {checking ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Checking with {board.short}
            </>
          ) : (
            "Fetch bill"
          )}
        </Button>
      </div>

      <BottomSheet open={whereOpen} onClose={() => setWhereOpen(false)} title="Where to find your consumer number">
        <p className="mb-3 text-[13px] text-muted">
          It is the 10 digit number near the top of your {board.short} bill, marked Consumer No.
        </p>
        <SampleBill />
        <Button
          className="mt-4"
          onClick={() => {
            setWhereOpen(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          Got it
        </Button>
        <Button variant="quiet" className="mt-1" onClick={() => { setWhereOpen(false); setShareOpen(true); }}>
          Bill not with you? Ask family
        </Button>
      </BottomSheet>

      <BottomSheet open={shareOpen} onClose={() => setShareOpen(false)} title="Ask family on WhatsApp">
        <div className="rounded-xl bg-wa-bg p-3">
          <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-wa-bubble px-3 py-2 text-[14px] leading-snug">
            {ASK_MESSAGE}
          </div>
        </div>
        <div className="mt-3 text-[13px] font-semibold text-muted">Send to</div>
        <div className="mt-2 space-y-2">
          {[
            { n: "Rakesh", s: "Husband" },
            { n: "Family", s: "Group, 5 people" },
          ].map((c) => (
            <button
              key={c.n}
              type="button"
              onClick={() => {
                setShareOpen(false);
                setChatOpen(true);
                dispatch({ type: "LOG", name: "ask_family_sent" });
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left hover:bg-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wa text-[13px] font-bold text-white">
                {c.n[0]}
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold">{c.n}</span>
                <span className="block text-[12px] text-muted">{c.s}</span>
              </span>
              <span className="rounded-full bg-wa-green px-3 py-1 text-[12px] font-semibold text-white">Send</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {chatOpen ? (
        <AskFamilyChat
          onClose={() => setChatOpen(false)}
          onReceived={() => {
            setChatOpen(false);
            setViaFamily(true);
            dispatch({ type: "SET_CONSUMER_NUMBER", value: board.consumerNumber.replace(/\D/g, "") });
            dispatch({ type: "LOG", name: "consumer_number_from_family" });
            setFlash(true);
            setTimeout(() => setFlash(false), 1400);
          }}
        />
      ) : null}
    </div>
  );
}
