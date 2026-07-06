// Currency and Number Formatters for POS and Reports

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount))
    return 'N/A';
  return `₱${Number(amount).toFixed(2)}`;
};
