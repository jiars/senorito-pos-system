import { useState } from 'react';
import POSCartItem from './POSCartItem';
import { formatCurrency } from '@/utils/shared/formatters/currencyFormatters';
import CashPaymentModal from '../modals/CashPaymentModal';
import { Skeleton } from "@/components/ui/skeleton";
import { POS_FEEDBACK, getPOSStatusFeedback } from "@/utils/pos/feedback/posFeedback";

const standardBtnClasses = "flex-1 min-w-[70px] h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold rounded-[var(--app-radius-panel-standard,1rem)] border transition-all whitespace-normal leading-[var(--app-line-height-caption)] text-center flex flex-wrap items-center justify-center gap-[var(--app-space-1)]";
const btnActive = "bg-[var(--app-color-brand)] border-[var(--app-color-brand)] text-white shadow-sm";
const btnInactive = "bg-[var(--app-color-surface)] border-[var(--app-color-border)] text-[var(--app-color-text-soft)] hover:bg-[var(--app-color-canvas)]";
const btnDisabled = "opacity-40 cursor-not-allowed hover:bg-[var(--app-color-surface)] bg-[var(--app-color-canvas)] text-[var(--app-color-text-subtle)]";

const POSCartSidebar = ({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  orderSource,
  setOrderSource,
  paymentMethod,
  setPaymentMethod,
  discountType,
  setDiscountType,
  amountPaid,
  setAmountPaid,
  onProcessOrder,
  canIncreaseQuantity,
  isProcessingOrder,
  isCheckoutBlocked = false,
  setIsCartOpen,
  isLoading
}) => {

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const processingFeedback = isProcessingOrder ? getPOSStatusFeedback("ORDER_PROCESSING") : null;
  const isPaymentLocked = isProcessingOrder || isCheckoutBlocked;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (isLoading) {
    return (
      <div className="pos-cart-sidebar bg-[var(--app-color-surface)] shadow-[var(--app-shadow-panel)] border-l border-[var(--app-color-border-subtle)]">
        {/* Header Skeleton */}
        <div className="flex flex-col shrink-0 p-[var(--app-space-4)] border-b border-[var(--app-color-border-subtle)] relative">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-[var(--app-space-1)] w-full">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>

        {/* Order Source Skeleton */}
        <div className="flex flex-wrap gap-[var(--app-space-2)] p-[var(--app-space-4)] shrink-0 bg-[var(--app-color-canvas)]">
          <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-full" />
          <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-full" />
          <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-full" />
        </div>

        {/* Items List Skeleton */}
        <div className="pos-cart-items-list bg-[var(--app-color-canvas)]">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex px-[var(--app-space-4)] py-[var(--app-space-4)] bg-[var(--app-color-canvas)] border-b border-[var(--app-color-border-subtle)] last:border-b-0">
              <Skeleton className="h-[80px] w-full rounded-[var(--app-radius-panel-standard,1rem)]" />
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="pos-cart-footer">
          <div className="flex flex-col bg-[var(--app-color-canvas)] p-[var(--app-space-4)] gap-[var(--app-space-4)] pb-[var(--app-space-4)]">

            {/* Summary Box */}
            <Skeleton className="h-[120px] w-full rounded-[var(--app-radius-panel-standard,1rem)] shadow-sm" />

            {/* Payment Method (No Title) */}
            <div className="flex gap-[var(--app-space-2)] w-full">
              <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-[1rem]" />
              <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-[1rem]" />
              <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] flex-1 rounded-[1rem]" />
            </div>

            {/* Process Button */}
            <Skeleton className="h-[var(--app-touch-target-min,2.75rem)] w-full rounded-[var(--app-radius-panel-standard,1rem)] mt-auto" />
          </div>
        </div>
      </div>
    );
  }

  let discountAmount = 0;
  if (discountType === 'Senior/PWD (20%)') {
    discountAmount = subtotal * 0.20;
  }

  const total = subtotal - discountAmount;

  const paid = (paymentMethod === 'GCash' || paymentMethod === 'External') ? total : (parseFloat(amountPaid) || 0);
  const change = Math.max(0, paid - total);

  const isProcessDisabled = isPaymentLocked || cartItems.length === 0;

  const handleOrderSourceChange = (source) => {
    if (isPaymentLocked) return;
    setOrderSource(source);
    if (source === 'Foodpanda' || source === 'Grab') {
      setPaymentMethod('External');
    } else if (source === 'In-Store') {
      if (paymentMethod === 'External') {
        setPaymentMethod('Cash');
      }
    }
  };

  return (
    <div className="pos-cart-sidebar bg-[var(--app-color-surface)] shadow-[var(--app-shadow-panel)] border-l border-[var(--app-color-border-subtle)]">
      {/* Header */}
      <div className="flex flex-col shrink-0 p-[var(--app-space-4)] border-b border-[var(--app-color-border-subtle)] relative">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-[var(--app-space-1)]">
            <h2 className="m-0 font-bold text-[length:var(--app-font-size-body)] text-[var(--app-color-text)]">
              Current Order
            </h2>
            <div className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-subtle)]">
              Pending Order
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-[var(--app-space-2)]">
            <button
              type="button"
              className={`min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)] font-semibold transition-colors disabled:opacity-30 ${cartItems.length > 0 ? 'text-[var(--app-color-info)]' : 'text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text-soft)]'}`}
              onClick={onClearCart}
              title={cartItems.length > 0 ? "Clear Cart" : "Cart is empty"}
              disabled={isPaymentLocked || cartItems.length === 0}
              aria-label="Clear current order"
            >
              Clear
            </button>
            <button
              type="button"
              aria-label="Close current order panel"
              className="pos-cart-close-btn size-[var(--app-touch-target-min)] items-center justify-center rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-filter-bg)]"
              onClick={() => setIsCartOpen(false)}
            >
              <i className="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Order Source */}
      <div className="flex flex-wrap gap-[var(--app-space-2)] p-[var(--app-space-4)] shrink-0 bg-[var(--app-color-canvas)]">
        {['In-Store', 'Foodpanda', 'Grab'].map(source => (
          <button
            key={source}
            type="button"
            disabled={isPaymentLocked}
            className={`flex-1 min-w-[70px] h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold rounded-full border transition-all whitespace-normal leading-[var(--app-line-height-caption)] text-center flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
              orderSource === source
                ? 'bg-[var(--app-color-brand)] border-[var(--app-color-brand)] text-white shadow-sm'
                : 'bg-[var(--app-color-surface)] border-[var(--app-color-border)] text-[var(--app-color-text-soft)] hover:bg-[var(--app-color-canvas)]'
            }`}
            onClick={() => handleOrderSourceChange(source)}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Cart Items List - takes remaining space */}
      <div className="pos-cart-items-list bg-[var(--app-color-canvas)]">
        {cartItems.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center p-[var(--app-space-4)] text-[var(--app-color-text-subtle)] opacity-60">
            <i className="bi bi-basket text-[length:var(--app-font-size-h1)] mb-[var(--app-space-4)] text-[var(--app-color-border)]"></i>
            <span className="font-semibold text-[length:var(--app-font-size-body-secondary)]">Cart is empty</span>
          </div>
        ) : (
          cartItems.map(item => (
            <POSCartItem
              key={item.cartId}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemoveItem={onRemoveItem}
              canIncreaseQuantity={canIncreaseQuantity}
              isOrderLocked={isPaymentLocked}
            />
          ))
        )}
      </div>

      {/* Footer - fixed max-height region */}
      <div className="pos-cart-footer">
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
                  disabled={isPaymentLocked}
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
                className={`${standardBtnClasses} ${paymentMethod === 'Cash' ? btnActive : btnInactive} ${isPaymentLocked || orderSource !== 'In-Store' ? btnDisabled : ''}`}
                onClick={() => {
                  setPaymentMethod('Cash');
                  if (subtotal > 0) {
                    setIsCashModalOpen(true);
                  }
                }}
                disabled={isPaymentLocked || orderSource !== 'In-Store'}
              >
                <i className="bi bi-cash"></i> Cash
              </button>
              <button
                className={`${standardBtnClasses} ${paymentMethod === 'GCash' ? btnActive : btnInactive} ${isPaymentLocked || orderSource !== 'In-Store' ? btnDisabled : ''}`}
                onClick={() => setPaymentMethod('GCash')}
                disabled={isPaymentLocked || orderSource !== 'In-Store'}
              >
                <i className="bi bi-credit-card"></i> Card
              </button>
              <button
                className={`${standardBtnClasses} ${paymentMethod === 'External' ? btnActive : btnInactive} ${isPaymentLocked || orderSource === 'In-Store' ? btnDisabled : ''}`}
                onClick={() => setPaymentMethod('External')}
                disabled={isPaymentLocked || orderSource === 'In-Store'}
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
              if (isProcessDisabled) return;
              if (paymentMethod === 'Cash') {
                setIsCashModalOpen(true);
              } else {
                onProcessOrder({ total, subtotal, discountAmount, change });
              }
            }}
          >
            {isProcessingOrder ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {processingFeedback.buttonLabel}
              </>
            ) : (
              <>
                {isCheckoutBlocked ? POS_FEEDBACK.CHECKOUT_WAITING : "Process Order"}
              </>
            )}
          </button>
        </div>
      </div>

      {isCashModalOpen && (
        <CashPaymentModal
          totalQty={cartItems.reduce((sum, item) => sum + item.qty, 0)}
          subtotal={subtotal}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountAmount={discountAmount}
          total={total}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          change={change}
          onClose={() => setIsCashModalOpen(false)}
          onProcessOrder={(data) => {
            setIsCashModalOpen(false);
            onProcessOrder(data);
          }}
          isProcessingOrder={isProcessingOrder}
          isCheckoutBlocked={isCheckoutBlocked}
        />
      )}
    </div>
  );
};

export default POSCartSidebar;
