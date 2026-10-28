import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Match the valuation guide, including click/tap support for tablets.
const ExpenseArchivingGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger
        delay={0}
        closeOnClick={false}
        render={
          <button
            type="button"
            aria-label="Yearly archiving guide"
            onClick={() => setIsOpen(!isOpen)}
            className="flex size-[var(--app-touch-target-min)] shrink-0 items-center justify-center rounded-full text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-brand)] data-open:bg-[var(--app-color-control-hover)] data-open:text-[var(--app-color-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
          >
            <i className="bi bi-question-circle text-lg" aria-hidden="true" />
          </button>
        }
      />
      <TooltipContent
        side="bottom"
        align="start"
        positionerClassName="!z-[1100]"
        className="!z-[1100] max-w-[min(24rem,calc(100vw-2rem))] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)]"
      >
        <p>
          Enabled categories archive prior-year expenses every January 1 at 12:10 AM,
          Philippine time. Inventory Purchase is excluded. Records stay in View Archive
          and can be restored; active totals, charts, and exports exclude them.
          A completed yearly run is not repeated, including for restored records.
          Category changes apply to the next run. The server schedule must be enabled.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ExpenseArchivingGuide;
