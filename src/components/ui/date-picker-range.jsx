import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatRangeLabel = (range) => {
  if (!range?.from) {
    return "Select date range";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  if (!range.to) {
    return formatter.format(range.from);
  }

  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
};

/**
 * Generic controlled date-range picker. It uses native Date objects so it can
 * be used in a page header, a form, or wrapped by a filter-specific adapter.
 */
const DatePickerRange = ({
  id,
  value,
  onValueChange,
  label,
  showLabel = true,
  numberOfMonths = 2,
  align = "start",
  className = "",
  triggerClassName = "",
  onComplete,
  disabled,
  errorId,
}) => {
  const picker = (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            aria-invalid={Boolean(errorId)}
            aria-describedby={errorId}
            type="button"
            variant="outline"
            className={`h-[var(--app-touch-target-min)] w-full justify-start gap-[var(--app-space-2)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-left text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)] ${triggerClassName}`}
          >
            <CalendarIcon className="size-[14px] shrink-0" />
            <span className="min-w-0 truncate [font-variant-numeric:tabular-nums]">
              {formatRangeLabel(value)}
            </span>
          </Button>
        }
      />

      <PopoverContent
        align={align}
        className="z-[60] w-auto rounded-[var(--app-radius-panel-standard)] p-0"
      >
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          disabled={disabled}
          onSelect={(range) => {
            onValueChange(range);

            if (range?.from && range?.to) {
              onComplete?.();
            }
          }}
          numberOfMonths={numberOfMonths}
        />
      </PopoverContent>
    </Popover>
  );

  if (!showLabel) {
    return <div className={className}>{picker}</div>;
  }

  return (
    <Field className={className}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className="text-[length:var(--app-font-size-body-secondary)] font-normal leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]"
        >
          {label}
        </FieldLabel>
      )}
      {picker}
    </Field>
  );
};

export default DatePickerRange;
