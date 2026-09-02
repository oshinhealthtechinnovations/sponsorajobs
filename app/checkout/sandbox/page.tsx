"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Smartphone,
  Building,
  Check,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";

function SandboxCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProvider = searchParams.get("provider") || "razorpay";
  const sessionId = searchParams.get("session_id") || searchParams.get("order_id") || "cs_sandbox_demo";

  const [activeGateway, setActiveGateway] = useState<"razorpay" | "stripe">(
    initialProvider === "stripe" ? "stripe" : "razorpay"
  );
  const [razorpayMethod, setRazorpayMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [loading, setLoading] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [name, setName] = useState("Candidate Name");

  const handleSimulatePayment = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/checkout/success?session_id=${sessionId}&gateway=${activeGateway}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Top Sandbox Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Local Payment Sandbox:</strong> Interactive test simulator for ₹299 INR.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 font-mono text-[10px] font-black uppercase">
            SANDBOX
          </span>
        </div>

        {/* Gateway Provider Switcher in Sandbox */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveGateway("razorpay")}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGateway === "razorpay"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🇮🇳 India Gateway (Razorpay)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGateway("stripe")}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGateway === "stripe"
                ? "bg-gradient-to-r from-[#19CBE0] to-teal-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌍 International (Stripe)</span>
          </button>
        </div>

        {/* Main Payment Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                {activeGateway === "razorpay" ? "Razorpay India Checkout" : "Stripe Global Checkout"}
              </div>
              <h1 className="text-lg font-black text-white">Candidate Pro Pass</h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">₹299</span>
              <span className="text-[10px] text-slate-400 block font-medium">1-Year All-Access</span>
            </div>
          </div>

          {/* ───────────────────────────────────────────── */}
          {/* OPTION 1: RAZORPAY INDIA SIMULATOR */}
          {/* ───────────────────────────────────────────── */}
          {activeGateway === "razorpay" && (
            <div className="space-y-4">
              {/* Payment Methods Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRazorpayMethod("upi")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    razorpayMethod === "upi"
                      ? "border-blue-500 text-blue-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI & QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayMethod("card")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    razorpayMethod === "card"
                      ? "border-blue-500 text-blue-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>RuPay / Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayMethod("netbanking")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    razorpayMethod === "netbanking"
                      ? "border-blue-500 text-blue-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* UPI Tab */}
              {razorpayMethod === "upi" && (
                <div className="space-y-3.5 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Instant UPI Dynamic QR</div>
                        <div className="text-[10px] text-slate-400">Scan & Pay via any UPI App</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                      0% Fee
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Or Select UPI App (1-Click)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {["Google Pay", "PhonePe", "Paytm", "BHIM / CRED"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedUpiApp(app)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedUpiApp === app
                              ? "bg-blue-600/20 border-blue-500 text-blue-300 font-bold"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {razorpayMethod === "card" && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Card Number (RuPay, Visa, Mastercard)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {razorpayMethod === "netbanking" && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Indian Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra"].map(
                      (bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedBank === bank
                              ? "bg-blue-600/20 border-blue-500 text-blue-300 font-bold"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {bank}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────── */}
          {/* OPTION 2: STRIPE INTERNATIONAL SIMULATOR */}
          {/* ───────────────────────────────────────────── */}
          {activeGateway === "stripe" && (
            <div className="space-y-4">
              {/* Apple Pay / Google Pay Simulator Banner */}
              <div className="p-3.5 rounded-2xl bg-black border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>Apple Pay / Google Pay 1-Click Ready</span>
                </div>
                <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-md">
                  Global
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    International Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-[#19CBE0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Card Number (Visa / Mastercard / Amex)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#19CBE0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#19CBE0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#19CBE0]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleSimulatePayment}
              className={`w-full py-3.5 px-4 rounded-2xl active:scale-[0.98] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                activeGateway === "razorpay"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-[#19CBE0] hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? "Verifying Test Payment..."
                  : activeGateway === "razorpay"
                  ? "Complete Razorpay / UPI Payment (₹299)"
                  : "Complete Stripe International Payment (₹299)"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/checkout/cancel"
              className="block w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Cancel & Return to Pricing
            </Link>
          </div>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted &middot; Instant Activation &middot; 14-Day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SandboxCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading checkout sandbox...
        </div>
      }
    >
      <SandboxCheckoutContent />
    </Suspense>
  );
}
