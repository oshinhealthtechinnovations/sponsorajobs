/**
 * Free Global Exchange Rate & Currency Conversion Service
 * Powered by open ECB data (Frankfurter API + open.er-api.com fallback)
 * 100% Free, Zero API Keys, Zero Rate Limits for standard usage.
 */

export interface CurrencyConversionResult {
  amount: number;
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
  monthlyAmount: number;
  formatted: string;
  timestamp: string;
}

export const SUPPORTED_CURRENCIES: { code: string; name: string; symbol: string; flag: string }[] = [
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
];

interface CachedRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

let ratesCache: Record<string, CachedRates> = {};

// 24-hour cache TTL
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class CurrencyService {
  /**
   * Fetches latest exchange rates with intelligent dual-API fallback
   */
  static async getRates(base: string = "GBP"): Promise<Record<string, number>> {
    const upperBase = base.toUpperCase();
    const cached = ratesCache[upperBase];

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.rates;
    }

    // 1. Primary Free Provider: Frankfurter API (European Central Bank)
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${upperBase}`, {
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const data = await res.json();
        const fullRates = { ...data.rates, [upperBase]: 1 };
        ratesCache[upperBase] = {
          base: upperBase,
          date: data.date,
          rates: fullRates,
          fetchedAt: Date.now(),
        };
        return fullRates;
      }
    } catch {
      // Fall through to backup
    }

    // 2. Backup Free Provider: Open Exchange Rates API (free, open endpoint)
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${upperBase}`, {
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const data = await res.json();
        const fullRates = { ...data.rates, [upperBase]: 1 };
        ratesCache[upperBase] = {
          base: upperBase,
          date: data.time_last_update_utc || new Date().toISOString(),
          rates: fullRates,
          fetchedAt: Date.now(),
        };
        return fullRates;
      }
    } catch {
      // Fall through to static fallback rates
    }

    // 3. Resilient Static Fallback Baseline Rates (for offline / test environments)
    const fallbackBaseRates: Record<string, Record<string, number>> = {
      GBP: { GBP: 1, USD: 1.28, EUR: 1.18, AUD: 1.95, CAD: 1.76, NZD: 2.12, INR: 107.5, PHP: 74.2, NGN: 2050, PKR: 358, BRL: 7.1, ZAR: 23.4, SGD: 1.72, AED: 4.7, JPY: 198 },
      USD: { USD: 1, GBP: 0.78, EUR: 0.92, AUD: 1.52, CAD: 1.37, NZD: 1.65, INR: 83.9, PHP: 57.9, NGN: 1600, PKR: 279, BRL: 5.5, ZAR: 18.2, SGD: 1.34, AED: 3.67, JPY: 154 },
      EUR: { EUR: 1, GBP: 0.85, USD: 1.08, AUD: 1.65, CAD: 1.49, NZD: 1.79, INR: 91.1, PHP: 62.8, NGN: 1735, PKR: 303, BRL: 6.0, ZAR: 19.8, SGD: 1.45, AED: 3.98, JPY: 167 },
    };

    return fallbackBaseRates[upperBase] || fallbackBaseRates.GBP;
  }

  /**
   * Convert an offered annual salary to a candidate's target currency
   */
  static async convertSalary(
    amount: number,
    fromCurrency: string = "GBP",
    toCurrency: string = "USD"
  ): Promise<CurrencyConversionResult> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return {
        amount,
        from,
        to,
        rate: 1,
        convertedAmount: amount,
        monthlyAmount: Math.round(amount / 12),
        formatted: this.formatCurrency(amount, to),
        timestamp: new Date().toISOString(),
      };
    }

    const rates = await this.getRates(from);
    const rate = rates[to] || 1;
    const convertedAmount = Math.round(amount * rate);
    const monthlyAmount = Math.round(convertedAmount / 12);

    return {
      amount,
      from,
      to,
      rate: Number(rate.toFixed(4)),
      convertedAmount,
      monthlyAmount,
      formatted: this.formatCurrency(convertedAmount, to),
      timestamp: new Date().toISOString(),
    };
  }

  static formatCurrency(amount: number, currency: string): string {
    const meta = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
    const symbol = meta?.symbol || currency;
    return `${symbol} ${amount.toLocaleString()}`;
  }
}
