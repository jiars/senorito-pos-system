// Temporary lab fixtures: no API, session, or offline order database access.
export const printTestCases = [
  { id: "simple", label: "Simple receipt", description: "Two drinks. Check that the first and last lines appear." },
  { id: "addons", label: "Add-ons and discount", description: "Check add-on quantities, the long discount label, and change." },
  { id: "long", label: "Long receipt", description: "20 sample lines. Preview first; this can use more paper." },
  { id: "characters", label: "Special characters", description: "Check Señorito, Café, and the peso sign. Raw-text support will depend on the printer." },
];

export const labelTestSizes = [
  { id: "50x30", label: "50 × 30 mm", width: 50, height: 30 },
  { id: "58x40", label: "58 × 40 mm", width: 58, height: 40 },
  { id: "60x40", label: "60 × 40 mm", width: 60, height: 40 },
];

export function createPrintTestReceipt(caseId) {
  let items = [
    { name: "Iced Latte", variant: "Reg", qty: 2, basePrice: 100, addOns: [] },
    { name: "Chocolate Frappe", variant: "Large", qty: 1, basePrice: 120, addOns: [] },
  ];

  if (caseId === "addons") {
    items = [
      { name: "Iced Caramel Latte with a Long Sample Name", variant: "Large", qty: 2, basePrice: 100,
        addOns: [{ name: "Extra espresso shot", qty: 1, price: 20 }] },
      { name: "Chocolate Frappe", variant: "Reg", qty: 1, basePrice: 120, addOns: [] },
    ];
  }

  if (caseId === "long") {
    items = Array.from({ length: 20 }, (_, index) => {
      return { name: `Sample drink ${index + 1} with a long menu name`, variant: "Large", qty: 1, basePrice: 100, addOns: [] };
    });
  }

  if (caseId === "characters") {
    items = [{ name: "Señorito Café Latte", variant: "Reg", qty: 1, basePrice: 99.5, addOns: [] }];
  }

  // Only fixture totals are calculated here; real checkout remains unchanged.
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.basePrice * item.qty;
    for (const addon of item.addOns) {
      subtotal += addon.price * addon.qty * item.qty;
    }
  }
  let discountAmount = 0;
  let discountType = "None";
  if (caseId === "addons") {
    discountAmount = subtotal * 0.2;
    discountType = "Sample discount (20%)";
  }
  const total = subtotal - discountAmount;
  const amountPaid = Math.ceil(total / 500) * 500;

  return {
    transactionId: `TEST ONLY - NOT A SALE / ${caseId.toUpperCase()}`,
    date: "2026-10-02T12:00:00+08:00",
    cashier: "Sample Cashier",
    orderSource: "Print Test",
    paymentMethod: "Sample Cash",
    items, subtotal, discountType, discountAmount, total, amountPaid,
    change: amountPaid - total,
  };
}
