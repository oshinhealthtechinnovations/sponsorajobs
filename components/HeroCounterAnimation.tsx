"use client";

import React, { useEffect, useState } from "react";

interface HeroCounterAnimationProps {
  target: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export const HeroCounterAnimation: React.FC<HeroCounterAnimationProps> = ({
  target,
  label = "Verified Sponsorship Jobs",
  prefix = "",
  suffix = "+",
  duration = 1800,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = target;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * (endValue - startValue) + startValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </div>
      <div className="text-left">
        <span className="font-extrabold text-slate-900 font-display text-base sm:text-lg tracking-tight">
          {prefix}
          {count > 0 ? count.toLocaleString() : target.toLocaleString()}
          {suffix}
        </span>
        <span className="text-xs text-slate-500 ml-1.5 font-medium">{label}</span>
      </div>
    </div>
  );
};
