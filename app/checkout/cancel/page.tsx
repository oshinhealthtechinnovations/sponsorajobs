"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #071522 0%, #0a1f35 100%)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(245,185,66,0.1)", border: "2px solid rgba(245,185,66,0.3)" }}
        >
          <XCircle size={40} className="text-amber-400" />
        </div>

        <h1
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Payment Cancelled
        </h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          No payment was made. Your account is unchanged. You can try again whenever you&apos;re ready.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-[#071522]"
            style={{ background: "linear-gradient(135deg, #19CBE0, #19C98B)" }}
          >
            <CreditCard size={15} />
            View Plans
          </Link>
          <Link
            href="/jobs"
            className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={14} />
            Continue browsing jobs
          </Link>
        </div>
      </div>
    </main>
  );
}
