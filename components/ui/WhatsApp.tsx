"use client";

import { ArrowLeft, BadgeCheck, CheckCheck, MoreVertical, Phone, Video } from "lucide-react";
import type { ReactNode } from "react";

/** Drawn-in-code chat screens in the WhatsApp style. No WhatsApp assets. */

export function WaHeader({
  name,
  sub,
  verified,
  onBack,
  avatar,
}: {
  name: string;
  sub?: string;
  verified?: boolean;
  onBack?: () => void;
  avatar: ReactNode;
}) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 bg-wa px-2 text-white">
      <button type="button" aria-label="Back" onClick={onBack} className="rounded-full p-1.5 hover:bg-white/10">
        <ArrowLeft size={20} />
      </button>
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white text-[13px] font-bold text-wa">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 truncate text-[15px] font-semibold">
          {name}
          {verified ? <BadgeCheck size={16} className="shrink-0 fill-[#25d366] text-wa" aria-label="Verified business" /> : null}
        </div>
        {sub ? <div className="truncate text-[11px] text-white/75">{sub}</div> : null}
      </div>
      <Video size={18} className="mx-1 opacity-80" />
      <Phone size={17} className="mx-1 opacity-80" />
      <MoreVertical size={18} className="mx-1 opacity-80" />
    </div>
  );
}

export function WaBody({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-1 flex-col gap-2 overflow-y-auto bg-wa-bg px-3 py-3 no-scrollbar"
      style={{
        backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      {children}
    </div>
  );
}

export function WaDate({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto my-1 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#54656f] shadow-sm">
      {children}
    </div>
  );
}

export function WaBubble({
  out,
  time,
  children,
  className = "",
}: {
  out?: boolean;
  time: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`anim-rise max-w-[84%] rounded-xl px-2.5 pb-1.5 pt-2 text-[14px] leading-snug text-[#111b21] shadow-sm ${
        out ? "self-end rounded-tr-sm bg-wa-bubble" : "self-start rounded-tl-sm bg-white"
      } ${className}`}
    >
      {children}
      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
        {time}
        {out ? <CheckCheck size={14} className="text-[#53bdeb]" /> : null}
      </div>
    </div>
  );
}

export function WaTyping() {
  return (
    <div className="anim-rise self-start rounded-xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm" aria-label="Typing">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-[#8696a0]"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

export function WaInputBar() {
  return (
    <div className="flex shrink-0 items-center gap-2 bg-wa-bg px-2 pb-2">
      <div className="flex-1 rounded-full bg-white px-4 py-2.5 text-[14px] text-[#8696a0]">Message</div>
      <div className="h-10 w-10 rounded-full bg-[#00a884]" />
    </div>
  );
}
