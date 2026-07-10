import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth-helper";

// GET user order history or all orders for admin
export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("admin") === "true";

    if (fetchAll) {
      const adminCheck = await isAdmin();
      if (!adminCheck) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Admin gets all orders with user details
      const orders = await db.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: {
                select: { name: true, images: true },
              },
            },
          },
          coupon: true,
        },
      });

      return NextResponse.json(orders);
    }

    // Regular shopper gets their own orders
    const orders = await db.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true },
            },
          },
        },
        coupon: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Place simulated order (Checkout)
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shippingAddress, billingAddress, couponCode } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get current user's cart
    const cart = await db.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // 1. Stock verification
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product "${item.product.name}". Only ${item.product.stock} available.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 2. Validate and apply coupon
    let coupon = null;
    let discount = 0;

    if (couponCode) {
      coupon = await db.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (!coupon || !coupon.active) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      // Check expiry date
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }

      // Check min order value
      if (subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { error: `Coupon requires a minimum order value of $${coupon.minOrderValue}` },
          { status: 400 }
        );
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 });
      }

      // Calculate discount
      if (coupon.discountType === "PERCENT") {
        discount = subtotal * (coupon.discountValue / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);

    // 3. Database transaction: Create order, decrement stock, increment coupon count, clear cart
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          status: "PENDING",
          totalAmount,
          shippingAddress,
          billingAddress: billingAddress || null,
          couponId: coupon ? coupon.id : null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // lock the price
              size: item.size,
              color: item.color,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Increment coupon usage count
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      // Clear the cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Checkout order placement error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while placing your order" },
      { status: 500 }
    );
  }
}
