import DataTablePagination from "@/components/data-table/DataTablePagination";

/**
 * Order History keeps its pagination section beside its own toolbar and table.
 * The actual controls remain centralized in the shared DataTablePagination.
 */
const OrdersPagination = ({
  totalOrders,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  return (
    <DataTablePagination
      totalItems={totalOrders}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
    />
  );
};

export default OrdersPagination;
