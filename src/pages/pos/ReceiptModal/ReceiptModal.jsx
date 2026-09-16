import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';
import { formatDate, formatTime } from '../../../utils/dateFormatters';
import './ReceiptModal.css';

const ReceiptModal = ({ orderDetails, onClose }) => {
  if (!orderDetails) return null;

  const {
    transactionId,
    cartItems,
    cashier_name,
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

  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);

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
              <strong>Cashier</strong> <span>{cashier_name || 'Cashier'}</span>
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
                <React.Fragment key={item.cartId}>
                  <tr className={item.addOns && item.addOns.length > 0 ? "pos-receipt-main-row-with-addon" : ""}>
                    <td>
                      <p className="pos-receipt-item-name">
                        {item.name} {item.variant !== 'Regular' ? `(${item.variant})` : ''}
                      </p>
                    </td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.basePrice || item.price)}</td>
                    <td>{formatCurrency((item.basePrice || item.price) * item.qty)}</td>
                  </tr>
                  {item.addOns && item.addOns.length > 0 && item.addOns.map((ao, idx) => (
                    <tr key={`${item.cartId}-ao-${idx}`} className="pos-receipt-addon-row">
                      <td>
                        <p className="pos-receipt-item-addon">
                          {ao.qty * item.qty}x {ao.name}
                        </p>
                      </td>
                      <td></td>
                      <td>{formatCurrency(ao.price)}</td>
                      <td>{formatCurrency(Number(ao.price) * ao.qty * item.qty)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <hr className="pos-receipt-divider" />

          <div className="pos-receipt-summary">
            <div className="pos-receipt-summary-row">
              <strong>Subtotal</strong>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="pos-receipt-summary-row">
              <strong>Discounts {discountType !== 'None' ? `(${discountType})` : ''}</strong>
              <span>{formatCurrency(discountAmount)}</span>
            </div>
            <div className="pos-receipt-summary-row total">
              <strong>Total</strong>
              <span>{formatCurrency(total)}</span>
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
              <span>{formatCurrency(amountPaid)}</span>
            </div>
            <div className="pos-receipt-payment-row">
              <strong>Change</strong>
              <span>{formatCurrency(change)}</span>
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
