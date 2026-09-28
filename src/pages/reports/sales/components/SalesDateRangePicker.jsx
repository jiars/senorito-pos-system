import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SalesDateRangePicker = ({ fromDate, toDate, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRange = {
    from: fromDate ? new Date(`${fromDate}T00:00:00`) : undefined,
    to: toDate ? new Date(`${toDate}T00:00:00`) : undefined,
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatInputDate = (date) => {
    if (!date) {
      return "";
    }

    const offset = date.getTimezoneOffset() * 60 * 1000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  const label =
    selectedRange.from && selectedRange.to
      ? `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`
      : "Select date range";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)]"
          >
            <i aria-hidden="true" className="bi bi-calendar-range" />
            {label}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        className="z-[60] w-auto rounded-[var(--app-radius-panel-standard)] p-0"
      >
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selectedRange}
          onSelect={(range) => {
            const nextFromDate = formatInputDate(range?.from);
            const nextToDate = formatInputDate(range?.to);

            onRangeChange(nextFromDate, nextToDate);

            if (range?.from && range?.to) {
              setIsOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SalesDateRangePicker;
