import { addYears, startOfDay, startOfMonth, subMonths } from "date-fns";

export const getExpenseDateLimits = (today = new Date()) => {
  const currentDay = startOfDay(today);
  return {
    minExpenseDate: startOfMonth(subMonths(currentDay, 3)),
    maxExpenseDate: currentDay,
    minExpirationDate: currentDay,
    maxExpirationDate: addYears(currentDay, 10),
  };
};
