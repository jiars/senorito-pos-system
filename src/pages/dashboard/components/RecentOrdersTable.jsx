import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const RecentOrdersTable = ({ recentOrders, isLoadingBottom }) => {
  return (
    <div className="dashboard-panel dashboard-orders-panel">
      <div className="dashboard-panel-header">
        <h3 className="dashboard-panel-title">
          <i className="bi bi-clock-history"></i>
          Recent Orders
        </h3>
      </div>

      <div className="dashboard-orders-table-wrapper">
        <table className="dashboard-orders-table">
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Cashier</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingBottom ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Loading recent orders...</td></tr>
            ) : recentOrders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No recent orders found.</td></tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.orderNo}>
                  <td className="dashboard-orders-orderno">{order.orderNo}</td>
                  <td>{order.cashier}</td>
                  <td className="dashboard-orders-total">
                    {formatCurrency(order.total)}
                  </td>
                  <td>{order.payment}</td>
                  <td>
                    <span className="dashboard-chip dashboard-chip--completed">
                      {order.status}
                    </span>
                  </td>
                  <td className="dashboard-orders-date">{order.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
