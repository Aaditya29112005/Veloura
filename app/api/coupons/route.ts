import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth-helper";

// GET - Validate coupon code OR list coupons (Admin only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const subtotalStr = searchParams.get("subtotal");
    const adminMode = searchParams.get("admin") === "true";

    // 1. Admin mode listing
    if (adminMode) {
      const adminCheck = await isAdmin();
      if (!adminCheck) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(coupons);
    }

    // 2. Coupon Validation mode
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    // Verify expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Verify minimum subtotal if provided
    if (subtotalStr) {
      const subtotal = parseFloat(subtotalStr);
      if (subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { error: `This coupon requires a minimum subtotal of $${coupon.minOrderValue}` },
          { status: 400 }
        );
      }
    }

    // Verify usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Coupon validation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

// POST - Create coupon (Admin only)
export async function POST(request: Request) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if code exists
    const existing = await db.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: normalizedCode,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Coupon create error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
