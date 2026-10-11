import { addYears, format, isValid, parse, startOfDay, startOfMonth, subMonths } from "date-fns";
import { getBusinessDateForPicker } from "@/utils/shared/formatters/businessDates";

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
  const currentDay = getBusinessDateForPicker(today);
  return {
    minExpenseDate: startOfMonth(subMonths(currentDay, 3)),
    maxExpenseDate: currentDay,
    minExpirationDate: currentDay,
    maxExpirationDate: addYears(currentDay, 10),
  };
};
