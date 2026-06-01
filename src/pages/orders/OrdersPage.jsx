import React, { useState } from 'react';
import ViewOrderDetails from './View Order Details/ViewOrderDetails';
import './ordersPage.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */
const dummyOrders = [
  { id: 'SC-260315-01', date: '2026-03-15 11:14:02', cashier: 'Jane Velarde Mayorga', total: 258.00, paymentMethod: 'Cash', source: 'In-Store' },
  { id: 'SC-260314-20', date: '2026-03-14 18:13:50', cashier: 'Kimberly Legaspi', total: 350.00, paymentMethod: 'External', source: 'Foodpanda' },
  { id: 'SC-260314-19', date: '2026-03-14 17:45:08', cashier: 'Kimberly Legaspi', total: 870.00, paymentMethod: 'External', source: 'Grab' },
  { id: 'SC-260314-18', date: '2026-03-14 17:12:01', cashier: 'Kimberly Legaspi', total: 159.00, paymentMethod: 'GCash', source: 'In-Store' },
  { id: 'SC-260314-17', date: '2026-03-14 16:30:30', cashier: 'Kimberly Legaspi', total: 320.00, paymentMethod: 'Cash', source: 'In-Store' },
  { id: 'SC-260314-16', date: '2026-03-14 16:14:05', cashier: 'Kimberly Legaspi', total: 1050.00, paymentMethod: 'Cash', source: 'In-Store' },
  { id: 'SC-260314-15', date: '2026-03-14 16:03:08', cashier: 'Kimberly Legaspi', total: 780.00, paymentMethod: 'External', source: 'Grab' },
];

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [orderSource, setOrderSource] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setPaymentMethod('All');
    setOrderSource('All');
  };

  const getSourceClass = (source) => {
    switch (source) {
      case 'In-Store': return 'orders-chip--instore';
      case 'Foodpanda': return 'orders-chip--foodpanda';
      case 'Grab': return 'orders-chip--grab';
      default: return '';
    }
  };

  const handleViewOrder = (id) => {
    const order = dummyOrders.find(o => o.id === id);
    if (order) {

      const detailedOrder = {
        id: order.id,
        date: new Date(order.date),
        cashier: order.cashier,
        orderSource: order.source,
        paymentMethod: order.paymentMethod,
        discountType: 'None',
        subtotal: order.total,
        discountAmount: 0,
        total: order.total,
        amountPaid: order.total,
        change: 0,
        items: [
          { name: 'Spanish Latte', variant: 'Medium', qty: 2, price: 120, addOns: [{ name: 'Oat Milk', qty: 2 }] },
          { name: 'Matcha', variant: 'Regular', qty: 1, price: 110 }
        ]
      };
      setSelectedOrder(detailedOrder);
    }
  };

  return (
    <div className="orders-page">
      {/* ───── Page Header ───── */}
      <div className="orders-page-header">
        <div className="layout-page-heading">
          <h2>Order History</h2>
          <p>View and monitor past transactions.</p>
        </div>
      </div>

      {/* ───── Main Panel (Filters + Table) ───── */}
      <div className="orders-panel">
        {/* Filters Bar */}
        <div className="orders-filter-bar">
          <div className="orders-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search order #, date, cashier, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="orders-date-group">
            <span className="orders-date-label">From</span>
            <input
              type="date"
              className="orders-filter-date"
              title="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="orders-date-group">
            <span className="orders-date-label">To</span>
            <input
              type="date"
              className="orders-filter-date"
              title="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <select
            className="orders-filter-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="All">All Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
            <option value="External">External</option>
          </select>

          <select
            className="orders-filter-select"
            value={orderSource}
            onChange={(e) => setOrderSource(e.target.value)}
          >
            <option value="All">All Order Source</option>
            <option value="In-Store">In-Store</option>
            <option value="Foodpanda">Foodpanda</option>
            <option value="Grab">Grab</option>
          </select>

          <button className="orders-reset-btn" onClick={handleResetFilters}>
            Reset
          </button>
        </div>

        {/* Orders Table */}
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
              {dummyOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.date}</td>
                  <td>{order.cashier}</td>
                  <td>₱{order.total.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span className={`orders-chip ${getSourceClass(order.source)}`}>
                      {order.source}
                    </span>
                  </td>
                  <td>
                    <div className="orders-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="orders-action-btn orders-action-btn--view"
                        title="View Order"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <i className="bi bi-card-list"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ViewOrderDetails
        orderDetails={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
