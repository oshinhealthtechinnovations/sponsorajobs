import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";
import { telegramService } from "@/lib/services/telegramService";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, profession, email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name." },
        { status: 400 }
      );
    }

    if (!profession || profession.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter your profession / target job title." },
        { status: 400 }
      );
    }

    const trialRequest = await userRepository.createTrialRequest({
      name,
      profession,
      email,
    });

    // Notify Telegram instantly
    try {
      telegramService.notifyTrialRequested({
        name,
        email,
        profession,
      }).catch(console.error);
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json({
      success: true,
      message: "Your Free Trial Request has been successfully received! Our team will review and activate your access, or you can message Sumit Raj on LinkedIn for instant referral code approval.",
      request: trialRequest,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit trial request." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const requests = await userRepository.getAllTrialRequests();
  return NextResponse.json({
    success: true,
    data: requests,
    total: requests.length,
  });
}
