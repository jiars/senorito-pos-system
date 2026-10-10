import { useState } from "react";

import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { getBusinessDateKey, getBusinessPeriodDates } from "@/utils/shared/formatters/businessDates";
import { validateAuditFilterDates } from "@/utils/inventory/validation/auditFilterValidation";

const EMPTY_FILTERS = {
  fromDate: "",
  toDate: "",
  reportPeriod: "all",
  recordedBy: [],
  actions: [],
  sources: [],
};

const reportPeriodOptions = [
  { label: "All Time", value: "all" },
  { label: "This Day", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const actionOptions = [
  { label: "Purchase", value: "Purchase" },
  { label: "POS Sale", value: "POS Sale" },
  { label: "Wastage", value: "Wastage" },
  { label: "Manual Adjustment", value: "Manual Adjustment" },
  { label: "Expired", value: "Expired" },
];

const sourceOptions = [
  { label: "POS Checkout", value: "POS Checkout" },
  { label: "Add Item Modal", value: "Add Item Modal" },
  { label: "Stock Log Modal", value: "Stock Log Modal" },
  { label: "Expense Tracking", value: "Expense Tracking" },
  { label: "Purchase Order", value: "Purchase Order" },
  { label: "System", value: "System" },
];

const InventoryAuditToolbar = ({
  filters,
  recordedByOptions,
  onFilterChange,
  onApplyFilters,
  onReset,
  isLoading = false,
}) => {
  const [draftFilters, setDraftFilters] = useState({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    reportPeriod: filters.reportPeriod,
    recordedBy: filters.recordedBy,
    actions: filters.actions,
    sources: filters.sources,
  });
  const [recordedBySearch, setRecordedBySearch] = useState("");
  const visibleRecordedByOptions = recordedByOptions.filter((option) => {
    return option.label.toLowerCase().includes(recordedBySearch.trim().toLowerCase());
  });

  const today = getBusinessDateKey(new Date());
  const validation = validateAuditFilterDates(
    draftFilters.fromDate,
    draftFilters.toDate,
    today,
    draftFilters.reportPeriod === "Custom",
  );
  const dateError = validation.errors.dateRange;

  const handleApply = () => {
    if (!validation.isFormValid) return;
    onApplyFilters({
      ...filters,
      ...draftFilters,
    });
  };

  const handleClear = () => {
    setRecordedBySearch("");
    setDraftFilters(EMPTY_FILTERS);
    onReset();
  };

  const handleReportPeriodChange = (reportPeriod) => {
    const nextDates = getBusinessPeriodDates(reportPeriod);
    setDraftFilters((current) => ({
      ...current,
      ...nextDates,
      reportPeriod,
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
      id: "date-and-staff",
      label: "Date & Staff",
      icon: "bi-calendar3",
      indicator:
        draftFilters.reportPeriod !== "all" ||
        draftFilters.recordedBy.length > 0,
      content: (
        <div className="flex flex-col gap-[var(--app-space-4)]">
          <FilterSelectField
            id="audit-filter-report-period"
            label="Date Recorded"
            value={draftFilters.reportPeriod}
            options={reportPeriodOptions}
            onValueChange={handleReportPeriodChange}
          />

          <FilterDateRange
            id="audit-filter-date-range"
            fromDate={draftFilters.fromDate}
            toDate={draftFilters.toDate}
            onRangeChange={handleManualDateRangeChange}
            maxDate={today}
            errorId={dateError ? "audit-filter-date-error" : undefined}
          />
          {dateError && (
            <p id="audit-filter-date-error" role="status" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]">
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
              id="audit-recorded-by"
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
      id: "action",
      label: "Action",
      icon: "bi-card-text",
      indicator: draftFilters.actions.length > 0,
      content: (
        <FilterOptionGroup
          id="audit-action"
          label="Action"
          options={actionOptions}
          selectedValues={draftFilters.actions}
          onSelectedValuesChange={(actions) =>
            setDraftFilters((current) => ({ ...current, actions }))
          }
          collapsible={false}
        />
      ),
    },
    {
      id: "source",
      label: "Sources",
      icon: "bi-box-arrow-in-down",
      indicator: draftFilters.sources.length > 0,
      content: (
        <FilterOptionGroup
          id="audit-source"
          label="Sources"
          options={sourceOptions}
          selectedValues={draftFilters.sources}
          onSelectedValuesChange={(sources) =>
            setDraftFilters((current) => ({ ...current, sources }))
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
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search item, action, reason, source..."
          value={filters.searchTerm}
          onValueChange={(value) => onFilterChange("searchTerm", value)}
        />
      </div>

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={handleApply}
        applyDisabled={!validation.isFormValid}
        onClear={handleClear}
      />
    </section>
  );
};

export default InventoryAuditToolbar;
