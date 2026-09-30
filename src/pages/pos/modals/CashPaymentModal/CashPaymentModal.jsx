import React, { useState } from 'react';
import { formatCurrency } from '../../../../utils/currencyFormatters';

const CashPaymentModal = ({
  totalQty,
  subtotal,
  discountType,
  setDiscountType,
  discountAmount,
  total,
  amountPaid,
  setAmountPaid,
  change,
  onClose,
  onProcessOrder,
  isProcessingOrder
}) => {
  const [showError, setShowError] = useState(false);

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmountPaid(val);
    if (showError) setShowError(false);
  };

  const handleProcessClick = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }
    onProcessOrder({ total, subtotal, discountAmount, change });
  };

  const paid = parseFloat(amountPaid) || 0;
  const isValid = paid >= total && total > 0;

  const labelClassName = "text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]";
  const inputWrapperClassName = "flex items-center h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0";
  const addonClassName = "flex cursor-text items-center justify-center gap-2 py-1.5 select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] !px-[var(--app-space-4)] text-[length:var(--app-font-size-body)] font-semibold text-[var(--app-color-brand-number)]";
  const inputClassName = "w-full min-w-0 border-input py-1 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[var(--app-space-4)]">
      <div className="bg-[var(--app-color-surface)] rounded-[var(--app-radius-panel-large,1.5rem)] w-full max-w-[28rem] flex flex-col overflow-hidden shadow-[var(--app-shadow-modal)]">

        {/* Header (Matched exact CustomizeOrderModal layout) */}
        <header className="flex shrink-0 items-center justify-between gap-[var(--app-gap-related)] border-b border-[var(--app-color-border-subtle)] px-[var(--app-space-6)] py-[var(--app-space-4)] relative justify-center [&>div]:items-center [&_[data-slot=dialog-header]]:!text-center [&>button]:absolute [&>button]:right-[var(--app-space-6)]">
          <div className="flex flex-col gap-1" data-slot="dialog-header">
            <h2 className="text-[length:var(--app-font-size-h3)] font-bold m-0 text-[var(--app-color-text)]">Cash Payment</h2>
            <p className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-danger)] m-0">Total items {totalQty}</p>
          </div>
          <button
            className="flex items-center justify-center size-[var(--app-touch-target-min,2.75rem)] rounded-full text-[var(--app-color-text-muted)] hover:text-[var(--app-color-text)] hover:bg-[var(--app-color-surface-soft)] transition-colors"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {/* Content (Matched exact layout from AddExpense) */}
        <div className="flex flex-col gap-[var(--app-gap-related)] p-[var(--app-space-8)]">

          {/* Summary Box */}
          <div className="flex flex-col gap-[var(--app-space-2)] px-[var(--app-space-4)]">
            <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
              <span className="text-[var(--app-color-text-muted)] font-medium">Subtotal</span>
              <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
              <span className="flex items-center gap-[var(--app-space-2)] text-[var(--app-color-text-muted)] font-medium">
                Discount
                <select
                  className="bg-[var(--app-color-canvas)] border border-[var(--app-color-border-subtle)] rounded px-[var(--app-space-1)] py-[2px] outline-none cursor-pointer text-[var(--app-color-text-muted)]"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Senior/PWD (20%)">Senior/PWD</option>
                </select>
              </span>
              <span className={`font-semibold ${discountAmount > 0 ? 'text-[var(--app-color-danger)]' : 'text-[var(--app-color-text)]'}`}>
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0)}
              </span>
            </div>

            <div className="border-t border-dashed border-[var(--app-color-border-subtle)] my-[var(--app-space-1)]"></div>

            <div className="flex justify-between items-center text-[length:var(--app-font-size-body)]">
              <span className="font-bold text-[var(--app-color-text)]">Total</span>
              <span className="font-bold text-[var(--app-color-brand)] text-[length:var(--app-font-size-h3)]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Cash Inputs */}
          <div className="flex flex-col gap-[var(--app-gap-related)]">
            <div role="group" data-slot="field" data-orientation="vertical" className="group/field flex w-full gap-2 data-[invalid=true]:text-destructive flex-col *:w-full [&>.sr-only]:w-auto" data-invalid={(showError && !isValid) ? "true" : "false"}>
              <label className={labelClassName}>
                Cash Receive <span className="text-[var(--app-color-danger)]">*</span>
              </label>
              <div className={inputWrapperClassName}>
                <div role="group" data-slot="input-group-addon" data-align="inline-start" className={addonClassName}>₱</div>
                <input
                  data-slot="input-group-control"
                  aria-invalid={(showError && !isValid)}
                  type="number"
                  min="1"
                  className={inputClassName}
                  value={amountPaid}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {showError && !isValid && (
                <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)] font-medium">
                  Amount paid must be at least {formatCurrency(total)}.
                </span>
              )}
            </div>

            <div role="group" data-slot="field" data-orientation="vertical" className="group/field flex w-full gap-2 data-[invalid=true]:text-destructive flex-col *:w-full [&>.sr-only]:w-auto opacity-60 pointer-events-none select-none" data-invalid="false">
              <label className={labelClassName}>Change</label>
              <div className={`${inputWrapperClassName} bg-[var(--app-color-canvas)]`}>
                <div role="group" data-slot="input-group-addon" data-align="inline-start" className={addonClassName}>₱</div>
                <input
                  data-slot="input-group-control"
                  aria-invalid="false"
                  type="number"
                  className={inputClassName}
                  value={change > 0 ? change.toFixed(2) : ''}
                  disabled
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer (Matched exact CustomizeOrderModal layout) */}
        <footer className="flex shrink-0 items-center justify-end gap-[var(--app-space-2)] border-t border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-6)] py-[var(--app-space-4)] max-sm:flex-col-reverse max-sm:[&>*]:w-full">
          <button
            className="h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested,0.5rem)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold text-[var(--app-color-text)] bg-[var(--app-color-canvas)] border-none hover:bg-[var(--app-color-surface-hover)] transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested,0.5rem)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessingOrder}
            onClick={handleProcessClick}
          >
            {isProcessingOrder ? 'Processing...' : 'Process Order'}
          </button>
        </footer>

      </div>
    </div>
  );
};

export default CashPaymentModal;
