import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-helper";

// POST - Create or update a product review
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating (1-5), and comment are required" },
        { status: 400 }
      );
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upsert the review (one review per user per product)
    const review = await db.review.upsert({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
      update: {
        rating: numericRating,
        comment,
      },
      create: {
        userId: session.userId,
        productId,
        rating: numericRating,
        comment,
      },
    });

    return NextResponse.json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
