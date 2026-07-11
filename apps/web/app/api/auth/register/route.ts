import { NextResponse } from "next/server";
import { demoSession, demoUser } from "@parksverige/prototype-data";

export async function POST(request: Request) {
  const payload = (await request.json()) as { email?: string; password?: string };

  return NextResponse.json({
    user: {
      ...demoUser,
      email: payload.email || demoUser.email
    },
    session: demoSession,
    onboardingState: "vehicle-required"
  });
}

