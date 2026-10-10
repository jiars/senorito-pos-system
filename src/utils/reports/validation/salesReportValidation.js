export const salesReportValidationMessages = {
  dateRangeIncomplete: "Select both From and To dates.",
  dateRangeReversed: "To date cannot be earlier than From date.",
  dateRangeFuture: "Dates cannot be in the future.",
};

export const validateSalesReportDates = (fromDate, toDate, today) => {
  const errors = {};
  const messages = salesReportValidationMessages;

  // Empty dates mean All Time; a custom range needs both dates.
  if ((fromDate && !toDate) || (!fromDate && toDate)) {
    errors.dateRange = messages.dateRangeIncomplete;
  } else if (fromDate > today || toDate > today) {
    errors.dateRange = messages.dateRangeFuture;
  } else if (fromDate && toDate && toDate < fromDate) {
    errors.dateRange = messages.dateRangeReversed;
  }

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
