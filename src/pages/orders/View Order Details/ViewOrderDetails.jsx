import React, { useState, useEffect } from 'react';
import './ViewOrderDetails.css';
import { fetchOrderDetails } from '../../../services/pos/ordersService';
import { printReceiptBluetooth } from '../../../services/hardware/bluetoothPrinterService';

const ViewOrderDetails = ({ orderDetails, onClose }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderDetails && orderDetails.id) {
      loadItems(orderDetails.id);
    }
  }, [orderDetails]);

  const loadItems = async (orderId) => {
    try {
      setIsLoading(true);
      const data = await fetchOrderDetails(orderId);

      // Transform data to match UI
      const formattedItems = data.map(item => {
        let addonSum = 0;
        const addOns = item.addons?.map(ao => {
          const aoQty = ao.quantity;
          const aoPrice = Number(ao.price) || 0;
          addonSum += (aoPrice * aoQty);
          return {
            name: ao.addon?.addon_name || 'Unknown Add-on',
            qty: aoQty,
            price: aoPrice
          };
        }) || [];

        const combinedUnitPrice = Number(item.unit_price) || 0;
        const basePrice = combinedUnitPrice - addonSum;

        return {
          name: item.menu_item?.item_name || 'Unknown Item',
          variant: item.variant?.variant_name || 'Regular',
          qty: item.quantity,
          basePrice: basePrice,
          price: combinedUnitPrice,
          subtotal: Number(item.subtotal) || 0,
          addOns: addOns
        };
      });
      setItems(formattedItems);
    } catch (error) {
      console.error("Failed to fetch order items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!orderDetails) return null;

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

  const handlePrint = async () => {
    try {
      //await printReceiptBluetooth(orderDetails);
    } catch (error) {
      alert(error.message || "Failed to print via Bluetooth.");
    }
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
              {isLoading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                    <i className="bi bi-arrow-clockwise" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
                    Loading Items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
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
                      <td>₱{item.basePrice.toFixed(2)}</td>
                      <td>₱{(item.basePrice * item.qty).toFixed(2)}</td>
                    </tr>
                    {item.addOns && item.addOns.length > 0 && item.addOns.map((ao, idx) => (
                      <tr key={`${index}-ao-${idx}`} className="order-details-addon-row">
                        <td>
                          <p className="order-details-item-addon">
                            {ao.qty * item.qty}x {ao.name}
                          </p>
                        </td>
                        <td></td>
                        <td>₱{Number(ao.price).toFixed(2)}</td>
                        <td>₱{(ao.price * ao.qty * item.qty).toFixed(2)}</td>
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
