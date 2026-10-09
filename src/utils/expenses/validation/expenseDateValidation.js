import { format, isValid, parse } from "date-fns";

// Each form owns its messages; only date comparison/parsing is shared.
export const validateExpenseDate = (value, dateLimits, originalDate, dateFormat, messages) => {
  const date = parse(value, dateFormat, new Date());
  if (!isValid(date) || format(date, dateFormat) !== value) return messages.dateInvalid;
  if (!dateLimits) return "";
  if (date > dateLimits.maxExpenseDate) return messages.dateFuture;
  if (format(date, "yyyy-MM-dd") !== originalDate && date < dateLimits.minExpenseDate) {
    return messages.dateTooOld;
  }
  return "";
};
