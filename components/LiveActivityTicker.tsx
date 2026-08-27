"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Users, CheckCircle } from "lucide-react";

const LIVE_EVENTS = [
  { icon: TrendingUp, text: "Senior Civil Engineer vacancy in Birmingham, UK · 5 applicants today", time: "Just now" },
  { icon: Sparkles, text: "Full Stack Developer (H-1B Eligible) in New York, USA just indexed", time: "2m ago" },
  { icon: CheckCircle, text: "Registered Nurse (CoS Sponsor) in Manchester · 100% Signal Match", time: "4m ago" },
  { icon: Users, text: "34 job seekers currently viewing Australian TSS 482 Engineering roles", time: "Live" },
  { icon: Sparkles, text: "Structural Design Lead in Vancouver, Canada added to LMIA pool", time: "6m ago" },
];

export const LiveActivityTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
        setFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const current = LIVE_EVENTS[index];
  const Icon = current.icon;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-1.5 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/90 text-slate-200 text-xs border border-slate-700/80 shadow-md backdrop-blur-md max-w-full min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0 flex-1">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 shrink-0 text-[10px] sm:text-[11px] uppercase tracking-wider hidden xs:inline">LIVE:</span>
          <div
            className={`flex items-center gap-1.5 truncate transition-opacity duration-300 min-w-0 flex-1 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <Icon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium text-[11px] sm:text-xs">{current.text}</span>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0 bg-slate-800 px-1.5 py-0.5 rounded-full">
          {current.time}
        </span>
      </div>
    </div>
  );
};
