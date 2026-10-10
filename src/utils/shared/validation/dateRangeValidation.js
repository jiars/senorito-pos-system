export const dateRangeValidationMessages = {
  dateRangeIncomplete: "Select both From and To dates.",
  dateRangeReversed: "To date cannot be earlier than From date.",
  dateRangeFuture: "Dates cannot be in the future.",
};

export const validateDateRange = (fromDate, toDate, today, isCustom = false) => {
  const errors = {};
  const messages = dateRangeValidationMessages;
  const needsBothDates = isCustom || Boolean(fromDate || toDate);

  // Empty dates allow All Time, but Custom requires a complete range.
  if (needsBothDates && (!fromDate || !toDate)) {
    errors.dateRange = messages.dateRangeIncomplete;
  } else if (fromDate > today || toDate > today) {
    errors.dateRange = messages.dateRangeFuture;
  } else if (fromDate && toDate && toDate < fromDate) {
    errors.dateRange = messages.dateRangeReversed;
  }

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
