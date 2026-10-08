// Currency and Number Formatters for POS and Reports

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount))
    return 'N/A';

  // Convert to number, then format with commas and 2 decimal places (e.g., 1,000.00)
  const formattedNumber = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `₱${formattedNumber}`;
};
