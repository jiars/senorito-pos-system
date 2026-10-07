import { resolveConvertibleUnit } from "./unitConversion";

export const getMinimumLevelRules = (baseUnit) => {
  // Reuse existing aliases so pcs, pieces, units, and each follow one rule.
  if (resolveConvertibleUnit(baseUnit) === "ea") {
    return {
      inputMode: "numeric",
      pattern: "[0-9]*",
      inputPattern: /^\d*$/,
      wholeNumbersOnly: true,
      errorMessage: "Minimum level must be a whole number of at least 1.",
    };
  }

  return {
    inputMode: "decimal",
    pattern: "[0-9]*[.]?[0-9]*",
    inputPattern: /^\d*\.?\d*$/,
    wholeNumbersOnly: false,
    errorMessage: "Minimum level must be at least 1.",
  };
};

export const isValidMinimumLevel = (value, baseUnit) => {
  const rules = getMinimumLevelRules(baseUnit);
  const text = String(value);
  const amount = Number(value);

  if (!rules.inputPattern.test(text) || !Number.isFinite(amount) || amount < 1) {
    return false;
  }

  if (rules.wholeNumbersOnly) return Number.isSafeInteger(amount);
  return true;
};
