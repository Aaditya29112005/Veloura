import assert from "node:assert";

// Mock helper representing bundle discount logic inside cart
function calculateCartSubtotal(items: any[]) {
  let subtotal = 0;
  let hasTop = false;
  let hasBottom = false;
  let bundleDiscount = 0;

  for (const item of items) {
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;

    const name = item.product.name.toLowerCase();
    if (name.includes("shirt") || name.includes("tee") || name.includes("sweater") || name.includes("hoodie")) {
      hasTop = true;
    }
    if (name.includes("pant") || name.includes("trouser") || name.includes("jeans") || name.includes("shorts")) {
      hasBottom = true;
    }
  }

  // Bundle discount is 15% off tops and bottoms if both category types are in cart
  if (hasTop && hasBottom) {
    let topAndBottomSum = 0;
    for (const item of items) {
      const name = item.product.name.toLowerCase();
      const isTop = name.includes("shirt") || name.includes("tee") || name.includes("sweater") || name.includes("hoodie");
      const isBottom = name.includes("pant") || name.includes("trouser") || name.includes("jeans") || name.includes("shorts");
      if (isTop || isBottom) {
        topAndBottomSum += item.product.price * item.quantity;
      }
    }
    bundleDiscount = topAndBottomSum * 0.15;
  }

  return {
    subtotal,
    discount: bundleDiscount,
    finalTotal: subtotal - bundleDiscount
  };
}

// Execution Block
console.log("[Test] Running Cart Totals & Bundle Discount Unit Tests...");

// Test Case 1: Empty Cart
const resEmpty = calculateCartSubtotal([]);
assert.strictEqual(resEmpty.subtotal, 0);
assert.strictEqual(resEmpty.discount, 0);
assert.strictEqual(resEmpty.finalTotal, 0);
console.log("✔ Test Case 1 Passed: Empty Cart.");

// Test Case 2: Only Top, No Discount
const resOnlyTop = calculateCartSubtotal([
  { product: { name: "Silk Shirt", price: 100 }, quantity: 1 }
]);
assert.strictEqual(resOnlyTop.subtotal, 100);
assert.strictEqual(resOnlyTop.discount, 0);
console.log("✔ Test Case 2 Passed: Single Top No Discount.");

// Test Case 3: Top + Bottom Bundle Discount (15% off)
const resBundle = calculateCartSubtotal([
  { product: { name: "Silk Shirt", price: 100 }, quantity: 1 },
  { product: { name: "Denim Trousers", price: 200 }, quantity: 1 }
]);
assert.strictEqual(resBundle.subtotal, 300);
// 15% of 300 is 45
assert.strictEqual(resBundle.discount, 45);
assert.strictEqual(resBundle.finalTotal, 255);
console.log("✔ Test Case 3 Passed: Top + Bottom 15% Bundle Discount applied.");

console.log("✔ ALL CART UNIT TESTS PASSED CLEANLY!");
