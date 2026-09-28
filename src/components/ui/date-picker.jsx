import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const parseDateValue = (value) => {
  if (!value) return undefined;

  const parsedDate = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsedDate) ? parsedDate : undefined;
};

/**
 * Controlled shadcn single-date picker.
 * The UI uses a readable date while forms keep the API-safe YYYY-MM-DD value.
 */
const DatePicker = ({
  id,
  value,
  onValueChange,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  invalid = false,
  align = "start",
  triggerClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={`h-[var(--app-touch-target-min)] w-full justify-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-left text-[length:var(--app-font-size-body-secondary)] font-normal leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${triggerClassName}`}
          >
            <CalendarIcon className="size-[14px] shrink-0 text-[var(--app-color-text-subtle)]" />
            <span
              className={`min-w-0 truncate [font-variant-numeric:tabular-nums] ${
                selectedDate ? "" : "text-[var(--app-color-text-subtle)]"
              }`}
            >
              {selectedDate ? format(selectedDate, "MM/dd/yyyy") : placeholder}
            </span>
          </Button>
        }
      />

      <PopoverContent
        align={align}
        positionerClassName="!z-[1100]"
        className="!z-[1100] w-auto rounded-[var(--app-radius-panel-standard)] p-0"
      >
        <Calendar
          mode="single"
          defaultMonth={selectedDate}
          selected={selectedDate}
          onSelect={(date) => {
            onValueChange(date ? format(date, "yyyy-MM-dd") : "");
            if (date) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
