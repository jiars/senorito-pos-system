import React, { useState } from 'react';
import ViewOrderDetails from './View Order Details/ViewOrderDetails';
import './ordersPage.css';

import { fetchOrderHistory, fetchOrderDetails } from '../../services/pos/ordersService';
import { formatCurrency } from '../../utils/currencyFormatters';

// We no longer use dummyOrders, we fetch live data from Supabase.

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [orderSource, setOrderSource] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrderHistory();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleViewOrder = (order) => {
    // Pass the base order details to the modal. 
    // Step 3 will handle fetching the actual items inside the modal.
    setSelectedOrder({
      id: order.id,
      order_number: order.order_number,
      date: new Date(order.order_datetime),
      cashier: order.cashier ? `${order.cashier.first_name} ${order.cashier.last_name}` : 'Owner / System',
      orderSource: order.order_source,
      paymentMethod: order.payment_method,
      discountType: order.discount_type || 'None',
      subtotal: order.subtotal,
      discountAmount: order.discount_amount || 0,
      total: order.total,
      amountPaid: order.amount_paid || 0,
      change: order.change_amount || 0,
      items: [] // Will be populated in Step 3
    });
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // Text search
    const formattedDateForSearch = new Date(order.order_datetime).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const searchString = `${order.order_number} ${order.cashier?.first_name} ${order.cashier?.last_name} ${order.order_source} ${order.payment_method} ${formattedDateForSearch} ${formatCurrency(order.total)}`.toLowerCase();
    if (searchTerm && !searchString.includes(searchTerm.toLowerCase())) return false;

    // Date filtering
    if (fromDate) {
      const orderDate = new Date(order.order_datetime).toISOString().split('T')[0];
      if (orderDate < fromDate) return false;
    }
    if (toDate) {
      const orderDate = new Date(order.order_datetime).toISOString().split('T')[0];
      if (orderDate > toDate) return false;
    }

    // Dropdowns
    if (paymentMethod !== 'All' && order.payment_method !== paymentMethod) return false;
    if (orderSource !== 'All' && order.order_source !== orderSource) return false;

    return true;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, paymentMethod, orderSource]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="bi bi-arrow-clockwise" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
                    Loading Orders...
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="orders-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="orders-pagination-btns" style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="orders-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="orders-page-btn active" style={{ backgroundColor: '#E9ECEF', fontWeight: 'bold' }}>
                {currentPage}
              </button>
              <button
                className="orders-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <ViewOrderDetails
        orderDetails={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
