import { useState } from "react";

import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

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
  { label: "A - Z", value: "0-z" },
  { label: "Z - A", value: "z-0" },
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
    sortOptions.find((option) => option.value === sort)?.label ?? "A - Z";

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
    };
    if (showStatusConditions) clearedFilters.conditions = [];

    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const categoryFilter = (
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
  );

  const sidebarSections = [
    {
      id: `${idPrefix}-category-section`,
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: categoryFilter,
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
        sidebarSections={showStatusConditions ? sidebarSections : []}
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
        maxHeight="min(30rem, calc(100svh - 8rem))"
      >
        {!showStatusConditions && categoryFilter}
      </FilterPopover>

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
