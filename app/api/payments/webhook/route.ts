import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature validation" }, { status: 400 });
    }

    const payload = await request.json();
    const eventType = payload.type;

    console.log(`[PaymentWebhook] Intercepted event signature ${eventType}...`);

    if (eventType === "checkout.session.completed") {
      const session = payload.data.object;
      const orderId = session.metadata.orderId;
      const paymentIntentId = session.payment_intent;

      console.log(`[PaymentWebhook] Order checkout successful: ${orderId}. Transaction: ${paymentIntentId}`);

      // Transactionally record payments and update order statuses
      await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new Error("Order not found in database registry");
        }

        // Flag order as PROCESSING and save transaction ID
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PROCESSING"
          }
        });
        
        console.log(`[PaymentWebhook] Order ${orderId} updated to PROCESSING.`);
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing failure:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
