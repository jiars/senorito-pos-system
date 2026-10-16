import { useState } from "react";

import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions = [
  { label: "Available", value: "Available" },
  { label: "Unavailable", value: "Unavailable" },
];

const conditionOptions = [
  { label: "Available / Normal", value: "Available" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "Out of Stock", value: "Out of Stock" },
  { label: "Insufficient Stock", value: "Insufficient Stock" },
  { label: "Incomplete Recipe", value: "Incomplete" },
  { label: "On Hold", value: "On Hold" },
  { label: "Disabled for Sale", value: "Unavailable" },
];

const sortOptions = [
  { label: "0 - Z", value: "0-z" },
  { label: "Z - 0", value: "z-0" },
];

const MenuCatalogToolbar = ({
  idPrefix = "menu-catalog",
  searchPlaceholder = "Search items...",
  searchTerm,
  categories = [],
  filters,
  showStatusConditions = false,
  sort,
  isLoading,
  onSearchChange,
  onApplyFilters,
  onSortChange,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);

  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: category.category_name,
  }));

  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ?? "0 - Z";

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
    };
    if (showStatusConditions) clearedFilters.conditions = [];
    else clearedFilters.statuses = [];

    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: `${idPrefix}-category-section`,
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id={`${idPrefix}-categories`}
          label="Categories"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(categories) =>
            setDraftFilters((current) => ({ ...current, categories }))
          }
          collapsible={false}
        />
      ),
    },
  ];

  if (showStatusConditions) {
    sidebarSections.push({
      id: `${idPrefix}-condition-section`,
      label: "Status Condition",
      icon: "bi-circle-half",
      indicator: draftFilters.conditions.length > 0,
      content: (
        <FilterOptionGroup
          id={`${idPrefix}-conditions`}
          label="Status Condition"
          options={conditionOptions}
          selectedValues={draftFilters.conditions}
          onSelectedValuesChange={(conditions) =>
            setDraftFilters((current) => ({ ...current, conditions }))
          }
          collapsible={false}
        />
      ),
    });
  } else {
    // Archive records retain their saved POS status rather than live stock conditions.
    sidebarSections.push({
      id: `${idPrefix}-status-section`,
      label: "POS Status",
      icon: "bi-circle-half",
      indicator: draftFilters.statuses.length > 0,
      content: (
        <FilterOptionGroup
          id={`${idPrefix}-statuses`}
          label="POS Status"
          options={statusOptions}
          selectedValues={draftFilters.statuses}
          onSelectedValuesChange={(statuses) =>
            setDraftFilters((current) => ({ ...current, statuses }))
          }
          collapsible={false}
        />
      ),
    });
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-wrap justify-end gap-[var(--app-space-2)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[20rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-24 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[20rem]">
        <ToolbarSearchInput
          placeholder={searchPlaceholder}
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
        maxHeight="min(30rem, calc(100svh - 8rem))"
      />

      <FilterPopover
        label={sortLabel}
        triggerIcon="bi-arrow-down-up"
        showFooter={false}
        maxWidth="12rem"
        maxHeight="min(20rem, calc(100svh - 8rem))"
      >
        <FilterOptionGroup
          id={`${idPrefix}-sort`}
          label="Sort items"
          options={sortOptions}
          selectedValues={[sort]}
          onSelectedValuesChange={(values) => {
            const nextSort = values.at(-1);

            if (nextSort) {
              onSortChange(nextSort);
            }
          }}
          selectionMode="single"
          collapsible={false}
          showLabel={false}
        />
      </FilterPopover>
    </div>
  );
};

export default MenuCatalogToolbar;
