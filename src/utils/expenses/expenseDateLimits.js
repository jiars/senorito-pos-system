import { addYears, format, isValid, parse, startOfDay, startOfMonth, subMonths } from "date-fns";

export const getPurchaseExpirationMinDate = (purchaseDate, fallbackDate) => {
  if (purchaseDate) {
    const date = parse(purchaseDate, "yyyy-MM-dd", fallbackDate);
    if (isValid(date) && format(date, "yyyy-MM-dd") === purchaseDate) {
      return startOfDay(date);
    }
  }
  return fallbackDate;
};

export const getExpenseDateLimits = (today = new Date()) => {
  const currentDay = startOfDay(today);
  return {
    minExpenseDate: startOfMonth(subMonths(currentDay, 3)),
    maxExpenseDate: currentDay,
    minExpirationDate: currentDay,
    maxExpirationDate: addYears(currentDay, 10),
  };
};
