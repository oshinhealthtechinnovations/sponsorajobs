"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, Loader2, AlertTriangle, Calendar, Clock, ShieldCheck } from "lucide-react";

// ─── Inner component that reads search params ──────────────────────────────
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<{
    planLabel?: string;
    startedAt?: string;
    expiresAt?: string;
  } | null>(null);

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
            if (d.user) {
              setPlanDetails({
                planLabel: d.user.planLabel || "Candidate Pro (12 Months VIP Access)",
                startedAt: d.user.subscriptionStartedAt || new Date().toISOString(),
                expiresAt: d.user.proExpiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
              });
            }
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
      setPlanDetails({
        planLabel: "Candidate Pro VIP Access",
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      });
    }
  }, [searchParams]);

  return (
    <div className="max-w-md w-full rounded-3xl p-8 text-center bg-white border border-slate-200 shadow-2xl text-slate-900">
      {status === "verifying" && (
        <>
          <Loader2 size={48} className="animate-spin text-brand-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Verifying your payment…</h1>
          <p className="text-slate-500 text-sm">This usually takes a few seconds.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-50 border-2 border-emerald-200">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            VIP Membership Activated!
          </h1>
          <p className="text-slate-600 text-xs mb-5 leading-relaxed">
            Welcome to SponsorAJobs VIP. All verified sponsor apply links, AI CV optimizer, and points calculators are now unlocked.
          </p>

          {/* Plan Dates Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 mb-6 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-brand-600">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Plan:</span>
              </span>
              <span>{planDetails?.planLabel || "Candidate Pro VIP"}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Started On:</span>
              </span>
              <span className="font-bold text-slate-900">
                {planDetails?.startedAt
                  ? new Date(planDetails.startedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Valid Until:</span>
              </span>
              <span className="font-bold text-slate-900">
                {planDetails?.expiresAt
                  ? new Date(planDetails.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : new Date(Date.now() + 365 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-700 font-bold pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status:</span>
              </span>
              <span>● Active VIP Pass</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all"
            >
              <Sparkles size={16} />
              Go to Candidate Dashboard
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-slate-600 hover:text-brand-600 py-1 transition-colors"
            >
              Browse 650+ Visa Sponsorship Jobs →
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 border-2 border-red-200">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Verification Issue</h1>
          <p className="text-slate-600 text-xs mb-3">
            {errorMsg || "We could not verify your payment."}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            If money was deducted, please email{" "}
            <a href="mailto:support@sponsorajobs.com" className="text-brand-600 underline font-semibold">
              support@sponsorajobs.com
            </a>{" "}
            with your payment receipt.
          </p>
          <Link href="/pricing" className="text-xs text-brand-600 hover:underline font-bold">
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
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <Suspense
        fallback={
          <div className="max-w-md w-full rounded-3xl p-8 text-center bg-white border border-slate-200 shadow-lg">
            <Loader2 size={48} className="animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-slate-800 font-bold text-sm">Processing your payment…</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </main>
  );
}
