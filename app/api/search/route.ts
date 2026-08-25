import { NextRequest, NextResponse } from "next/server";
import { GET as getJobs } from "../jobs/route";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return getJobs(request);
}
