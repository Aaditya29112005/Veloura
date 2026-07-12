import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized session access" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "MFA code is required" }, { status: 400 });
    }

    console.log(`[MFAAuth] Checking 2FA security code ${code} for user ${user.userId}...`);
    
    // Simulate TOTP verification (e.g. speakeasy, otplib)
    const isCodeValid = code === "123456" || code.length === 6;

    if (!isCodeValid) {
      return NextResponse.json({ error: "Invalid two-factor code authentication" }, { status: 400 });
    }

    return NextResponse.json({ message: "Multi-factor authentication validated." });
  } catch (error: any) {
    console.error("MFA verification failure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
