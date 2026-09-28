import { useState } from "react";

import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions = [
  { label: "Available", value: "Available" },
  { label: "Unavailable", value: "Unavailable" },
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
      statuses: [],
    };

    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

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
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
        maxWidth="18rem"
        maxHeight="min(30rem, calc(100svh - 8rem))"
      >
        <FilterOptionGroup
          id={`${idPrefix}-categories`}
          label="Categories"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(nextCategories) =>
            setDraftFilters((current) => ({
              ...current,
              categories: nextCategories,
            }))
          }
          defaultOpen
        />

        <FilterOptionGroup
          id={`${idPrefix}-statuses`}
          label="POS Status"
          options={statusOptions}
          selectedValues={draftFilters.statuses}
          onSelectedValuesChange={(nextStatuses) =>
            setDraftFilters((current) => ({
              ...current,
              statuses: nextStatuses,
            }))
          }
          defaultOpen
        />
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
