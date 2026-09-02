import { NextRequest, NextResponse } from "next/server";
import { CurrencyService, SUPPORTED_CURRENCIES } from "@/lib/services/currencyService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amountStr = searchParams.get("amount");
    const from = (searchParams.get("from") || "GBP").toUpperCase();
    const to = (searchParams.get("to") || "USD").toUpperCase();

    if (!amountStr) {
      // If no amount passed, return current rates and supported currencies
      const rates = await CurrencyService.getRates(from);
      return NextResponse.json({
        success: true,
        base: from,
        rates,
        currencies: SUPPORTED_CURRENCIES,
      });
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount parameter" },
        { status: 400 }
      );
    }

    const result = await CurrencyService.convertSalary(amount, from, to);

    return NextResponse.json({
      success: true,
      data: result,
      currencies: SUPPORTED_CURRENCIES,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to convert currency" },
      { status: 500 }
    );
  }
}
