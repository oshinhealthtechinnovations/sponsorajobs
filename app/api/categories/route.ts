import { NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/categoryRepository";


export async function GET() {
  const repo = new CategoryRepository();
  const categories = await repo.getAll();
  return NextResponse.json(
    {
      success: true,
      data: categories,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
