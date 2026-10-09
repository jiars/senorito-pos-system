import { useState } from "react";

import PageLayout from "../../components/layout/PageLayout";
import { useOrderManagement } from "../../hooks/useOrderManagement";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { getOrderDateKey } from "@/utils/orders/orderDates";

import ViewOrderDetails from "./View Order Details/ViewOrderDetails";
import OrdersFilterBar from "./components/OrdersFilterBar";
import OrdersPagination from "./components/OrdersPagination";
import OrdersTable from "./components/OrdersTable";
import "./ordersPage.css";

const OrdersPage = () => {
  const { orders, isLoading, error } = useOrderManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orderSources, setOrderSources] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleResetFilters = () => {
    setSearchTerm("");
    setReportPeriod("all");
    setFromDate("");
    setToDate("");
    setPaymentMethods([]);
    setOrderSources([]);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleReportPeriodChange = (value) => {
    setReportPeriod(value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const handlePaymentMethodsChange = (values) => {
    setPaymentMethods(values);
    setCurrentPage(1);
  };

  const handleOrderSourcesChange = (values) => {
    setOrderSources(values);
    setCurrentPage(1);
  };

  const handleViewOrder = (order) => {
    // Keep the existing order-details modal contract unchanged.
    setSelectedOrder({
      id: order.id,
      order_number: order.order_number,
      date: new Date(order.order_datetime),
      cashier: order.cashier
        ? `${order.cashier.first_name} ${order.cashier.last_name}`
        : "Owner / System",
      orderSource: order.order_source,
      paymentMethod: order.payment_method,
      discountType: order.discount_type || "None",
      subtotal: Number(order.subtotal) || 0,
      discountAmount: Number(order.discount_amount) || 0,
      total: Number(order.total) || 0,
      amountPaid: Number(order.amount_paid) || 0,
      change: Number(order.change_amount) || 0,
    });
  };

  const filteredOrders = orders.filter((order) => {
    const formattedDateForSearch = new Date(
      order.order_datetime,
    ).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const searchString =
      `${order.order_number} ${order.cashier?.first_name} ${order.cashier?.last_name} ${order.order_source} ${order.payment_method} ${formattedDateForSearch} ${formatCurrency(order.total)}`.toLowerCase();

    if (searchTerm && !searchString.includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (fromDate || toDate) {
      const orderDate = getOrderDateKey(order.order_datetime);
      if (
        !orderDate ||
        (fromDate && orderDate < fromDate) ||
        (toDate && orderDate > toDate)
      ) {
        return false;
      }
    }

    if (
      paymentMethods.length > 0 &&
      !paymentMethods.includes(order.payment_method)
    ) {
      return false;
    }

    if (orderSources.length > 0 && !orderSources.includes(order.order_source)) {
      return false;
    }

    return true;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <PageLayout
      title="Order History"
      subtitle="View and monitor past transactions."
      className="orders-page-shell flex flex-col gap-4"
    >
      <div className="orders-page-layout orders-page">
        <section className="orders-page-toolbar">
          <OrdersFilterBar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
            reportPeriod={reportPeriod}
            setReportPeriod={handleReportPeriodChange}
            fromDate={fromDate}
            setFromDate={handleFromDateChange}
            toDate={toDate}
            setToDate={handleToDateChange}
            paymentMethods={paymentMethods}
            setPaymentMethods={handlePaymentMethodsChange}
            orderSources={orderSources}
            setOrderSources={handleOrderSourcesChange}
            handleResetFilters={handleResetFilters}
            isLoading={isLoading}
          />
        </section>

        <section className="orders-page-table">
          <OrdersTable
            isLoading={isLoading}
            error={error}
            paginatedOrders={paginatedOrders}
            handleViewOrder={handleViewOrder}
          />
        </section>

        <section className="orders-page-pagination">
          <OrdersPagination
            totalOrders={filteredOrders.length}
            pageSize={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setItemsPerPage}
            isLoading={isLoading}
          />
        </section>
      </div>

      <ViewOrderDetails
        orderDetails={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </PageLayout>
  );
};

export default OrdersPage;
