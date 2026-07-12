import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();
    if (!token || !email) {
      return NextResponse.json({ error: "Email and activation token are required" }, { status: 400 });
    }

    console.log(`[EmailAuth] Checking activation token ${token} for ${email}...`);
    
    // Simulate token verification check
    const isValid = token.length > 5;

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired activation link" }, { status: 400 });
    }

    return NextResponse.json({ message: "Email successfully validated." });
  } catch (error: any) {
    console.error("Email verification failure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
