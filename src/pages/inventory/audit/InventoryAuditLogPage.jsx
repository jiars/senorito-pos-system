import { useMemo, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useInventoryAuditLogs } from "../../../hooks/useInventoryAuditLogs";

import {
  exportInventoryAuditLogs,
  filterInventoryAuditLogs,
} from "../../../utils/inventory/inventoryAuditLogUtils";

import InventoryAuditTable from "./components/InventoryAuditTable";
import InventoryAuditPagination from "./components/InventoryAuditPagination";
import InventoryAuditToolbar from "./components/InventoryAuditToolbar";
import "./inventoryAuditLog.css";

const ITEMS_PER_PAGE = 12;

const EMPTY_FILTERS = {
  searchTerm: "",
  fromDate: "",
  toDate: "",
  reportPeriod: "all",
  recordedBy: [],
  reasons: [],
  sources: [],
};

const InventoryAuditLogPage = () => {
  const { logs, isLoading, error } = useInventoryAuditLogs();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  const filteredLogs = useMemo(() => {
    return filterInventoryAuditLogs(logs, filters);
  }, [logs, filters]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleFilterChange = (field, value) => {
    // Show the first page whenever the user changes a filter.
    setCurrentPage(1);
    setFilters((currentFilters) => {
      return {
        ...currentFilters,
        [field]: value,
      };
    });
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setFilters(EMPTY_FILTERS);
  };

  const handleApplyFilters = (nextFilters) => {
    setCurrentPage(1);
    setFilters(nextFilters);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert("No logs to export based on current filters.");
      return;
    }

    exportInventoryAuditLogs(filteredLogs);
  };

  const headerActions = (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)]"
    >
      <i aria-hidden="true" className="bi bi-box-arrow-up-right" />
      Export
    </Button>
  );

  return (
    <PageLayout
      title="Inventory Audit Log"
      subtitle="Track all inventory changes and adjustments over time."
      actions={headerActions}
      className="audit-page-shell flex flex-col gap-4"
    >
      <div className="audit-page-layout audit-page">
        <section className="audit-page-toolbar">
          <InventoryAuditToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />
        </section>

        <section className="audit-page-table">
          <InventoryAuditTable
            logs={paginatedLogs}
            isLoading={isLoading}
            error={error}
          />
        </section>

        <section className="audit-page-pagination">
          <InventoryAuditPagination
            totalLogs={filteredLogs.length}
            pageSize={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setItemsPerPage}
            isLoading={isLoading}
          />
        </section>
      </div>
    </PageLayout>
  );
};

export default InventoryAuditLogPage;
