import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=========================================");
  console.log("        VELOURA AUTOMATED TEST SUITE     ");
  console.log("=========================================");

  let testUser: any = null;
  let testOrder: any = null;
  let targetProduct: any = null;
  let initialStock = 0;
  const orderQty = 2;

  try {
    // -----------------------------------------------------------
    // TEST 1: User Registration & Password Hashing
    // -----------------------------------------------------------
    console.log("\n[Test 1] Testing User Registration & Password Hashing...");
    const testEmail = `tester-${Date.now()}@luxury.com`;
    const plainPassword = "securePassword123";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Confirm password cannot be reversed easily
    if (hashedPassword === plainPassword) {
      throw new Error("FAIL: Password was stored in plaintext!");
    }

    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test Runner User",
        passwordHash: hashedPassword,
        role: "USER",
      },
    });

    console.log(`✔ SUCCESS: Created test user ${testUser.email}`);
    
    // Check comparison
    const matches = await bcrypt.compare(plainPassword, testUser.passwordHash);
    if (!matches) {
      throw new Error("FAIL: Decryption comparison check failed for correct credentials!");
    }
    console.log("✔ SUCCESS: Password verification comparison matched.");

    // -----------------------------------------------------------
    // TEST 2: Transactional Checkout & Stock Subtraction
    // -----------------------------------------------------------
    console.log("\n[Test 2] Testing Order Placement Transaction & Stock Subtraction...");
    
    // Find an active product with stock
    targetProduct = await prisma.product.findFirst({
      where: { stock: { gte: 5 } },
    });

    if (!targetProduct) {
      throw new Error("FAIL: Seed data has no products with stock >= 5 to test order placement.");
    }

    initialStock = targetProduct.stock;
    console.log(`Targeting product: "${targetProduct.name}" (Initial stock: ${initialStock})`);

    // Simulate order placement inside a Prisma transaction (identical to API route)
    testOrder = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: testUser.id,
          status: "PENDING",
          totalAmount: targetProduct.price * orderQty,
          shippingAddress: "456 Test Lane, Austin, TX",
          items: {
            create: {
              productId: targetProduct.id,
              quantity: orderQty,
              price: targetProduct.price,
              size: "M",
              color: "Black",
            },
          },
        },
      });

      // Decrement stock
      await tx.product.update({
        where: { id: targetProduct.id },
        data: {
          stock: {
            decrement: orderQty,
          },
        },
      });

      return newOrder;
    });

    console.log(`✔ SUCCESS: Created order ID ${testOrder.id}`);

    // Verify stock depletion in database
    const updatedProduct = await prisma.product.findUnique({
      where: { id: targetProduct.id },
    });

    if (!updatedProduct) {
      throw new Error("FAIL: Product was deleted during transaction!");
    }

    const expectedStock = initialStock - orderQty;
    if (updatedProduct.stock !== expectedStock) {
      throw new Error(`FAIL: Stock count mismatch! Expected ${expectedStock}, got ${updatedProduct.stock}`);
    }
    console.log(`✔ SUCCESS: Product stock decremented from ${initialStock} to ${updatedProduct.stock} (reduced by ${orderQty}).`);

  } catch (error: any) {
    console.error("\n❌ TESTS FAILED:", error.message || error);
    process.exit(1);
  } finally {
    // -----------------------------------------------------------
    // CLEANUP TEST RECORDS
    // -----------------------------------------------------------
    console.log("\nCleaning up test records...");
    
    if (testOrder) {
      try {
        await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
        await prisma.order.delete({ where: { id: testOrder.id } });
        console.log("Removed simulated order.");
      } catch (err) {}
    }

    // Revert stock count
    if (targetProduct) {
      try {
        await prisma.product.update({
          where: { id: targetProduct.id },
          data: { stock: initialStock },
        });
        console.log("Restored target product stock level.");
      } catch (err) {}
    }

    if (testUser) {
      try {
        await prisma.user.delete({ where: { id: testUser.id } });
        console.log("Removed test user.");
      } catch (err) {}
    }

    await prisma.$disconnect();
    console.log("\n=========================================");
    console.log("   ALL INTEGRATION TESTS PASSED CLEANLY   ");
    console.log("=========================================");
  }
}

runTests();
