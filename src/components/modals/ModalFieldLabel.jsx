import { useState } from "react";

import { FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ModalFieldLabel = ({
  htmlFor,
  label,
  tooltip,
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-[var(--app-space-2)]">
      <FieldLabel htmlFor={htmlFor} className={className}>
        {label}
        {required && (
          <span className="text-[var(--app-color-danger)]">*</span>
        )}
      </FieldLabel>

      <div className="relative size-5 shrink-0">
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger
            delay={0}
            closeOnClick={false}
            render={
              <button
                type="button"
                aria-label={`Show ${label} information`}
                onClick={() => setIsOpen((currentOpen) => !currentOpen)}
                className="absolute left-1/2 top-1/2 flex size-[var(--app-touch-target-min)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[var(--app-color-text-subtle)] transition-colors hover:text-[var(--app-color-brand)] data-open:text-[var(--app-color-brand)] focus-visible:outline-none focus-visible:ring-0"
              >
                <i
                  aria-hidden="true"
                  className="bi bi-question-circle text-base"
                />
              </button>
            }
          />

          <TooltipContent
            side="bottom"
            align="end"
            positionerClassName="!z-[1100]"
            className="!z-[1100] max-w-72 border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)]"
          >
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ModalFieldLabel;
