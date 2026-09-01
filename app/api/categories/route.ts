import { NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/categoryRepository";


export async function GET() {
  const repo = new CategoryRepository();
  const categories = await repo.getAll();
  return NextResponse.json({
    success: true,
    data: categories,
  });
}
