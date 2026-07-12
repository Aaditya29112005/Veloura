import assert from "node:assert";

// Mock helper representing coupon deduction math
function applyCoupon(subtotal: number, coupon: { discountType: "PERCENT" | "FIXED"; discountValue: number; minOrderValue: number }) {
  if (subtotal < coupon.minOrderValue) {
    throw new Error("Min spend value condition not met");
  }

  let discount = 0;
  if (coupon.discountType === "PERCENT") {
    discount = subtotal * (coupon.discountValue / 100);
  } else {
    discount = coupon.discountValue;
  }

  return Math.max(0, subtotal - discount);
}

// Execution Block
console.log("[Test] Running Coupon Deductions Unit Tests...");

// Test Case 1: Percentage Discount Coupon
const couponPercent = { discountType: "PERCENT" as const, discountValue: 15, minOrderValue: 100 };
const totalPercent = applyCoupon(200, couponPercent);
assert.strictEqual(totalPercent, 170); // 200 - 30 = 170
console.log("✔ Test Case 1 Passed: Percentage Discount applied.");

// Test Case 2: Fixed Discount Coupon
const couponFixed = { discountType: "FIXED" as const, discountValue: 30, minOrderValue: 50 };
const totalFixed = applyCoupon(100, couponFixed);
assert.strictEqual(totalFixed, 70); // 100 - 30 = 70
console.log("✔ Test Case 2 Passed: Fixed Value Discount applied.");

// Test Case 3: Min Spend Exception
const couponMin = { discountType: "FIXED" as const, discountValue: 20, minOrderValue: 150 };
assert.throws(() => {
  applyCoupon(100, couponMin);
}, /Min spend value condition not met/);
console.log("✔ Test Case 3 Passed: Min spend constraint throws error.");

console.log("✔ ALL COUPON UNIT TESTS PASSED CLEANLY!");
