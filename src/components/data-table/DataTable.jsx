import { useEffect, useMemo, useRef } from "react";
import {
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import EmptyState from "../feedback/data-state/EmptyState";

import "./dataTable.css";

const basicTableFeatures = tableFeatures({});
const selectableTableFeatures = tableFeatures({ rowSelectionFeature });

const selectionColumn = {
  id: "select",
  header: ({ table }) => {
    return (
      <input
        aria-label="Select all rows"
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onClick={table.getToggleAllPageRowsSelectedHandler()}
        onChange={() => {}}
        className="size-4 rounded border-[var(--app-color-border)] accent-[var(--app-color-brand)]"
      />
    );
  },
  cell: ({ row }) => {
    return (
      <input
        aria-label="Select row"
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onClick={row.getToggleSelectedHandler()}
        onChange={() => {}}
        className="size-4 rounded border-[var(--app-color-border)] accent-[var(--app-color-brand)]"
      />
    );
  },
};

const getColumnMeta = (column) => {
  if (column.columnDef.meta === undefined) {
    return {};
  }

  return column.columnDef.meta;
};

const DataTable = ({
  columns,
  data,
  tableLabel,
  getRowId,
  enableSelection = false,
  isLoading = false,
  skeletonRowCount = 5,
  errorMessage = "",
  emptyMessage = "No records found.",
  className = "",
  tableClassName = "",
  headerClassName = "",
  scrollAreaClassName = "w-full",
  scrollbarOrientation = "horizontal",
}) => {
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTableScroll = (event) => {
    const scrollViewport = event.currentTarget;
    scrollViewport.dataset.scrolling = "true";

    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      scrollViewport.dataset.scrolling = "false";
    }, 500);
  };

  const tableColumns = useMemo(() => {
    if (enableSelection === false) {
      return columns;
    }

    return [selectionColumn, ...columns];
  }, [columns, enableSelection]);

  const currentTableFeatures = enableSelection
    ? selectableTableFeatures
    : basicTableFeatures;

  const table = useTable({
    features: currentTableFeatures,
    data,
    columns: tableColumns,
    getRowId,
  });

  const columnCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;
  let scrollOverflowClassName = "overflow-x-auto overflow-y-hidden";

  if (scrollbarOrientation === "vertical") {
    scrollOverflowClassName = "overflow-x-hidden overflow-y-auto";
  }

  if (scrollbarOrientation === "both") {
    scrollOverflowClassName = "overflow-auto";
  }

  if (isLoading) {
    return (
      <div aria-busy="true" className="overflow-hidden">
        <div
          data-scrolling="false"
          onScroll={handleTableScroll}
          className={`data-table-scroll-viewport ${scrollAreaClassName} ${scrollOverflowClassName} overscroll-contain`}
        >
          <Table
            aria-label={`Loading ${tableLabel}`}
            className={`min-w-[44rem] border-collapse text-[length:var(--app-font-size-body-secondary)] ${tableClassName}`}
            containerClassName="overflow-visible"
          >
            <TableHeader className="[&_tr]:!border-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="!border-0 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const columnMeta = getColumnMeta(header.column);

                    return (
                      <TableHead
                        key={header.id}
                        className="h-[var(--app-table-header-height)] px-[var(--app-space-4)]"
                        style={{
                          minWidth: columnMeta.width,
                          width: columnMeta.width,
                        }}
                      >
                        <Skeleton className="h-full w-full" />
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <TableRow
                  key={`skeleton-row-${rowIndex}`}
                  className="!border-0 hover:bg-transparent"
                >
                  {table.getAllLeafColumns().map((column) => {
                    const columnMeta = getColumnMeta(column);

                    return (
                      <TableCell
                        key={`${rowIndex}-${column.id}`}
                        className="h-[var(--app-table-row-height)] px-[var(--app-space-4)] py-[var(--app-space-2)]"
                        style={{
                          minWidth: columnMeta.width,
                          width: columnMeta.width,
                        }}
                      >
                        <Skeleton className="h-full w-full" />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-[var(--app-radius-panel-standard)] border bg-[var(--app-color-surface)] ${className}`}
      style={{
        borderColor: "var(--app-table-border-color)",
        borderWidth: "var(--app-table-border-width)",
      }}
    >
      <div
        data-scrolling="false"
        onScroll={handleTableScroll}
        className={`data-table-scroll-viewport ${scrollAreaClassName} ${scrollOverflowClassName} overscroll-contain`}
      >
        <Table
          aria-label={tableLabel}
          className={`min-w-[44rem] border-collapse text-[length:var(--app-font-size-body-secondary)] ${tableClassName}`}
          containerClassName="overflow-visible"
        >
          <TableHeader
            className={`sticky top-0 z-10 bg-[var(--app-color-canvas)] ${headerClassName}`}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
                style={{
                  borderBottomColor: "var(--app-table-row-border-color)",
                  borderBottomWidth: "var(--app-table-row-border-width)",
                }}
              >
                {headerGroup.headers.map((header) => {
                  const columnMeta = getColumnMeta(header.column);

                  return (
                    <TableHead
                      key={header.id}
                      className={`h-[var(--app-table-header-height)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-bold text-[var(--app-color-text-muted)] ${columnMeta.headerClassName || ""}`}
                      style={{
                        minWidth: columnMeta.width,
                        width: columnMeta.width,
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {errorMessage ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-[var(--app-color-danger-foreground)]"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="!h-auto !p-0">
                  <EmptyState className="!min-h-24" title={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => {
                const isRowSelected = enableSelection && row.getIsSelected();
                const isLastRow = rowIndex === rows.length - 1;

                return (
                  <TableRow
                    key={row.id}
                    data-state={isRowSelected && "selected"}
                    style={{
                      borderBottomColor: "var(--app-table-row-border-color)",
                      borderBottomWidth: "var(--app-table-row-border-width)",
                    }}
                  >
                    {row.getAllCells().map((cell) => {
                      const columnMeta = getColumnMeta(cell.column);

                      return (
                        <TableCell
                          key={cell.id}
                          className={`h-[var(--app-table-row-height)] whitespace-normal break-words px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] ${isLastRow ? "" : "border-b"} ${columnMeta.cellClassName || ""}`}
                          style={{
                            borderBottomColor: isLastRow
                              ? "transparent"
                              : "var(--app-table-row-border-color)",
                            borderBottomWidth: isLastRow
                              ? "0"
                              : "var(--app-table-row-border-width)",
                            minWidth: columnMeta.width,
                            width: columnMeta.width,
                          }}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
