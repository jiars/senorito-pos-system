/**
 * Formats a numeric value to a maximum of 2 decimal places.
 * Strips out unnecessary trailing zeroes.
 * Examples:
 *  5.00 -> 5
 *  5.10 -> 5.1
 *  5.15 -> 5.15
 */
export const formatDecimal = (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  const num = Number(value);
  if (isNaN(num)) return null;
  
  return Number(num.toFixed(2));
};
