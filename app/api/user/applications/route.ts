import { NextRequest, NextResponse } from "next/server";
import { applicationRepository, ApplicationStatus } from "@/lib/repositories/applicationRepository";

function getAuthenticatedUser(request: NextRequest): { id: string; email: string; name: string } | null {
  const sessionCookie = request.cookies.get("sa_user_session");
  if (!sessionCookie || !sessionCookie.value) return null;

  try {
    const user = JSON.parse(sessionCookie.value);
    if (!user || !user.id) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * GET /api/user/applications -> List all applications for current candidate
 */
export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const applications = await applicationRepository.getByUser(user.id);
  return NextResponse.json({
    success: true,
    data: applications,
    counts: {
      total: applications.length,
      applied: applications.filter((a) => a.status === "APPLIED").length,
      interviewing: applications.filter((a) => a.status === "INTERVIEWING").length,
      offer: applications.filter((a) => a.status === "OFFER").length,
      rejected: applications.filter((a) => a.status === "REJECTED").length,
      archived: applications.filter((a) => a.status === "ARCHIVED").length,
    },
  });
}

/**
 * POST /api/user/applications -> Track a new job application
 */
export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized. Please sign in to track applications." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, jobTitle, jobSlug, companyName, companyLogo, location, salary, applyUrl, status, notes } = body;

    if (!jobId || !jobTitle || !companyName || !applyUrl) {
      return NextResponse.json(
        { success: false, error: "jobId, jobTitle, companyName, and applyUrl are required." },
        { status: 400 }
      );
    }

    const app = await applicationRepository.createApplication({
      userId: user.id,
      jobId,
      jobTitle,
      jobSlug,
      companyName,
      companyLogo,
      location,
      salary,
      applyUrl,
      status: status as ApplicationStatus,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Job application tracked successfully!",
      data: app,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to track application." }, { status: 500 });
  }
}

/**
 * PATCH /api/user/applications -> Update status, notes, or interview dates
 */
export async function PATCH(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes, interviewDate, salary } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    let updated = null;
    if (status) {
      updated = await applicationRepository.updateStatus(id, user.id, status as ApplicationStatus, notes);
    } else {
      updated = await applicationRepository.updateDetails(id, user.id, { notes, interviewDate, salary });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: "Application not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully!",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update application." }, { status: 500 });
  }
}

/**
 * DELETE /api/user/applications -> Delete a tracked application
 */
export async function DELETE(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const deleted = await applicationRepository.deleteApplication(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Application removed from tracker.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to delete application." }, { status: 500 });
  }
}
