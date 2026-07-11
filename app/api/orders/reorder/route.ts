import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 450 });
    }

    // Fetch the target past order
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session.userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get or create active cart
    let cart = await db.cart.findUnique({
      where: { userId: session.userId }
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.userId }
      });
    }

    // Verify stock availability and add to cart
    const skippedItems: string[] = [];
    let addedCount = 0;

    for (const item of order.items) {
      if (item.product.stock < item.quantity) {
        skippedItems.push(item.product.name);
        continue;
      }

      // Find if item already exists in active cart
      const existingCartItem = await db.cartItem.findUnique({
        where: {
          cartId_productId_size_color: {
            cartId: cart.id,
            productId: item.productId,
            size: item.size,
            color: item.color
          }
        }
      });

      if (existingCartItem) {
        // Increment quantity up to product stock
        const newQty = Math.min(item.product.stock, existingCartItem.quantity + item.quantity);
        await db.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQty }
        });
      } else {
        // Create new cart item
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }
        });
      }
      addedCount++;
    }

    if (addedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Failed to reorder. All items are out of stock."
      }, { status: 400 });
    }

    let warning = "";
    if (skippedItems.length > 0) {
      warning = `Note: Some items (${skippedItems.join(", ")}) could not be added due to insufficient stock.`;
    }

    return NextResponse.json({
      success: true,
      addedCount,
      message: `Successfully cloned ${addedCount} items into your cart. ${warning}`
    });
  } catch (error) {
    console.error("Reorder API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
