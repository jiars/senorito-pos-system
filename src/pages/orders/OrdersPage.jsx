import React, { useState } from 'react';
import ViewOrderDetails from './View Order Details/ViewOrderDetails';
import OrdersFilterBar from './components/OrdersFilterBar';
import OrdersTable from './components/OrdersTable';
import OrdersPagination from './components/OrdersPagination';
import './ordersPage.css';

import { useOrderManagement } from '../../hooks/useOrderManagement';
import { formatCurrency } from '../../utils/currencyFormatters';

const OrdersPage = () => {
  const {
    orders,
    isLoading,
    error,
  } = useOrderManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [orderSource, setOrderSource] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
      subtotal: Number(order.subtotal) || 0,
      discountAmount: Number(order.discount_amount) || 0,
      total: Number(order.total) || 0,
      amountPaid: Number(order.amount_paid) || 0,
      change: Number(order.change_amount) || 0,
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
        <OrdersFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          orderSource={orderSource}
          setOrderSource={setOrderSource}
          handleResetFilters={handleResetFilters}
        />

        <OrdersTable
          isLoading={isLoading}
          error={error}
          paginatedOrders={paginatedOrders}
          getSourceClass={getSourceClass}
          handleViewOrder={handleViewOrder}
        />

        <OrdersPagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      <ViewOrderDetails
        orderDetails={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
