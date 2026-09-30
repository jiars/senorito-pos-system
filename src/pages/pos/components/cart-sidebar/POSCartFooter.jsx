import { formatCurrency } from '../../../../utils/currencyFormatters';

const POSCartFooter = ({
  subtotal,
  discountAmount,
  total,
  change,
  paid,
  discountType,
  setDiscountType,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  orderSource,
  isProcessDisabled,
  onProcessOrder,
  isProcessingOrder,
  onOpenCashModal
}) => {

  const standardBtnClasses = "flex-1 min-w-[70px] h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold rounded-[var(--app-radius-panel-standard,1rem)] border transition-all whitespace-normal leading-[var(--app-line-height-caption)] text-center flex flex-wrap items-center justify-center gap-[var(--app-space-1)]";
  const btnActive = "bg-[var(--app-color-brand)] border-[var(--app-color-brand)] text-white shadow-sm";
  const btnInactive = "bg-[var(--app-color-surface)] border-[var(--app-color-border)] text-[var(--app-color-text-soft)] hover:bg-[var(--app-color-canvas)]";
  const btnDisabled = "opacity-40 cursor-not-allowed hover:bg-[var(--app-color-surface)] bg-[var(--app-color-canvas)] text-[var(--app-color-text-subtle)]";

  return (
    <div className="flex flex-col bg-[var(--app-color-canvas)] p-[var(--app-space-4)] gap-[var(--app-space-4)] pb-[var(--app-space-4)]">

      {/* Summary */}
      <div className="flex flex-col gap-[var(--app-space-2)] bg-[var(--app-color-surface)] rounded-[var(--app-radius-panel-standard,1rem)] p-[var(--app-space-4)] shadow-sm">
        <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
          <span className="text-[var(--app-color-text-muted)] font-medium">Subtotal</span>
          <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
          <span className="flex items-center gap-[var(--app-space-2)] text-[var(--app-color-text-muted)] font-medium">
            Discount
            <select
              className="text-[length:var(--app-font-size-body-secondary)] bg-[var(--app-color-canvas)] border border-[var(--app-color-border-subtle)] rounded px-[var(--app-space-1)] py-[2px] outline-none focus:border-[var(--app-color-brand)]"
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

      {/* Payment Method - Moved right before Process Order */}
      <div className="flex flex-col gap-[var(--app-space-2)] mt-[var(--app-space-1)]">
        <h4 className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text-subtle)] m-0">Payment Method</h4>
        <div className="flex flex-wrap gap-[var(--app-space-2)] w-full">
          <button
            className={`${standardBtnClasses} ${paymentMethod === 'Cash' ? btnActive : btnInactive} ${orderSource !== 'In-Store' ? btnDisabled : ''}`}
            onClick={() => {
              setPaymentMethod('Cash');
              if (subtotal > 0) {
                onOpenCashModal();
              }
            }}
            disabled={orderSource !== 'In-Store'}
          >
            <i className="bi bi-cash"></i> Cash
          </button>
          <button
            className={`${standardBtnClasses} ${paymentMethod === 'GCash' ? btnActive : btnInactive} ${orderSource !== 'In-Store' ? btnDisabled : ''}`}
            onClick={() => setPaymentMethod('GCash')}
            disabled={orderSource !== 'In-Store'}
          >
            <i className="bi bi-credit-card"></i> Card
          </button>
          <button
            className={`${standardBtnClasses} ${paymentMethod === 'External' ? btnActive : btnInactive} ${orderSource === 'In-Store' ? btnDisabled : ''}`}
            onClick={() => setPaymentMethod('External')}
            disabled={orderSource === 'In-Store'}
          >
            <i className="bi bi-bag"></i> External
          </button>
        </div>
      </div>

      {/* Process Button */}
      <button
        className="w-full h-[var(--app-touch-target-min,2.75rem)] rounded-[var(--app-radius-panel-standard,1rem)] bg-[var(--app-color-brand)] text-white font-bold text-[length:var(--app-font-size-body-secondary)] tracking-wide shadow-[var(--app-shadow-card)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-[var(--app-space-2)] hover:brightness-110"
        disabled={isProcessDisabled}
        onClick={() => {
          if (paymentMethod === 'Cash') {
            onOpenCashModal();
          } else {
            onProcessOrder({ total, subtotal, discountAmount, change });
          }
        }}
      >
        {isProcessingOrder ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Processing...
          </>
        ) : (
          <>
            Process Order
          </>
        )}
      </button>
    </div>
  );
};

export default POSCartFooter;
