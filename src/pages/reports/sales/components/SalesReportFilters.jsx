import { useEffect, useState } from "react";

import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";

const orderSourceOptions = [
  { label: "In-Store", value: "In-Store" },
  { label: "Food Panda", value: "FoodPanda" },
  { label: "Grab", value: "Grab" },
];

const reportPeriodOptions = [
  { label: "All Time", value: "All Time" },
  { label: "This Day", value: "Today" },
  { label: "This Week", value: "This Week" },
  { label: "This Month", value: "This Month" },
];

const toInputDateValue = (date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getPresetDates = (reportPeriod) => {
  const today = new Date();
  const todayValue = toInputDateValue(today);

  if (reportPeriod === "All Time") {
    return { fromDate: "", toDate: "" };
  }

  if (reportPeriod === "Today") {
    return { fromDate: todayValue, toDate: todayValue };
  }

  if (reportPeriod === "This Week") {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return {
      fromDate: toInputDateValue(startOfWeek),
      toDate: todayValue,
    };
  }

  return {
    fromDate: toInputDateValue(
      new Date(today.getFullYear(), today.getMonth(), 1),
    ),
    toDate: todayValue,
  };
};

const SalesReportFilters = ({
  datePreset,
  fromDate,
  toDate,
  filterCategories,
  filterSources,
  categories,
  onApplyFilters,
  onClearFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState({
    datePreset,
    fromDate,
    toDate,
    categories: filterCategories,
    orderSources: filterSources,
  });

  useEffect(() => {
    setDraftFilters({
      datePreset,
      fromDate,
      toDate,
      categories: filterCategories,
      orderSources: filterSources,
    });
  }, [datePreset, fromDate, toDate, filterCategories, filterSources]);

  const categoryOptions = categories.map((category) => {
    return {
      label: category.category_name,
      value: category.category_name,
    };
  });

  const handleReportPeriodChange = (nextPeriod) => {
    const nextDates = getPresetDates(nextPeriod);

    setDraftFilters((currentFilters) => {
      return {
        ...currentFilters,
        datePreset: nextPeriod,
        fromDate: nextDates.fromDate,
        toDate: nextDates.toDate,
      };
    });
  };

  const handleManualDateRangeChange = (nextFromDate, nextToDate) => {
    setDraftFilters((currentFilters) => {
      return {
        ...currentFilters,
        fromDate: nextFromDate,
        toDate: nextToDate,
        datePreset: "Custom",
      };
    });
  };

  const handleClear = () => {
    setDraftFilters({
      datePreset: "All Time",
      fromDate: "",
      toDate: "",
      categories: [],
      orderSources: [],
    });

    onClearFilters();
  };

  const sidebarSections = [
    {
      id: "date-range",
      label: "Date Range",
      icon: "bi-calendar3",
      indicator: draftFilters.datePreset !== "All Time",
      content: (
        <div className="flex flex-col gap-[var(--app-space-4)]">
          <FilterSelectField
            id="sales-filter-report-period"
            label="Report Period"
            value={draftFilters.datePreset}
            options={reportPeriodOptions}
            onValueChange={handleReportPeriodChange}
          />

          <FilterDateRange
            id="sales-filter-date-range"
            fromDate={draftFilters.fromDate}
            toDate={draftFilters.toDate}
            onRangeChange={handleManualDateRangeChange}
          />
        </div>
      ),
    },
    {
      id: "categories",
      label: "Categories",
      icon: "bi-grid-3x3-gap",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id="sales-filter-categories"
          label="Categories"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(categories) => {
            setDraftFilters((currentFilters) => {
              return {
                ...currentFilters,
                categories,
              };
            });
          }}
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
          id="sales-filter-order-source"
          label="Order Source"
          options={orderSourceOptions}
          selectedValues={draftFilters.orderSources}
          onSelectedValuesChange={(orderSources) => {
            setDraftFilters((currentFilters) => {
              return {
                ...currentFilters,
                orderSources,
              };
            });
          }}
          collapsible={false}
        />
      ),
    },
  ];

  return (
    <FilterPopover
      sidebarSections={sidebarSections}
      sidebarPanelClassName="!w-[28rem]"
      onApply={() => onApplyFilters(draftFilters)}
      onClear={handleClear}
    />
  );
};

export default SalesReportFilters;
