import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-helper";

// Fetch user's cart
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cart = await db.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // If no cart exists, create one
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Add, update quantity, or remove cart items
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, size, color } = await request.json();

    if (!productId || quantity === undefined || !size || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's cart
    let cart = await db.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.userId },
      });
    }

    // Check product stock
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Find if item already exists in cart with same size/color
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size,
        color,
      },
    });

    if (quantity <= 0) {
      // If quantity is 0 or less, delete the item if it exists
      if (existingItem) {
        await db.cartItem.delete({
          where: { id: existingItem.id },
        });
      }
      return NextResponse.json({ message: "Item removed from cart" });
    }

    if (existingItem) {
      // Update quantity
      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });
      return NextResponse.json(updatedItem);
    } else {
      // Create new cart item
      const newItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size,
          color,
        },
      });
      return NextResponse.json(newItem, { status: 201 });
    }
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Clear cart
export async function DELETE() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await db.cart.findUnique({
      where: { userId: session.userId },
    });

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
