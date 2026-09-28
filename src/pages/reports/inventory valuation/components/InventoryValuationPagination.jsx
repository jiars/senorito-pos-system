import DataTablePagination from "@/components/data-table/DataTablePagination";

const InventoryValuationPagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  return (
    <DataTablePagination
      totalItems={totalItems}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 30, 40]}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
    />
  );
};

export default InventoryValuationPagination;
