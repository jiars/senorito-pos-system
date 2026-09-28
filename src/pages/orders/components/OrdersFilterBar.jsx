import { useState } from "react";

import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

const paymentMethodOptions = [
  { label: "Cash", value: "Cash" },
  { label: "G-Cash", value: "GCash" },
  { label: "External", value: "External" },
];

const orderSourceOptions = [
  { label: "In-Store", value: "In-Store" },
  { label: "Food Panda", value: "Foodpanda" },
  { label: "Grab", value: "Grab" },
];

const reportPeriodOptions = [
  { label: "All Time", value: "all" },
  { label: "This Day", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const toInputDateValue = (date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getReportPeriodDates = (period) => {
  const today = new Date();
  const toDate = toInputDateValue(today);

  if (period === "all") {
    return { fromDate: "", toDate: "" };
  }

  if (period === "today") {
    return { fromDate: toDate, toDate };
  }

  if (period === "week") {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return {
      fromDate: toInputDateValue(startOfWeek),
      toDate,
    };
  }

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    fromDate: toInputDateValue(startOfMonth),
    toDate,
  };
};

const OrdersFilterBar = ({
  searchTerm,
  setSearchTerm,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  reportPeriod,
  setReportPeriod,
  paymentMethods,
  setPaymentMethods,
  orderSources,
  setOrderSources,
  handleResetFilters,
  isLoading = false,
}) => {
  const [draftFilters, setDraftFilters] = useState({
    fromDate,
    toDate,
    reportPeriod,
    paymentMethods,
    orderSources,
  });

  const handleApply = () => {
    setFromDate(draftFilters.fromDate);
    setToDate(draftFilters.toDate);
    setReportPeriod(draftFilters.reportPeriod);
    setPaymentMethods(draftFilters.paymentMethods);
    setOrderSources(draftFilters.orderSources);
  };

  const handleClear = () => {
    setDraftFilters({
      fromDate: "",
      toDate: "",
      reportPeriod: "all",
      paymentMethods: [],
      orderSources: [],
    });

    handleResetFilters();
  };

  const handleReportPeriodChange = (nextPeriod) => {
    const dates = getReportPeriodDates(nextPeriod);

    setDraftFilters((current) => ({
      ...current,
      ...dates,
      reportPeriod: nextPeriod,
    }));
  };

  const handleManualDateRangeChange = (fromDateValue, toDateValue) => {
    setDraftFilters((current) => ({
      ...current,
      fromDate: fromDateValue,
      toDate: toDateValue,
      reportPeriod: "Custom",
    }));
  };

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]"
      >
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[18rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search order #, date, cashier, source..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      </div>

      <FilterPopover onApply={handleApply} onClear={handleClear}>
        <FilterSelectField
          id="orders-filter-report-period"
          label="Report Period"
          value={draftFilters.reportPeriod}
          options={reportPeriodOptions}
          onValueChange={handleReportPeriodChange}
        />

        <FilterDateRange
          id="orders-filter-date-range"
          fromDate={draftFilters.fromDate}
          toDate={draftFilters.toDate}
          onRangeChange={handleManualDateRangeChange}
        />

        <FilterOptionGroup
          id="payment-method"
          label="Payment Method"
          options={paymentMethodOptions}
          selectedValues={draftFilters.paymentMethods}
          onSelectedValuesChange={(paymentMethods) =>
            setDraftFilters((current) => ({
              ...current,
              paymentMethods,
            }))
          }
        />

        <FilterOptionGroup
          id="order-source"
          label="Order Source"
          options={orderSourceOptions}
          selectedValues={draftFilters.orderSources}
          onSelectedValuesChange={(orderSources) =>
            setDraftFilters((current) => ({
              ...current,
              orderSources,
            }))
          }
          defaultOpen
        />
      </FilterPopover>
    </section>
  );
};

export default OrdersFilterBar;
