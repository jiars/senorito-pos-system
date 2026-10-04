import test from "node:test";
import assert from "node:assert/strict";
import { createPrintTestReceipt, printTestCases } from "./printTestFixtures.js";
import { printingStrategies } from "../printingStrategies.js";

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
});

test("the lab exposes only three delivery methods with beginner guides", () => {
  assert.deepEqual(printingStrategies.map((strategy) => { return strategy.id; }), ["browser", "rawbt", "qz"]);
  for (const strategy of printingStrategies) {
    assert.ok(strategy.tutorial.length >= 6);
    assert.equal(new Set(strategy.tutorial.map((step) => { return step.title; })).size, strategy.tutorial.length);
    assert.ok(strategy.tutorial.every((step) => { return step.title && step.text; }));
    assert.ok(strategy.links.every((link) => { return link.url.startsWith("https://") && link.label; }));
  }
});
