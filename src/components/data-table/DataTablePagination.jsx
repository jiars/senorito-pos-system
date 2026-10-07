import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const DataTablePagination = ({
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 30, 40, 50],
  currentPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeSelectContentProps = {},
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;

  const handlePageSizeChange = (value) => {
    onPageSizeChange(Number(value));
    onPageChange(1);
  };

  if (isLoading) {
    return (
      <nav
        aria-busy="true"
        aria-label="Loading table pagination"
        className="flex flex-wrap items-center justify-end gap-[var(--app-space-4)] max-sm:justify-start max-sm:gap-[var(--app-space-2)]"
      >
        <Skeleton className="h-[var(--app-touch-target-min)] w-full max-w-[22rem] rounded-[var(--app-radius-nested)]" />
      </nav>
    );
  }

  return (
    <nav
      aria-label="Table pagination"
      className="flex flex-wrap items-center justify-end gap-[var(--app-space-4)] max-sm:justify-start max-sm:gap-[var(--app-space-2)]"
    >
      <div className="flex items-center gap-[var(--app-space-2)]">
        <span className="text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text)]">
          Rows per page
        </span>

        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger
            id="rows-per-page"
            className="h-[var(--app-touch-target-min)] w-[4.5rem] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)]"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent side="top" {...pageSizeSelectContentProps}>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text)]">
        Page {currentPage} of {totalPages}
      </span>

      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Go to first page"
          disabled={!canGoToPreviousPage}
          onClick={() => onPageChange(1)}
          className="size-[var(--app-touch-target-min)] !border-0 !bg-transparent !p-0 hover:!bg-transparent"
        >
          <span className="flex size-8 items-center justify-center rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)] transition-colors hover:bg-[var(--app-color-control-hover)]">
            <i aria-hidden="true" className="bi bi-chevron-bar-left" />
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Go to previous page"
          disabled={!canGoToPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="size-[var(--app-touch-target-min)] !border-0 !bg-transparent !p-0 hover:!bg-transparent"
        >
          <span className="flex size-8 items-center justify-center rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)] transition-colors hover:bg-[var(--app-color-control-hover)]">
            <i aria-hidden="true" className="bi bi-chevron-left" />
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Go to next page"
          disabled={!canGoToNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="size-[var(--app-touch-target-min)] !border-0 !bg-transparent !p-0 hover:!bg-transparent"
        >
          <span className="flex size-8 items-center justify-center rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)] transition-colors hover:bg-[var(--app-color-control-hover)]">
            <i aria-hidden="true" className="bi bi-chevron-right" />
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Go to last page"
          disabled={!canGoToNextPage}
          onClick={() => onPageChange(totalPages)}
          className="size-[var(--app-touch-target-min)] !border-0 !bg-transparent !p-0 hover:!bg-transparent"
        >
          <span className="flex size-8 items-center justify-center rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)] transition-colors hover:bg-[var(--app-color-control-hover)]">
            <i aria-hidden="true" className="bi bi-chevron-bar-right" />
          </span>
        </Button>
      </div>
    </nav>
  );
};

export default DataTablePagination;
