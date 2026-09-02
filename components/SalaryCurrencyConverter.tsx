"use client";

import React, { useState, useEffect } from "react";
import { SUPPORTED_CURRENCIES } from "@/lib/services/currencyService";
import { ArrowRightLeft, DollarSign, Sparkles, TrendingUp } from "lucide-react";

interface SalaryCurrencyConverterProps {
  salaryAmount: number;
  baseCurrency?: string;
}

export const SalaryCurrencyConverter: React.FC<SalaryCurrencyConverterProps> = ({
  salaryAmount,
  baseCurrency = "GBP",
}) => {
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState<number>(salaryAmount);
  const [exchangeRate, setExchangeRate] = useState<number>(1.28);
  const [loading, setLoading] = useState(false);

  const cleanBase = baseCurrency.toUpperCase();

  // Pick reasonable default target currency
  useEffect(() => {
    if (cleanBase === "USD") setTargetCurrency("EUR");
    else if (cleanBase === "GBP") setTargetCurrency("USD");
    else setTargetCurrency("USD");
  }, [cleanBase]);

  useEffect(() => {
    let isMounted = true;
    async function fetchConversion() {
      if (!salaryAmount) return;
      if (cleanBase === targetCurrency) {
        setConvertedAmount(salaryAmount);
        setExchangeRate(1);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/tools/convert-currency?amount=${salaryAmount}&from=${cleanBase}&to=${targetCurrency}`
        );
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setConvertedAmount(data.data.convertedAmount);
          setExchangeRate(data.data.rate);
        }
      } catch {
        // Keep previous state gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchConversion();
    return () => {
      isMounted = false;
    };
  }, [salaryAmount, cleanBase, targetCurrency]);

  const targetMeta = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency);
  const baseMeta = SUPPORTED_CURRENCIES.find((c) => c.code === cleanBase);

  const quickPicks = ["USD", "INR", "EUR", "AUD", "CAD", "PHP", "NGN"].filter((c) => c !== cleanBase);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <ArrowRightLeft className="w-4 h-4 text-brand-600" />
          <span>Global Salary Currency Converter</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Live ECB Rates
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Offered Base Salary</div>
          <div className="text-lg font-black text-slate-900">
            {baseMeta?.symbol || cleanBase} {salaryAmount.toLocaleString()} <span className="text-xs font-bold text-slate-500">{cleanBase}/yr</span>
          </div>
          <div className="text-[11px] text-slate-500">
            ≈ {baseMeta?.symbol || cleanBase} {Math.round(salaryAmount / 12).toLocaleString()}/month
          </div>
        </div>

        <div className="hidden sm:block text-slate-300">
          <ArrowRightLeft className="w-5 h-5" />
        </div>

        <div>
          <div className="text-[11px] text-brand-600 uppercase font-bold">Estimated Take-Home In Your Currency</div>
          <div className="text-xl font-black text-brand-700 flex items-center gap-1.5">
            {loading ? (
              <span className="text-slate-400 animate-pulse text-base">Calculating...</span>
            ) : (
              <>
                <span>{targetMeta?.flag}</span>
                <span>{targetMeta?.symbol || targetCurrency} {convertedAmount.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-500">{targetCurrency}/yr</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            ≈ {targetMeta?.symbol || targetCurrency} {Math.round(convertedAmount / 12).toLocaleString()}/month
          </div>
        </div>
      </div>

      {/* Target Currency Selector & Quick Picks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Select your home currency:</span>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} – {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">Popular:</span>
          {quickPicks.slice(0, 5).map((qCode) => {
            const meta = SUPPORTED_CURRENCIES.find((c) => c.code === qCode);
            const isSelected = targetCurrency === qCode;
            return (
              <button
                key={qCode}
                type="button"
                onClick={() => setTargetCurrency(qCode)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {meta?.flag} {qCode}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
        <span>1 {cleanBase} = {exchangeRate} {targetCurrency}</span>
        <span>Free Real-Time Open Exchange API</span>
      </div>
    </div>
  );
};
