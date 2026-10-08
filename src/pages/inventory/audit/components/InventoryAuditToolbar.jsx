import { useState } from "react";

import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_FILTERS = {
  fromDate: "",
  toDate: "",
  reportPeriod: "all",
  recordedBy: [],
  reasons: [],
  sources: [],
};

const reportPeriodOptions = [
  { label: "All Time", value: "all" },
  { label: "This Day", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const recordedByOptions = [
  { label: "System Admin", value: "System Admin" },
  { label: "Inventory Manager", value: "Inventory Manager" },
];

const reasonOptions = [
  { label: "Expired", value: "Expired" },
  { label: "Spoiled", value: "Spoiled" },
  { label: "Damaged", value: "Damaged" },
  { label: "Spillage", value: "Spillage" },
  { label: "Wrong Preparation", value: "Wrong Preparation" },
  { label: "Burnt / Overcooked", value: "Burnt / Overcooked" },
  { label: "Contaminated", value: "Contaminated" },
];

const sourceOptions = [
  { label: "POS", value: "POS" },
  { label: "Stock Log Modal", value: "Stock Log Modal" },
  { label: "Expense Tracking", value: "Expense Tracking" },
  { label: "Purchase Order", value: "Purchase Order" },
  { label: "System", value: "System" },
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

  return {
    fromDate: toInputDateValue(
      new Date(today.getFullYear(), today.getMonth(), 1),
    ),
    toDate,
  };
};

const InventoryAuditToolbar = ({
  filters,
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
    reasons: filters.reasons,
    sources: filters.sources,
  });

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      ...draftFilters,
    });
  };

  const handleClear = () => {
    setDraftFilters(EMPTY_FILTERS);
    onReset();
  };

  const handleReportPeriodChange = (reportPeriod) => {
    setDraftFilters((current) => ({
      ...current,
      ...getReportPeriodDates(reportPeriod),
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
          />

          <FilterOptionGroup
            id="audit-recorded-by"
            label="Recorded by"
            options={recordedByOptions}
            selectedValues={draftFilters.recordedBy}
            onSelectedValuesChange={(recordedBy) =>
              setDraftFilters((current) => ({ ...current, recordedBy }))
            }
            collapsible={false}
          />
        </div>
      ),
    },
    {
      id: "reason",
      label: "Reason",
      icon: "bi-card-text",
      indicator: draftFilters.reasons.length > 0,
      content: (
        <FilterOptionGroup
          id="audit-reason"
          label="Reason"
          options={reasonOptions}
          selectedValues={draftFilters.reasons}
          onSelectedValuesChange={(reasons) =>
            setDraftFilters((current) => ({ ...current, reasons }))
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
          placeholder="Search item, reason, source..."
          value={filters.searchTerm}
          onValueChange={(value) => onFilterChange("searchTerm", value)}
        />
      </div>

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={handleApply}
        onClear={handleClear}
      />
    </section>
  );
};

export default InventoryAuditToolbar;
