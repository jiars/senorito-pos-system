import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const OrdersTable = ({
  isLoading,
  error,
  paginatedOrders,
  getSourceClass,
  handleViewOrder
}) => {
  return (
    <div className="orders-table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>ORDER #</th>
            <th>DATE & TIME</th>
            <th>CASHIER</th>
            <th>TOTAL</th>
            <th>PAYMENT METHOD</th>
            <th>SOURCE</th>
            <th style={{ textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="bi bi-arrow-clockwise" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
                Loading Orders...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                {error}
              </td>
            </tr>
          ) : paginatedOrders.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                No orders found matching your criteria.
              </td>
            </tr>
          ) : (
            paginatedOrders.map((order) => {
              const cashierName = order.cashier ? `${order.cashier.first_name} ${order.cashier.last_name}` : 'Owner / System';
              const formattedDate = new Date(order.order_datetime).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{formattedDate}</td>
                  <td>{cashierName}</td>
                  <td><strong>{formatCurrency(order.total)}</strong></td>
                  <td>{order.payment_method}</td>
                  <td>
                    <span className={`orders-chip ${getSourceClass(order.order_source)}`}>
                      {order.order_source}
                    </span>
                  </td>
                  <td>
                    <div className="orders-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="orders-action-btn orders-action-btn--view"
                        title="View Order"
                        onClick={() => handleViewOrder(order)}
                      >
                        <i className="bi bi-card-list"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
