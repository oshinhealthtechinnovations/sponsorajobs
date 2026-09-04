import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { complaintRepository, ComplaintStatus } from "@/lib/repositories/complaintRepository";

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminSession(request);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const complaints = await complaintRepository.getAllComplaints();
    return NextResponse.json({ success: true, data: complaints });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAuth = await verifyAdminSession(request);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    const updated = await complaintRepository.updateStatus(id, status as ComplaintStatus, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
