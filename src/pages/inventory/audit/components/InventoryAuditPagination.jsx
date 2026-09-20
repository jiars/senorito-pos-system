import DataTablePagination from "@/components/data-table/DataTablePagination";

/**
 * Inventory Audit owns its page-specific row-count options.
 * Shared pagination behavior and styling remain in DataTablePagination.
 */
const InventoryAuditPagination = ({
  totalLogs,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  return (
    <DataTablePagination
      totalItems={totalLogs}
      pageSize={pageSize}
      pageSizeOptions={[12, 24, 36, 48]}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
    />
  );
};

export default InventoryAuditPagination;
