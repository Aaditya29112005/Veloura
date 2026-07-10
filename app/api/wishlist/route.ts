import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-helper";

// GET user's wishlist
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await db.wishlist.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Toggle wishlist status for a product
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if item is already in wishlist
    const existing = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove it (toggle off)
      await db.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Removed from wishlist", active: false });
    } else {
      // Add it (toggle on)
      const newItem = await db.wishlist.create({
        data: {
          userId: session.userId,
          productId,
        },
      });
      return NextResponse.json({ message: "Added to wishlist", active: true, item: newItem });
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
