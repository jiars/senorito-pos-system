import { resolveConvertibleUnit } from "./unitConversion";

export const getQuantityRules = (unit) => {
  const wholeNumbersOnly = resolveConvertibleUnit(unit) === "ea";
  return {
    wholeNumbersOnly,
    step: wholeNumbersOnly ? "1" : "any",
    inputMode: wholeNumbersOnly ? "numeric" : "decimal",
  };
};

// Scientific notation remains valid if its numeric value is a whole count.
export const isWholeQuantityValid = (value, unit) => {
  if (!getQuantityRules(unit).wholeNumbersOnly) return true;
  return Number.isSafeInteger(Number(value));
};
