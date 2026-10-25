import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

// A click/tap guide also works on tablets, unlike a hover-only tooltip.
const ExpenseArchivingGuide = () => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Yearly archiving guide"
            className="size-[var(--app-touch-target-min)] shrink-0 rounded-full text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-brand)]"
          >
            <i className="bi bi-info-circle" aria-hidden="true" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] gap-[var(--app-space-2)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
      >
        <PopoverTitle className="font-semibold">Yearly expense archiving</PopoverTitle>
        <p>
          Enable it per category in Manage Expense Categories. The planned run is
          every January 1, Philippine time, for expenses dated before that year.
          Inventory Purchase is always excluded.
        </p>
        <p>
          Archived records stay in View Archive and can be restored. Expense
          totals, charts, and exports on this page include active records only.
        </p>
        <p className="font-medium">
          Not active yet: settings can be saved, but scheduled archiving is not connected.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default ExpenseArchivingGuide;
