import { useState } from "react";

import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderDateKey, getOrderReportPeriodDates } from "@/utils/orders/orderDates";
import { validateOrderFilterDates } from "@/utils/orders/validation/orderFilterValidation";

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
  recordedBy,
  setRecordedBy,
  recordedByOptions,
  handleResetFilters,
  isLoading = false,
}) => {
  const [draftFilters, setDraftFilters] = useState({
    fromDate,
    toDate,
    reportPeriod,
    paymentMethods,
    orderSources,
    recordedBy,
  });
  const [recordedBySearch, setRecordedBySearch] = useState("");
  const visibleRecordedByOptions = recordedByOptions.filter((option) => {
    return option.label.toLowerCase().includes(recordedBySearch.trim().toLowerCase());
  });
  const today = getOrderDateKey(new Date());
  const validation = validateOrderFilterDates(
    draftFilters.fromDate,
    draftFilters.toDate,
    today,
    draftFilters.reportPeriod === "Custom",
  );
  const dateError = validation.errors.dateRange;

  const handleApply = () => {
    if (!validation.isFormValid) return;
    setFromDate(draftFilters.fromDate);
    setToDate(draftFilters.toDate);
    setReportPeriod(draftFilters.reportPeriod);
    setPaymentMethods(draftFilters.paymentMethods);
    setOrderSources(draftFilters.orderSources);
    setRecordedBy(draftFilters.recordedBy);
  };

  const handleClear = () => {
    setRecordedBySearch("");
    setDraftFilters({
      fromDate: "",
      toDate: "",
      reportPeriod: "all",
      paymentMethods: [],
      orderSources: [],
      recordedBy: [],
    });

    handleResetFilters();
  };

  const handleReportPeriodChange = (nextPeriod) => {
    const dates = getOrderReportPeriodDates(nextPeriod);

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

  const sidebarSections = [
    {
      id: "date-and-cashier",
      label: "Date & Cashier",
      icon: "bi-calendar3",
      indicator: draftFilters.reportPeriod !== "all" || draftFilters.recordedBy.length > 0,
      content: (
        <div className="flex flex-col gap-[var(--app-space-4)]">
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
            maxDate={today}
            errorId={dateError ? "orders-filter-date-error" : undefined}
          />
          {dateError && (
            <p id="orders-filter-date-error" role="status" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]">
              {dateError}
            </p>
          )}
          <div className="flex flex-col gap-[var(--app-space-2)]">
            <p className="text-[length:var(--app-font-size-body-secondary)] font-normal text-[var(--app-color-text-subtle)]">
              Recorded by
            </p>
            <ToolbarSearchInput
              placeholder="Search names..."
              value={recordedBySearch}
              onValueChange={setRecordedBySearch}
            />
            <FilterOptionGroup
              id="orders-recorded-by"
              label="Recorded by"
              options={visibleRecordedByOptions}
              selectedValues={draftFilters.recordedBy}
              onSelectedValuesChange={(recordedBy) =>
                setDraftFilters((current) => ({ ...current, recordedBy }))
              }
              collapsible={false}
              showLabel={false}
            />
            {visibleRecordedByOptions.length === 0 && (
              <p role="status" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                No matching names.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "payment-method",
      label: "Payment Method",
      icon: "bi-credit-card",
      indicator: draftFilters.paymentMethods.length > 0,
      content: (
        <FilterOptionGroup
          id="payment-method"
          label="Payment Method"
          options={paymentMethodOptions}
          selectedValues={draftFilters.paymentMethods}
          onSelectedValuesChange={(paymentMethods) =>
            setDraftFilters((current) => ({ ...current, paymentMethods }))
          }
          collapsible={false}
        />
      ),
    },
    {
      id: "order-source",
      label: "Order Source",
      icon: "bi-diagram-3",
      indicator: draftFilters.orderSources.length > 0,
      content: (
        <FilterOptionGroup
          id="order-source"
          label="Order Source"
          options={orderSourceOptions}
          selectedValues={draftFilters.orderSources}
          onSelectedValuesChange={(orderSources) =>
            setDraftFilters((current) => ({ ...current, orderSources }))
          }
          collapsible={false}
        />
      ),
    },
  ];

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

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={handleApply}
        onClear={handleClear}
        applyDisabled={!validation.isFormValid}
      />
    </section>
  );
};

export default OrdersFilterBar;
