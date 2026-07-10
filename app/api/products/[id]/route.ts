import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth-helper";

// Fetch single product by ID or slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check slug first, then ID
    let product = await db.product.findUnique({
      where: { slug: id },
      include: {
        images: true,
        category: {
          select: { name: true, slug: true },
        },
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      product = await db.product.findUnique({
        where: { id },
        include: {
          images: true,
          category: {
            select: { name: true, slug: true },
          },
          reviews: {
            include: {
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, stock, categoryId, sizes, colors, images, status } = body;

    // Verify product exists
    const existing = await db.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update in transaction to rebuild images if provided
    const product = await db.$transaction(async (tx) => {
      // If new images provided, delete old images first
      if (images) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          name: name || undefined,
          description: description || undefined,
          price: price !== undefined ? parseFloat(price) : undefined,
          stock: stock !== undefined ? parseInt(stock) : undefined,
          categoryId: categoryId || undefined,
          sizes: sizes || undefined,
          colors: colors || undefined,
          status: status || undefined,
          images: images
            ? {
                create: images.map((imgUrl: string, idx: number) => ({
                  url: imgUrl,
                  isPrimary: idx === 0,
                })),
              }
            : undefined,
        },
        include: {
          images: true,
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Verify product exists
    const existing = await db.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
