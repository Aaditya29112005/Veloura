import assert from "node:assert";

// Mock helper representing inventory deductions
function deductInventory(stock: number, quantity: number) {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (stock < quantity) {
    throw new Error("Insufficient stock level");
  }
  return stock - quantity;
}

// Execution Block
console.log("[Test] Running Inventory Stock Unit Tests...");

// Test Case 1: Successful Stock Subtraction
const remainingStock = deductInventory(10, 3);
assert.strictEqual(remainingStock, 7);
console.log("✔ Test Case 1 Passed: Stock deducted correctly.");

// Test Case 2: Insufficient Stock
assert.throws(() => {
  deductInventory(5, 8);
}, /Insufficient stock level/);
console.log("✔ Test Case 2 Passed: Insufficient stock throws error.");

// Test Case 3: Invalid Quantity
assert.throws(() => {
  deductInventory(10, 0);
}, /Quantity must be greater than zero/);
console.log("✔ Test Case 3 Passed: Invalid zero/negative quantity throws error.");

console.log("✔ ALL INVENTORY UNIT TESTS PASSED CLEANLY!");
