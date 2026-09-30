import { useState } from 'react';
import POSCartItem from './POSCartItem';
import POSCartFooter from './POSCartFooter';
import CashPaymentModal from '../../modals/CashPaymentModal/CashPaymentModal';
import { Skeleton } from "@/components/ui/skeleton";

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
  isCartOpen,
  setIsCartOpen,
  isLoading
}) => {

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  // Logic from old CartSidebar
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

  const isProcessDisabled = isProcessingOrder || cartItems.length === 0;

  const handleOrderSourceChange = (source) => {
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
          <button
            className={`text-[length:var(--app-font-size-body-secondary)] font-semibold transition-colors disabled:opacity-30 ${cartItems.length > 0 ? 'text-[#0D6EFD]' : 'text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text-soft)]'}`}
            onClick={onClearCart}
            title={cartItems.length > 0 ? "Clear Cart" : "Cart is empty"}
            disabled={cartItems.length === 0}
            aria-label="Clear current order"
          >
            Clear
          </button>
        </div>

        {/* Phone Close Button - only visible on small screens */}
        <button
          className="pos-cart-close-btn absolute top-[var(--app-space-4)] right-[var(--app-space-4)] w-[var(--app-touch-target-min,2.75rem)] h-[var(--app-touch-target-min,2.75rem)] rounded-[var(--app-radius-button,0.5rem)] bg-[var(--app-color-canvas)] text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-filter-bg)]"
          onClick={() => setIsCartOpen(false)}
        >
          <i className="bi bi-chevron-down"></i>
        </button>
      </div>

      {/* Order Source */}
      <div className="flex flex-wrap gap-[var(--app-space-2)] p-[var(--app-space-4)] shrink-0 bg-[var(--app-color-canvas)]">
        {['In-Store', 'Foodpanda', 'Grab'].map(source => (
          <button
            key={source}
            className={`flex-1 min-w-[70px] h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold rounded-full border transition-all whitespace-normal leading-[var(--app-line-height-caption)] text-center flex items-center justify-center ${
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
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-[var(--app-color-text-subtle)] opacity-60">
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
            />
          ))
        )}
      </div>

      {/* Footer - fixed max-height region */}
      <div className="pos-cart-footer">
        <POSCartFooter
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          change={change}
          paid={paid}
          discountType={discountType}
          setDiscountType={setDiscountType}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          orderSource={orderSource}
          isProcessDisabled={isProcessDisabled}
          onProcessOrder={onProcessOrder}
          isProcessingOrder={isProcessingOrder}
          onOpenCashModal={() => setIsCashModalOpen(true)}
        />
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
        />
      )}
    </div>
  );
};

export default POSCartSidebar;
