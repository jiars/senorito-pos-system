import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

function plainText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\u0020-\u007e]/g, "?");
}

function money(value) {
  return `PHP ${Number(value).toFixed(2)}`;
}

export function createTextReceiptCommands(receipt) {
  const encoder = new ReceiptPrinterEncoder({
    language: "esc-pos",
    columns: 32,
  });
  const divider = "-".repeat(32);

  // Sample-only receipt commands; no cutter, drawer, or delivery commands.
  encoder.initialize();
  encoder.align("center");
  encoder.bold(true);
  encoder.line("SENORITO CAFE");
  encoder.bold(false);
  encoder.line("TEST ONLY - NOT A SALE");
  encoder.align("left");
  encoder.line(plainText(receipt.transactionId));
  encoder.line(divider);

  for (const item of receipt.items) {
    let itemName = item.name;
    if (item.variant) {
      itemName += ` (${item.variant})`;
    }
    encoder.line(plainText(itemName));
    encoder.line(
      `${item.qty} x ${money(item.basePrice)} = ${money(item.basePrice * item.qty)}`,
    );

    for (const addon of item.addOns) {
      const quantity = addon.qty * item.qty;
      encoder.line(plainText(`+ ${addon.name}`));
      encoder.line(
        `${quantity} x ${money(addon.price)} = ${money(addon.price * quantity)}`,
      );
    }
    encoder.newline();
  }

  encoder.line(divider);
  encoder.line(`Subtotal: ${money(receipt.subtotal)}`);
  encoder.line(plainText(`Discount: ${receipt.discountType}`));
  encoder.line(`Discount amount: ${money(receipt.discountAmount)}`);
  encoder.bold(true);
  encoder.line(`TOTAL: ${money(receipt.total)}`);
  encoder.bold(false);
  encoder.line(`Paid: ${money(receipt.amountPaid)}`);
  encoder.line(`Change: ${money(receipt.change)}`);
  encoder.line(divider);
  encoder.line("END OF TEST RECEIPT");
  encoder.newline(3);

  return encoder.encode();
}
