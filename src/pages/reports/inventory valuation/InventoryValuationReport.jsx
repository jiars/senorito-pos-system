import { useMemo, useState } from "react";
import { useInventoryValuation } from "../../../hooks/useInventoryValuation";

import {
  calculateInventoryValuation,
  createValuationCategorySummary,
  exportInventoryValuation,
  filterInventoryValuationItems,
} from "../../../utils/inventory/inventoryValuationUtils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import PageLayout from "../../../components/layout/PageLayout";
import { Button } from "../../../components/ui/button";

import InventoryValuationDataTable from "./components/InventoryValuationDataTable";
import InventoryValuationPagination from "./components/InventoryValuationPagination";
import InventoryValuationPrintLayout from "./components/InventoryValuationPrintLayout";
import InventoryValuationToolbar from "./components/InventoryValuationToolbar";
import InventoryValuationValuePanel from "./components/InventoryValuationValuePanel";

import "./inventoryValuation.css";

const InventoryValuationReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isBasisTooltipOpen, setIsBasisTooltipOpen] = useState(false);
  const [sort, setSort] = useState("Sort: Highest Value First");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    inventoryItems: rawItems,
    isLoading,
    error,
  } = useInventoryValuation();

  const { processedItems, totalValuation, availableCategories } =
    useMemo(() => {
      return calculateInventoryValuation(rawItems);
    }, [rawItems]);

  const { categoryItems, filteredItems } = useMemo(() => {
    const valuationResults = filterInventoryValuationItems(processedItems, {
      searchTerm,
      categories,
      sort: sort === "Sort: Z-0" ? "Sort: 0-Z" : sort,
    });

    return sort === "Sort: Z-0"
      ? {
          ...valuationResults,
          filteredItems: [...valuationResults.filteredItems].reverse(),
        }
      : valuationResults;
  }, [processedItems, searchTerm, categories, sort]);

  const filteredTotal = filteredItems.reduce((total, item) => {
    return total + item.value;
  }, 0);

  const categorySummary = useMemo(() => {
    return createValuationCategorySummary(categoryItems, totalValuation);
  }, [categoryItems, totalValuation]);

  const handleExport = () => {
    exportInventoryValuation({
      filteredItems,
      filteredTotal,
      totalValuation,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategories([]);
    setSort("Sort: Highest Value First");
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (values) => {
    setCategories(values);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1);
  };

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const valuationBasisTooltip = (
    <Tooltip open={isBasisTooltipOpen} onOpenChange={setIsBasisTooltipOpen}>
      <TooltipTrigger
        delay={0}
        closeOnClick={false}
        render={
          <button
            type="button"
            aria-label="Show valuation basis"
            onClick={() => setIsBasisTooltipOpen(!isBasisTooltipOpen)}
            className="flex size-[var(--app-touch-target-min)] items-center justify-center rounded-full text-[var(--app-color-text-subtle)] transition-colors hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-brand)] data-open:bg-[var(--app-color-control-hover)] data-open:text-[var(--app-color-brand)] focus-visible:outline-none focus-visible:ring-0"
          >
            <i aria-hidden="true" className="bi bi-question-circle text-lg" />
          </button>
        }
      />

      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-[32rem] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)]"
      >
        <p>
          It is a financial document that lists a company&apos;s current stock
          items, their quantities on hand, and their total monetary value.
          <br />
          <br />
          <strong>Valuation Basis:</strong> Current stock × recorded unit cost
          (per item&apos;s stock unit).
        </p>
      </TooltipContent>
    </Tooltip>
  );

  const pageActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)]"
      >
        <i aria-hidden="true" className="bi bi-box-arrow-up-right" />
        Export
      </Button>

      <Button
        type="button"
        onClick={() => window.print()}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-white hover:bg-[var(--app-color-brand)]/90"
      >
        <i aria-hidden="true" className="bi bi-printer" />
        Print
      </Button>
    </>
  );

  return (
    <PageLayout
      title="Inventory Valuation"
      subtitle="Monitor the current value of inventory on hand."
      titleAccessory={valuationBasisTooltip}
      actions={pageActions}
      className="valuation-page-shell flex flex-col gap-4"
    >
      <div className="valuation-page-layout val-page">
        <section className="valuation-page-overview">
          <InventoryValuationValuePanel
            categorySummary={categorySummary}
            totalValuation={totalValuation}
            isLoading={isLoading}
          />
        </section>

        <section className="valuation-page-toolbar">
          <InventoryValuationToolbar
            searchTerm={searchTerm}
            selectedCategories={categories}
            categories={availableCategories}
            sort={sort}
            categories={availableCategories}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </section>

        <section className="valuation-page-table">
          <InventoryValuationDataTable
            items={paginatedItems}
            isLoading={isLoading}
            error={error}
          />
        </section>

        <section className="valuation-page-pagination">
          <InventoryValuationPagination
            totalItems={filteredItems.length}
            pageSize={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setItemsPerPage}
            isLoading={isLoading}
          />
        </section>

        <InventoryValuationPrintLayout
          items={filteredItems}
          categorySummary={categorySummary}
          searchTerm={searchTerm}
          category={categories.join(", ") || "All Categories"}
          sort={sort}
          filteredTotal={filteredTotal}
        />
      </div>
    </PageLayout>
  );
};

export default InventoryValuationReport;
