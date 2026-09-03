"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

// ─── Inner component that reads search params ──────────────────────────────
function RazorpayCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "open" | "verifying" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const amount = Number(searchParams.get("amount") || "0");
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!orderId || !razorpayKey) {
      setStatus("error");
      setErrorMsg("Invalid payment session. Please return to pricing and try again.");
      return;
    }

    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        setStatus("error");
        setErrorMsg("Could not load Razorpay. Check your connection.");
        return;
      }

      const options = {
        key: razorpayKey,
        order_id: orderId,
        amount: amount * 100, // paise
        currency: "INR",
        name: "SponsorAJobs Premium",
        description: "Visa Job Sponsorship Intelligence",
        theme: { color: "#19CBE0" },
        modal: {
          animation: true,
          ondismiss: () => {
            router.push("/checkout/cancel");
          },
        },
        handler: async (response: any) => {
          setStatus("verifying");
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                gateway: "razorpay",
              }),
            });
            const d = await verifyRes.json();
            if (verifyRes.ok && d.success) {
              setStatus("success");
              window.dispatchEvent(new Event("user-session-changed"));
              setTimeout(() => router.push("/checkout/success"), 800);
            } else {
              throw new Error(d.error || "Verification failed");
            }
          } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Payment verification failed. Contact support.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setStatus("error");
        setErrorMsg(response?.error?.description || "Payment failed. Please try again.");
      });

      setStatus("open");
      rzp.open();
    });
  }, [searchParams, router]);

  return (
    <div
      className="max-w-sm w-full rounded-2xl p-8 text-center"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {(status === "loading" || status === "open") && (
        <>
          <Loader2 size={40} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">
            {status === "loading" ? "Preparing checkout…" : "Complete payment in the window above"}
          </p>
          <p className="text-slate-400 text-xs">Secured by Razorpay · UPI / Card / NetBanking</p>
        </>
      )}

      {status === "verifying" && (
        <>
          <Loader2 size={40} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Verifying payment…</p>
          <p className="text-slate-400 text-xs">Please wait — this takes a few seconds.</p>
        </>
      )}

      {status === "success" && (
        <>
          <p className="text-emerald-400 font-bold text-lg mb-1">✓ Payment Verified!</p>
          <p className="text-slate-400 text-sm">Redirecting to your dashboard…</p>
        </>
      )}

      {status === "error" && (
        <>
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            {errorMsg || "An error occurred. No payment was made."}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:underline"
          >
            <ArrowLeft size={13} />
            Back to Pricing
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams in Next.js 14) ──
export default function RazorpayCheckoutPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #071522 0%, #0a1f35 100%)" }}
    >
      <Suspense
        fallback={
          <div className="max-w-sm w-full rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Loader2 size={40} className="animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white font-semibold">Preparing checkout…</p>
          </div>
        }
      >
        <RazorpayCheckoutContent />
      </Suspense>
    </main>
  );
}
