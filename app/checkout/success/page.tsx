"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, Loader2, AlertTriangle } from "lucide-react";

// ─── Inner component that reads search params ──────────────────────────────
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const orderId = searchParams.get("razorpay_order_id");
    const signature = searchParams.get("razorpay_signature");

    if (paymentId && orderId && signature) {
      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature,
          gateway: "razorpay",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setStatus("success");
            window.dispatchEvent(new Event("user-session-changed"));
          } else {
            setStatus("error");
            setErrorMsg(d.error || "Payment could not be verified.");
          }
        })
        .catch(() => {
          setStatus("error");
          setErrorMsg("Network error during verification.");
        });
    } else {
      // No params — success was handled by RazorpayCheckoutButton callback
      setStatus("success");
    }
  }, [searchParams]);

  return (
    <div
      className="max-w-md w-full rounded-2xl p-8 text-center"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {status === "verifying" && (
        <>
          <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Verifying your payment…</h1>
          <p className="text-slate-400 text-sm">This usually takes a few seconds.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(25,201,139,0.15)", border: "2px solid rgba(25,201,139,0.4)" }}
          >
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h1
            className="text-2xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Premium Activated!
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Welcome to SponsorAJobs Premium. Your career intelligence tools are now unlocked.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-[#071522]"
              style={{ background: "linear-gradient(135deg, #19CBE0, #19C98B)" }}
            >
              <Sparkles size={16} />
              Go to Dashboard
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/jobs"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Continue browsing jobs →
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(240,68,94,0.1)", border: "2px solid rgba(240,68,94,0.3)" }}
          >
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Verification Issue</h1>
          <p className="text-slate-400 text-sm mb-2">
            {errorMsg || "We could not verify your payment."}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            If money was deducted, please email{" "}
            <a href="mailto:support@sponsorajobs.com" className="text-cyan-400 underline">
              support@sponsorajobs.com
            </a>{" "}
            with your payment ID.
          </p>
          <Link href="/pricing" className="text-sm text-cyan-400 hover:underline">
            ← Back to pricing
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams in Next.js 14) ──
export default function CheckoutSuccessPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #071522 0%, #0a1f35 100%)" }}
    >
      <Suspense
        fallback={
          <div className="max-w-md w-full rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white font-semibold">Processing your payment…</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </main>
  );
}
