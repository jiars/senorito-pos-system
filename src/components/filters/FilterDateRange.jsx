import DatePickerRange from "@/components/ui/date-picker-range";

const toCalendarDate = (value) =>
  value ? new Date(`${value}T00:00:00`) : undefined;

const toInputDateValue = (date) => {
  if (!date) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

/**
 * Filter adapter for DatePickerRange. The generic picker works with Date
 * objects; filters keep their existing YYYY-MM-DD values for services.
 */
const FilterDateRange = ({
  id,
  label = "From / To",
  fromDate,
  toDate,
  onRangeChange,
  maxDate,
  errorId,
}) => {
  const value =
    fromDate || toDate
      ? {
          from: toCalendarDate(fromDate),
          to: toCalendarDate(toDate),
        }
      : undefined;

  return (
    <DatePickerRange
      id={id}
      label={label}
      value={value}
      disabled={maxDate ? { after: toCalendarDate(maxDate) } : undefined}
      errorId={errorId}
      onValueChange={(range) => {
        onRangeChange(toInputDateValue(range?.from), toInputDateValue(range?.to));
      }}
    />
  );
};

export default FilterDateRange;
