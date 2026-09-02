import { NextResponse } from "next/server";
import { CompanyRepository } from "@/lib/repositories/companyRepository";


export async function GET() {
  const repo = new CompanyRepository();
  const companies = await repo.getAll();
  return NextResponse.json(
    {
      success: true,
      data: companies,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
