import React from 'react';

const CartSidebar = ({
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
  isCartOpen,
  setIsCartOpen
}) => {

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Dummy discount logic for UI
  let discountAmount = 0;
  if (discountType === 'Senior/PWD (20%)') {
    discountAmount = subtotal * 0.20;
  }

  const total = subtotal - discountAmount;

  // Calculate change
  const paid = (paymentMethod === 'GCash' || paymentMethod === 'External') ? total : (parseFloat(amountPaid) || 0);
  const change = Math.max(0, paid - total);

  // Check if process button should be disabled
  const isProcessDisabled = cartItems.length === 0 || 
    (paymentMethod === 'Cash' && paid < total);

  // Handlers for logic rules
  const handleOrderSourceChange = (source) => {
    setOrderSource(source);
    if (source === 'Foodpanda' || source === 'Grab') {
      setPaymentMethod('External');
    } else if (source === 'In-Store') {
      // Revert to Cash if switching back from External
      if (paymentMethod === 'External') {
        setPaymentMethod('Cash');
      }
    }
  };

  return (
    <div className={`pos-sidebar ${isCartOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="pos-cart-header">
        <button className="pos-cart-close-btn" onClick={() => setIsCartOpen(false)}>
          <i className="bi bi-x-lg"></i>
        </button>
        <h2>Current Order</h2>
        <div className="pos-cart-transaction">Pending Order</div>
        {cartItems.length > 0 && (
          <button className="pos-cart-clear" onClick={onClearCart} title="Clear Cart">
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="pos-cart-items">
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6C757D', marginTop: '2rem', fontSize: '0.9rem' }}>
            <i className="bi bi-cart-x" style={{ fontSize: '2rem', color: '#D9C0AE', display: 'block', marginBottom: '0.5rem' }}></i>
            Cart is empty
          </div>
        ) : (
          cartItems.map(item => (
            <div className="pos-cart-item" key={item.cartId}>
              <div className="pos-cart-item-info">
                <h5 className="pos-cart-item-name">{item.name}</h5>
                <p className="pos-cart-item-meta">{item.variant || 'Regular'} • ₱{item.price.toFixed(2)}</p>
                {item.addOns && item.addOns.length > 0 && (
                  <div className="pos-cart-item-addons" style={{ fontSize: '0.6rem', color: '#9C6C55', marginTop: '0.1rem' }}>
                    {item.addOns.map(ao => `${ao.qty * item.qty}x ${ao.name}`).join(', ')}
                  </div>
                )}
              </div>
              <div className="pos-cart-qty-ctrl">
                <button
                  className="pos-cart-qty-btn"
                  onClick={() => onUpdateQty(item.cartId, item.qty - 1)}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="pos-cart-qty">{item.qty}</span>
                <button
                  className="pos-cart-qty-btn"
                  onClick={() => onUpdateQty(item.cartId, item.qty + 1)}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              <div className="pos-cart-item-total">
                ₱{(item.price * item.qty).toFixed(2)}
              </div>
              <button
                className="pos-cart-item-remove"
                onClick={() => onRemoveItem(item.cartId)}
                title="Remove Item"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Controls & Payment */}
      <div className="pos-cart-controls">

        {/* Segmented Controls */}
        <div className="pos-control-group">
          <h4>Order Source</h4>
          <div className="pos-segmented-btn-group">
            {['In-Store', 'Foodpanda', 'Grab'].map(source => (
              <button
                key={source}
                className={`pos-segment-btn ${orderSource === source ? 'active' : ''}`}
                onClick={() => handleOrderSourceChange(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        <div className="pos-control-group">
          <h4>Payment Method</h4>
          <div className="pos-segmented-btn-group">
            <button
              className={`pos-segment-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Cash')}
              disabled={orderSource === 'Foodpanda' || orderSource === 'Grab'}
            >
              Cash
            </button>
            <button
              className={`pos-segment-btn ${paymentMethod === 'GCash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('GCash')}
              disabled={orderSource === 'Foodpanda' || orderSource === 'Grab'}
            >
              GCash
            </button>
            <button
              className={`pos-segment-btn ${paymentMethod === 'External' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('External')}
              disabled={orderSource === 'In-Store'}
            >
              External
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="pos-summary">
          <div className="pos-summary-row">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="pos-summary-row pos-summary-discount">
            <span>
              Discount
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="None">None</option>
                <option value="Senior/PWD (20%)">Senior/PWD</option>
              </select>
            </span>
            <span className="discount-val">
              {discountAmount > 0 ? `-₱${discountAmount.toFixed(2)}` : '₱0.00'}
            </span>
          </div>
          <div className="pos-total-row">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Input */}
        <div className="pos-payment-inputs">
          <div className="pos-payment-col">
            <label className="pos-payment-label">Amount Paid</label>
            <div className="pos-currency-input">
              <span>₱</span>
              <input
                type="text"
                value={(paymentMethod === 'GCash' || paymentMethod === 'External') ? total.toFixed(2) : amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                disabled={paymentMethod === 'GCash' || paymentMethod === 'External'}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="pos-payment-col">
            <label className="pos-payment-label">Change</label>
            <div className="pos-currency-input">
              <span>₱</span>
              <input
                type="text"
                value={paymentMethod === 'External' ? '0.00' : change.toFixed(2)}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Process Button */}
        <button
          className="pos-btn-process"
          disabled={isProcessDisabled}
          onClick={() => onProcessOrder({ total, subtotal, discountAmount, change })}
        >
          Process Order
        </button>

      </div>
    </div>
  );
};

export default CartSidebar;
