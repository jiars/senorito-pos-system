import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ExpenseHeader = ({
  onManageCategories,
  onExport,
  onViewArchive,
  onAddExpense,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label="Open Expense Tracking actions"
              className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-0 text-[var(--app-color-text)] shadow-[var(--app-shadow-card)] hover:bg-[var(--app-color-control-hover)]"
            >
              <i aria-hidden="true" className="bi bi-three-dots-vertical" />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="z-[100] w-52">
          <DropdownMenuItem onClick={onExport}>
            <i aria-hidden="true" className="bi bi-box-arrow-up-right" />
            Export
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onViewArchive}>
            <i aria-hidden="true" className="bi bi-archive" />
            View Archive
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onManageCategories}>
            <i aria-hidden="true" className="bi bi-tags" />
            Manage Categories
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        onClick={onAddExpense}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
      >
        <i aria-hidden="true" className="bi bi-plus-lg" />
        Add Expense
      </Button>
    </div>
  );
};

export default ExpenseHeader;
