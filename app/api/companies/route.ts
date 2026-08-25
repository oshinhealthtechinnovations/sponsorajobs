import { NextResponse } from "next/server";
import { CompanyRepository } from "@/lib/repositories/companyRepository";

export const runtime = "edge";

export async function GET() {
  const repo = new CompanyRepository();
  const companies = await repo.getAll();
  return NextResponse.json({
    success: true,
    data: companies,
  });
}
