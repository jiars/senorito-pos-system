import { useState } from "react";

import FilterPopover from "@/components/filters/FilterPopover";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";

const InventoryValuationToolbar = ({
  searchTerm,
  selectedCategories,
  categories,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
  isLoading = false,
}) => {
  const [draftCategories, setDraftCategories] = useState(selectedCategories);
  const valuationPopoverMaxWidth = "18rem";
  const categoryOptions = categories.map((categoryName) => ({
    label: categoryName,
    value: categoryName,
  }));
  const sortOptions = [
    { label: "Highest Value", value: "Sort: Highest Value First" },
    { label: "Lowest Value", value: "Sort: Lowest Value First" },
    { label: "0 - Z", value: "Sort: 0-Z" },
    { label: "Z - 0", value: "Sort: Z-0" },
  ];

  const handleApply = () => {
    onCategoryChange(draftCategories);
  };

  const handleClear = () => {
    setDraftCategories([]);
    onReset();
  };

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]"
      >
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-32 rounded-[var(--app-radius-control)]" />
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search for item..."
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        onApply={handleApply}
        onClear={handleClear}
        maxWidth={valuationPopoverMaxWidth}
      >
        <FilterOptionGroup
          id="inventory-valuation-categories"
          label="Categories"
          options={categoryOptions}
          selectedValues={draftCategories}
          onSelectedValuesChange={setDraftCategories}
          collapsible={false}
        />
      </FilterPopover>

      <FilterPopover
        label="0 - Z"
        triggerIcon="bi-arrow-down-up"
        showFooter={false}
        maxWidth={"14rem"}
      >
        <FilterOptionGroup
          id="inventory-valuation-sort"
          label="Sort inventory"
          options={sortOptions}
          selectedValues={[sort]}
          onSelectedValuesChange={(values) => {
            const selectedSort = values[values.length - 1];

            if (selectedSort) onSortChange(selectedSort);
          }}
          collapsible={false}
          showLabel={false}
        />
      </FilterPopover>
    </section>
  );
};

export default InventoryValuationToolbar;
