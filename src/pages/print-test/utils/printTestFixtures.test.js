import test from "node:test";
import assert from "node:assert/strict";
import { createPrintTestReceipt, labelTestSizes, printTestCases } from "./printTestFixtures.js";

for (const fixture of printTestCases) {
  test(`${fixture.id}: sample-only identity and balanced totals`, () => {
    const receipt = createPrintTestReceipt(fixture.id);
    assert.match(receipt.transactionId, /^TEST ONLY - NOT A SALE/);
    assert.equal(receipt.cashier, "Sample Cashier");
    assert.ok(receipt.items.length > 0 && receipt.items.length <= 20);
    const subtotal = receipt.items.reduce((sum, item) => {
      const addons = item.addOns.reduce((addonSum, addon) => addonSum + addon.price * addon.qty, 0);
      return sum + (item.basePrice + addons) * item.qty;
    }, 0);
    assert.equal(receipt.subtotal, subtotal);
    assert.equal(receipt.total, receipt.subtotal - receipt.discountAmount);
    assert.equal(receipt.change, receipt.amountPaid - receipt.total);
    assert.ok(receipt.change >= 0);
    assert.equal(receipt.id, undefined);
  });
}

test("fixtures are independent and include the intended edge cases", () => {
  const changed = createPrintTestReceipt("simple");
  changed.items[0].name = "Changed sample";
  assert.equal(createPrintTestReceipt("simple").items[0].name, "Iced Latte");
  assert.equal(createPrintTestReceipt("addons").subtotal, 360);
  assert.equal(createPrintTestReceipt("addons").discountAmount, 72);
  assert.equal(createPrintTestReceipt("long").items.length, 20);
  assert.match(createPrintTestReceipt("characters").items[0].name, /ñ.*é/);
  assert.ok(labelTestSizes.every((size) => size.width > 0 && size.height > 0));
});
