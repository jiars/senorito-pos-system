import React from 'react';
import './ViewOrderDetails.css';
import { useOrderItems } from '../../../hooks/useOrderItems';
import { formatCurrency } from '../../../utils/currencyFormatters';

const ViewOrderDetails = ({ orderDetails, onClose }) => {
  const orderId = orderDetails ? orderDetails.id : null;
  const {
    items: orderItems,
    isLoading,
    error,
  } = useOrderItems(orderId);

  if (!orderDetails) return null;

  // Wait for the complete receipt before showing any details or totals.
  if (isLoading || error) {
    return (
      <div className="order-details-overlay" onClick={onClose}>
        <div className="order-details-modal order-details-modal--loading" onClick={(event) => event.stopPropagation()}>
          <div className="order-details-full-state">
            {isLoading ? (
              <>
                <i className="bi bi-arrow-clockwise order-details-loading-icon"></i>
                <span>Loading Order Details...</span>
              </>
            ) : (
              <span className="order-details-error-text">{error}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Transform the Laravel response into the receipt display format.
  const items = orderItems.map((item) => {
    let addonSum = 0;
    const addOns = (item.addons || []).map((orderAddon) => {
      const addonQuantity = Number(orderAddon.quantity) || 0;
      const addonPrice = Number(orderAddon.price) || 0;
      addonSum += addonPrice * addonQuantity;

      return {
        name: orderAddon.addon?.addon_name || 'Unknown Add-on',
        qty: addonQuantity,
        price: addonPrice,
      };
    });

    const combinedUnitPrice = Number(item.unit_price) || 0;

    return {
      name: item.menu_item?.item_name || 'Unknown Item',
      variant: item.variant?.variant_name || 'Regular',
      qty: Number(item.quantity) || 0,
      basePrice: combinedUnitPrice - addonSum,
      subtotal: Number(item.subtotal) || 0,
      addOns,
    };
  });

  const {
    id,
    order_number,
    date,
    cashier,
    orderSource,
    paymentMethod,
    discountType,
    subtotal,
    discountAmount,
    total,
    amountPaid,
    change
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
              {order_number || id}
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>No items found.</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className={item.addOns && item.addOns.length > 0 ? "order-details-main-row-with-addon" : ""}>
                      <td>
                        <p className="order-details-item-name">
                          {item.name} {item.variant && item.variant !== 'Regular' ? `(${item.variant})` : ''}
                        </p>
                      </td>
                      <td>{item.qty}</td>
                      <td>{formatCurrency(item.basePrice)}</td>
                      <td>{formatCurrency(item.basePrice * item.qty)}</td>
                    </tr>
                    {item.addOns && item.addOns.length > 0 && item.addOns.map((ao, idx) => (
                      <tr key={`${index}-ao-${idx}`} className="order-details-addon-row">
                        <td>
                          <p className="order-details-item-addon">
                            {ao.qty * item.qty}x {ao.name}
                          </p>
                        </td>
                        <td></td>
                        <td>{formatCurrency(ao.price)}</td>
                        <td>{formatCurrency(ao.price * ao.qty * item.qty)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          <hr className="order-details-divider" />

          <div className="order-details-summary">
            <div className="order-details-summary-row">
              <strong>Subtotal</strong>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountType && discountType !== 'None' && (
              <div className="order-details-summary-row">
                <strong>Discounts ({discountType})</strong>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="order-details-summary-row total">
              <strong>Total</strong>
              <span>{formatCurrency(total)}</span>
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
              <span>{formatCurrency(amountPaid)}</span>
            </div>
            <div className="order-details-payment-row">
              <strong>Change</strong>
              <span>{formatCurrency(change)}</span>
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
