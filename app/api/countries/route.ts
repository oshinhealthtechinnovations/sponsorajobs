import { NextResponse } from "next/server";
import { CountryRepository } from "@/lib/repositories/countryRepository";


export async function GET() {
  const repo = new CountryRepository();
  const countries = await repo.getAllActive();
  return NextResponse.json(
    {
      success: true,
      data: countries,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
