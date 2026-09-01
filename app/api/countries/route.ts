import { NextResponse } from "next/server";
import { CountryRepository } from "@/lib/repositories/countryRepository";


export async function GET() {
  const repo = new CountryRepository();
  const countries = await repo.getAllActive();
  return NextResponse.json({
    success: true,
    data: countries,
  });
}
