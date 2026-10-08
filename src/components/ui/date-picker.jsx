import { addYears, endOfYear, format, isValid, parse, startOfDay, startOfYear } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
  onValidityChange,
  onInputValueChange,
  editable = false,
  showValidationMessage = true,
  "aria-describedby": describedBy,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  minDate,
  maxDate,
  defaultMonth,
  invalid = false,
  align = "start",
  triggerClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const [draft, setDraft] = useState({ sourceValue: value, text: "" });
  const [hasBlurred, setHasBlurred] = useState(false);
  const inputRef = useRef(null);
  const feedbackId = useId();
  let inputText = selectedDate ? format(selectedDate, "MM/dd/yyyy") : "";
  if (draft.sourceValue === value && draft.text) inputText = draft.text;
  const earliestDate = minDate ? startOfDay(minDate) : undefined;
  const latestDate = maxDate ? startOfDay(maxDate) : undefined;
  let initialMonth = selectedDate || defaultMonth;
  if (earliestDate && (!initialMonth || initialMonth < earliestDate)) {
    initialMonth = earliestDate;
  }
  if (latestDate && initialMonth && initialMonth > latestDate) {
    initialMonth = latestDate;
  }

  // Keep out-of-range months visible; minDate/maxDate disable days, not navigation.
  // Explicit navigation bounds prevent the dropdown's default past-only range.
  const navigationAnchor = initialMonth || new Date();
  const firstMonth = startOfYear(addYears(navigationAnchor, -100));
  const lastMonth = endOfYear(addYears(navigationAnchor, 100));

  const isDateDisabled = (date) => {
    const day = startOfDay(date);
    if (earliestDate && day < earliestDate) return true;
    if (latestDate && day > latestDate) return true;
    return false;
  };

  const getInputError = (text) => {
    if (!text) return "";
    if (text.length !== 10) return "Enter a complete date: MM/DD/YYYY.";
    const date = parse(text, "MM/dd/yyyy", new Date());
    if (!isValid(date) || format(date, "MM/dd/yyyy") !== text) {
      return "Enter a valid date.";
    }
    if (earliestDate && startOfDay(date) < earliestDate) {
      return `Choose ${format(earliestDate, "MM/dd/yyyy")} or later.`;
    }
    if (latestDate && startOfDay(date) > latestDate) {
      return `Choose ${format(latestDate, "MM/dd/yyyy")} or earlier.`;
    }
    return "";
  };

  const inputError = getInputError(inputText);
  const showInputError = Boolean(inputError) && (hasBlurred || invalid);

  const handleInputChange = (event) => {
    const rawText = event.target.value;
    const cursor = event.target.selectionStart || 0;
    let digits = rawText.replace(/\D/g, "").slice(0, 8);
    let digitCursor = rawText.slice(0, cursor).replace(/\D/g, "").length;
    const inputType = event.nativeEvent.inputType;

    // Deleting a separator also deletes the adjacent digit, avoiding sticky slashes.
    const removedOneCharacter = rawText.length === inputText.length - 1;
    if (removedOneCharacter && inputType === "deleteContentBackward" && inputText[cursor] === "/") {
      const deleteIndex = Math.max(0, digitCursor - 1);
      digits = digits.slice(0, deleteIndex) + digits.slice(deleteIndex + 1);
      digitCursor = deleteIndex;
    } else if (removedOneCharacter && inputType === "deleteContentForward" && inputText[cursor] === "/") {
      digits = digits.slice(0, digitCursor) + digits.slice(digitCursor + 1);
    }

    let text = digits.slice(0, 2);
    if (digits.length > 2) text += `/${digits.slice(2, 4)}`;
    if (digits.length > 4) text += `/${digits.slice(4, 8)}`;

    const error = getInputError(text);
    let nextValue = "";
    if (text && !error) {
      nextValue = format(parse(text, "MM/dd/yyyy", new Date()), "yyyy-MM-dd");
    }
    setDraft({ sourceValue: nextValue, text });
    if (onInputValueChange) onInputValueChange(text);
    onValueChange(nextValue);
    if (onValidityChange) onValidityChange(!error);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let nextCursor = digitCursor;
      if (digitCursor > 2) nextCursor += 1;
      if (digitCursor > 4) nextCursor += 1;
      inputRef.current.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleSelect = (date) => {
    if (date && isDateDisabled(date)) return;
    const nextValue = date ? format(date, "yyyy-MM-dd") : "";
    setDraft({ sourceValue: nextValue, text: "" });
    if (onInputValueChange) onInputValueChange(date ? format(date, "MM/dd/yyyy") : "");
    setHasBlurred(false);
    onValueChange(nextValue);
    if (onValidityChange) onValidityChange(true);
    if (date) setOpen(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-[var(--app-space-1)]">
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      {editable ? (
        <div className="relative min-w-0">
          <Input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={placeholder}
            value={inputText}
            disabled={disabled}
            aria-invalid={invalid || showInputError}
            aria-describedby={showValidationMessage && showInputError ? feedbackId : describedBy}
            onChange={handleInputChange}
            onBlur={() => setHasBlurred(true)}
            className={`h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] pl-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] [font-variant-numeric:tabular-nums] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${triggerClassName} !pr-[calc(var(--app-touch-target-min)+var(--app-space-2))]`}
          />
          {inputText && inputText.length < 10 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-[var(--app-space-2)] flex items-center whitespace-pre text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)] [font-variant-numeric:tabular-nums]"
            >
              <span className="invisible">{inputText}</span>
              <span>{"MM/DD/YYYY".slice(inputText.length)}</span>
            </span>
          )}
          <PopoverTrigger render={
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              aria-label="Choose date from calendar"
              className="absolute right-0 top-0 size-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-control-hover)]"
            >
              <CalendarIcon className="size-4" aria-hidden="true" />
            </Button>
          } />
        </div>
      ) : (
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
      )}

      <PopoverContent
        align={editable && align === "start" ? "end" : align}
        positionerClassName="!z-[1100]"
        className="!z-[1100] w-auto rounded-[var(--app-radius-panel-standard)] p-0"
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          navLayout="around"
          key={value}
          defaultMonth={initialMonth}
          startMonth={firstMonth}
          endMonth={lastMonth}
          disabled={isDateDisabled}
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
    {editable && showValidationMessage && showInputError && (
      <p id={feedbackId} role="alert" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]">
        {inputError}
      </p>
    )}
    </div>
  );
};

export default DatePicker;
