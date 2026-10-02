import { Fragment } from "react";
import { formatCurrency } from "../../utils/currencyFormatters";
import { formatDate, formatTime } from "../../utils/dateFormatters";

const ReceiptRow = ({ label, value, total = false, isAmount = false }) => (
  <div className={`receipt-row flex items-start justify-between gap-[var(--app-space-2)] ${total ? "receipt-total text-[length:var(--app-font-size-h3)] font-bold" : ""}`}>
    <dt className="min-w-0 font-semibold [overflow-wrap:anywhere]">{label}</dt>
    <dd className={isAmount ? "shrink-0 whitespace-nowrap text-right" : "min-w-0 text-right [overflow-wrap:anywhere]"}>{value}</dd>
  </div>
);

const ReceiptDocument = ({ receipt }) => {
  const { items, discountType } = receipt;
  let discountLabel = "Discounts";
  if (discountType && discountType !== "None") {
    discountLabel += ` (${discountType})`;
  }

  return (
    <article className="receipt-document font-[family-name:var(--app-font-family)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
      <header className="receipt-heading space-y-[var(--app-space-2)] text-center">
        <h2 className="text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-brand-header)]">Señorito Cafe</h2>
        <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">284 FR. CORDERO ST., LAMBAKIN, MARILAO, BULACAN, 3019</p>
        <p className="[overflow-wrap:anywhere]">{receipt.transactionId}</p>
      </header>

      <hr className="receipt-divider my-[var(--app-space-4)] border-dashed border-[var(--app-color-border-subtle)]" />
      <dl className="receipt-section space-y-[var(--app-space-2)]">
        <ReceiptRow label="Date" value={formatDate(receipt.date)} />
        <ReceiptRow label="Time" value={formatTime(receipt.date)} />
        <ReceiptRow label="Cashier" value={receipt.cashier || "Cashier"} />
        <ReceiptRow label="Order Source" value={receipt.orderSource} />
        <ReceiptRow label="Payment Method" value={receipt.paymentMethod} />
      </dl>

      <hr className="receipt-divider my-[var(--app-space-4)] border-dashed border-[var(--app-color-border-subtle)]" />
      <table className="receipt-items w-full border-collapse text-right tabular-nums">
        <caption className="sr-only">Ordered items and add-ons</caption>
        <thead>
          <tr>
            <th scope="col" className="text-left">ITEM</th>
            <th scope="col">QTY</th>
            <th scope="col">PRICE</th>
            <th scope="col">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <Fragment key={index}>
              <tr>
                <td className="text-left font-medium [overflow-wrap:anywhere]">
                  {item.name}{item.variant && !["Regular", "Reg"].includes(item.variant) ? ` (${item.variant})` : ""}
                </td>
                <td>{item.qty}</td>
                <td>{formatCurrency(item.basePrice)}</td>
                <td>{formatCurrency(item.basePrice * item.qty)}</td>
              </tr>
              {item.addOns.map((addon, addonIndex) => (
                <tr key={addonIndex} className="receipt-addon text-[var(--app-color-text-muted)]">
                  <td className="text-left [overflow-wrap:anywhere]">+ {addon.name}</td>
                  <td>{addon.qty * item.qty}</td>
                  <td>{formatCurrency(addon.price)}</td>
                  <td>{formatCurrency(addon.price * addon.qty * item.qty)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      <hr className="receipt-divider my-[var(--app-space-4)] border-dashed border-[var(--app-color-border-subtle)]" />
      <dl className="receipt-section space-y-[var(--app-space-2)] tabular-nums">
        <ReceiptRow label="Subtotal" value={formatCurrency(receipt.subtotal)} isAmount />
        <ReceiptRow label={discountLabel} value={formatCurrency(receipt.discountAmount)} isAmount />
        <ReceiptRow label="Total" value={formatCurrency(receipt.total)} isAmount total />
      </dl>

      <div className="receipt-closing">
        <hr className="receipt-divider my-[var(--app-space-4)] border-dashed border-[var(--app-color-border-subtle)]" />
        <dl className="receipt-section space-y-[var(--app-space-2)] tabular-nums">
          <ReceiptRow label="Payment Method" value={receipt.paymentMethod} />
          <ReceiptRow label="Amount Paid" value={formatCurrency(receipt.amountPaid)} isAmount />
          <ReceiptRow label="Change" value={formatCurrency(receipt.change)} isAmount />
        </dl>
        <hr className="receipt-divider my-[var(--app-space-4)] border-dashed border-[var(--app-color-border-subtle)]" />
        <p className="text-center">Thank you for visiting Señorito Cafe!</p>
      </div>
    </article>
  );
};

export default ReceiptDocument;
