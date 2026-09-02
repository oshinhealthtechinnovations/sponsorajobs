"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SUPPORTED_CURRENCIES } from "@/lib/services/currencyService";
import {
  ArrowRightLeft,
  Sparkles,
  Calculator,
  TrendingUp,
  Globe,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SalaryConverterPage() {
  const [amount, setAmount] = useState<number>(65000);
  const [fromCurrency, setFromCurrency] = useState<string>("GBP");
  const [toCurrency, setToCurrency] = useState<string>("INR");
  const [convertedAmount, setConvertedAmount] = useState<number>(6987500);
  const [exchangeRate, setExchangeRate] = useState<number>(107.5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function convert() {
      if (!amount || isNaN(amount) || amount <= 0) return;
      if (fromCurrency === toCurrency) {
        setConvertedAmount(amount);
        setExchangeRate(1);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/tools/convert-currency?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          setConvertedAmount(data.data.convertedAmount);
          setExchangeRate(data.data.rate);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    convert();
  }, [amount, fromCurrency, toCurrency]);

  const fromMeta = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency);
  const toMeta = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Free Real-Time Currency Tool • Powered by ECB Data</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            International Job Salary Converter
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Compare visa sponsorship compensation across the UK (£), USA ($), Australia (A$), Canada (C$), and convert directly into your home currency.
          </p>
        </div>

        {/* Converter Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Amount & From */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Offered Annual Salary
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xl font-bold px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  placeholder="e.g. 65000"
                />
              </div>
              <div className="pt-1">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} – {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:col-span-1">
              <button
                type="button"
                onClick={swapCurrencies}
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs"
                title="Swap Currencies"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Converted & To */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
                Take-Home Equivalent
              </label>
              <div className="w-full text-xl font-black px-4 py-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex items-center justify-between">
                {loading ? (
                  <span className="text-slate-400 text-base animate-pulse">Calculating...</span>
                ) : (
                  <>
                    <span>{toMeta?.symbol} {convertedAmount.toLocaleString()}</span>
                    <span className="text-xs font-bold text-brand-600">{toCurrency}/yr</span>
                  </>
                )}
              </div>
              <div className="pt-1">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} – {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Monthly Gross</div>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                {toMeta?.symbol} {Math.round(convertedAmount / 12).toLocaleString()} / month
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Live Exchange Rate</div>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                1 {fromCurrency} = {exchangeRate} {toCurrency}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Hourly Equivalent (40h/wk)</div>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                {toMeta?.symbol} {(convertedAmount / 2080).toFixed(1)} / hour
              </div>
            </div>
          </div>
        </div>

        {/* Explore Jobs Call-to-Action */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-brand-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Ready to find jobs paying in {fromCurrency}?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Browse over 1,850+ verified openings offering visa sponsorship signals today.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            <span>Browse Sponsoring Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
