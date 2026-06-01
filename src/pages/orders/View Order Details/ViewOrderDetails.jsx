import React from 'react';
import './ViewOrderDetails.css';

const ViewOrderDetails = ({ orderDetails, onClose }) => {
  if (!orderDetails) return null;

  const {
    id,
    date,
    cashier,
    orderSource,
    paymentMethod,
    discountType,
    subtotal,
    discountAmount,
    total,
    amountPaid,
    change,
    items
  } = orderDetails;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const formattedTime = new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={e => e.stopPropagation()}>

        <div className="order-details-content-wrapper">
          <div className="order-details-header">
            <button className="order-details-close" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
            <h2>Señorito Cafe</h2>
            <p>284 FR. CORDERO ST., LAMBAKIN, MARILAO, BULACAN, 3019</p>
            <div className="order-details-transaction">
              {id}
            </div>
          </div>

          <hr className="order-details-divider" />

          <div className="order-details-grid">
            <div className="order-details-row">
              <strong>Date</strong> <span>{formattedDate}</span>
            </div>
            <div className="order-details-row">
              <strong>Time</strong> <span>{formattedTime}</span>
            </div>
            <div className="order-details-row">
              <strong>Cashier</strong> <span>{cashier}</span>
            </div>
            <div className="order-details-row">
              <strong>Order Source</strong> <span>{orderSource}</span>
            </div>
            <div className="order-details-row">
              <strong>Payment Method</strong> <span>{paymentMethod}</span>
            </div>
          </div>

          <hr className="order-details-divider" />

          <table className="order-details-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <p className="order-details-item-name">
                      {item.name} {item.variant && item.variant !== 'Regular' ? `(${item.variant})` : ''}
                    </p>
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="order-details-item-addon">
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

          <hr className="order-details-divider" />

          <div className="order-details-summary">
            <div className="order-details-summary-row">
              <strong>Subtotal</strong>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            {discountType && discountType !== 'None' && (
              <div className="order-details-summary-row">
                <strong>Discounts ({discountType})</strong>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="order-details-summary-row total">
              <strong>Total</strong>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <hr className="order-details-divider" />

          <div className="order-details-payment">
            <div className="order-details-payment-row">
              <strong>Payment Method</strong>
              <span>{paymentMethod}</span>
            </div>
            <div className="order-details-payment-row">
              <strong>Amount Paid</strong>
              <span>₱{amountPaid.toFixed(2)}</span>
            </div>
            <div className="order-details-payment-row">
              <strong>Change</strong>
              <span>₱{change.toFixed(2)}</span>
            </div>
          </div>

        </div>

        <div className="order-details-footer">
          <button className="order-details-print-btn" onClick={handlePrint}>
            <i className="bi bi-printer"></i>
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewOrderDetails;
