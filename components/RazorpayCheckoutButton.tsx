"use client";

/**
 * RazorpayCheckoutButton
 *
 * Security model:
 *  1. Sends ONLY plan_code to server — price is NEVER set by the client.
 *  2. Server creates the Razorpay order with the authoritative amount from SUBSCRIPTION_PLANS.
 *  3. On payment success, all 3 IDs are verified server-side via HMAC-SHA256.
 *  4. KEY_SECRET never reaches the browser.
 *
 * Global Razorpay types live in types/razorpay.d.ts — do not redeclare here.
 */

import React, { useState, useCallback } from "react";
import { Loader2, ShieldCheck, Zap } from "lucide-react";

// ─── Component Props ─────────────────────────────────────────────────────────
export interface RazorpayCheckoutButtonProps {
  planCode: string;           // e.g. "SA_YEAR_999"
  planLabel: string;          // e.g. "12 Months — ₹999"
  amount: number;             // Display only — server is the source of truth for actual charge
  userEmail?: string;
  userName?: string;
  onSuccess?: (data: { paymentId: string; orderId: string }) => void;
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// ─── Script loader ────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────────
export function RazorpayCheckoutButton({
  planCode,
  planLabel,
  amount,
  userEmail = "",
  userName = "",
  onSuccess,
  onError,
  className = "",
  style,
  children,
}: RazorpayCheckoutButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    setState("loading");
    setErrorMsg(null);

    try {
      // Step 1 — Load Razorpay checkout.js
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay checkout. Please check your connection.");
      }

      // Step 2 — Create order server-side (price resolved from plan catalog, not from browser)
      const orderRes = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_code: planCode,
          gateway: "razorpay",
          email: userEmail || undefined,
          name: userName || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success || !orderData.data?.orderId) {
        throw new Error(orderData.error || "Could not initialise payment. Please try again.");
      }

      const { orderId, amount: serverAmount, currency, keyId } = orderData.data;
      const razorpayKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TXYfdA2zXTEidN";

      if (!razorpayKey) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      // Step 3 — Open Razorpay Standard Checkout modal
      await new Promise<void>((resolve, reject) => {
        const options: Record<string, any> = {
          key: razorpayKey,
          order_id: orderId,
          amount: serverAmount * 100, // Razorpay expects paise
          currency: currency || "INR",
          name: "SponsorAJobs Premium",
          description: planLabel,
          prefill: {
            name: userName || undefined,
            email: userEmail || undefined,
          },
          theme: { color: "#19CBE0" },
          modal: {
            animation: true,
            ondismiss: () => {
              setState("idle");
              resolve();
            },
          },
          handler: async (response: any) => {
            // Step 4 — Verify payment HMAC server-side — never trust the modal callback alone
            setState("verifying");
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

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setState("success");
                onSuccess?.({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                });
                // Refresh session so the UI reflects premium status
                window.dispatchEvent(new Event("user-session-changed"));
              } else {
                throw new Error(verifyData.error || "Payment verification failed. Contact support.");
              }
            } catch (err: any) {
              setState("error");
              const msg = err.message || "Verification error. Contact support@sponsorajobs.com";
              setErrorMsg(msg);
              onError?.(msg);
            }
            resolve();
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        // Also listen for payment failure events inside the modal
        razorpay.on("payment.failed", (response: any) => {
          setState("error");
          const msg = response?.error?.description || "Payment failed. Please try again.";
          setErrorMsg(msg);
          onError?.(msg);
          reject(new Error(msg));
        });
        razorpay.open();
        setState("idle"); // Button state back to idle while modal is open
      });
    } catch (err: any) {
      const msg = err.message || "Payment initialisation failed.";
      setState("error");
      setErrorMsg(msg);
      onError?.(msg);
    }
  }, [planCode, planLabel, amount, userEmail, userName, onSuccess, onError]);

  // ─── Render ────────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
        <ShieldCheck size={18} />
        Premium Activated!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        id={`rzp-pay-${planCode.toLowerCase()}`}
        onClick={handleCheckout}
        disabled={state === "loading" || state === "verifying"}
        className={`relative w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed ${className}`}
        style={style}
      >
        {state === "loading" && (
          <>
            <Loader2 size={16} className="animate-spin" />
            Setting up payment…
          </>
        )}
        {state === "verifying" && (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verifying payment…
          </>
        )}
        {(state === "idle" || state === "error") && (
          <>
            {children || (
              <>
                <Zap size={16} />
                Pay ₹{amount.toLocaleString("en-IN")}
              </>
            )}
          </>
        )}
      </button>

      {state === "error" && errorMsg && (
        <p className="text-xs text-red-400 text-center px-2">{errorMsg}</p>
      )}
    </div>
  );
}
