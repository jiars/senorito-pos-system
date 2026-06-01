import React from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ orderDetails, onClose }) => {
  if (!orderDetails) return null;

  const {
    transactionId,
    cartItems,
    orderSource,
    paymentMethod,
    discountType,
    subtotal,
    discountAmount,
    total,
    amountPaid,
    change,
    date
  } = orderDetails;

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pos-receipt-overlay" onClick={onClose}>
      <div className="pos-receipt-modal" onClick={e => e.stopPropagation()}>

        <div className="pos-receipt-content-wrapper">
          <div className="pos-receipt-header">
            <button className="pos-receipt-close" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
            <h2>Señorito Cafe</h2>
            <p>284 FR. CORDERO ST., LAMBAKIN, MARILAO, BULACAN, 3019</p>
            <div className="pos-receipt-transaction">
              {transactionId}
            </div>
          </div>

          <hr className="pos-receipt-divider" />

          <div className="pos-receipt-details">
            <div className="pos-receipt-detail-row">
              <strong>Date</strong> <span>{formattedDate}</span>
            </div>
            <div className="pos-receipt-detail-row">
              <strong>Time</strong> <span>{formattedTime}</span>
            </div>
            <div className="pos-receipt-detail-row">
              <strong>Cashier</strong> <span>Jane Velarde Mayorga</span>
            </div>
            <div className="pos-receipt-detail-row">
              <strong>Order Source</strong> <span>{orderSource}</span>
            </div>
            <div className="pos-receipt-detail-row">
              <strong>Payment Method</strong> <span>{paymentMethod}</span>
            </div>
          </div>

          <hr className="pos-receipt-divider" />

          <table className="pos-receipt-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.cartId}>
                  <td>
                    <p className="pos-receipt-item-name">
                      {item.name} {item.variant !== 'Regular' ? `(${item.variant})` : ''}
                    </p>
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="pos-receipt-item-addon">
                        {item.addOns.map(ao => `${ao.qty}x ${ao.name}`).join(', ')}
                      </p>
                    )}
                  </td>
                  <td>{item.qty}</td>
                  <td>₱{item.price.toFixed(2)}</td>
                  <td>₱{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="pos-receipt-divider" />

          <div className="pos-receipt-summary">
            <div className="pos-receipt-summary-row">
              <strong>Subtotal</strong>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-summary-row">
              <strong>Discounts {discountType !== 'None' ? `(${discountType})` : ''}</strong>
              <span>₱{discountAmount.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-summary-row total">
              <strong>Total</strong>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <hr className="pos-receipt-divider" />

          <div className="pos-receipt-payment-details">
            <div className="pos-receipt-payment-row">
              <strong>Payment Method</strong>
              <span>{paymentMethod}</span>
            </div>
            <div className="pos-receipt-payment-row">
              <strong>Amount Paid</strong>
              <span>₱{amountPaid.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-payment-row">
              <strong>Change</strong>
              <span>₱{change.toFixed(2)}</span>
            </div>
          </div>

          <hr className="pos-receipt-divider" />

          <div className="pos-receipt-thank-you">
            Thank you for visiting Señorito Cafe!
          </div>
        </div>

        <div className="pos-receipt-footer">
          <button className="pos-receipt-print-btn" onClick={handlePrint}>
            <i className="bi bi-printer"></i>
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
