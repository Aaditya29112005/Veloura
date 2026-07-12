import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Security practice: Return 200 OK even if user doesn't exist to prevent account enumeration
      return NextResponse.json({ message: "If the email is registered, a password reset token has been dispatched." });
    }

    // Generate simulated recovery token
    const token = Math.random().toString(36).substring(2, 15);
    console.log(`[RecoveryAuth] Generated recovery token for ${email}: ${token}`);
    
    // In production, dispatch this token via email (e.g. Resend, Sendgrid)

    return NextResponse.json({ 
      message: "If the email is registered, a password reset token has been dispatched.",
      token: process.env.NODE_ENV === "development" ? token : undefined
    });
  } catch (error: any) {
    console.error("Forgot password failure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
