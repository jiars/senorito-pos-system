import convert from "convert-units";

const supportedMeasures = new Set(["mass", "volume", "each"]);

const unitAliases = new Map(
  convert()
    .list()
    .filter((unit) => supportedMeasures.has(unit.measure))
    .flatMap((unit) => {
      return [unit.abbr, unit.singular, unit.plural].map((alias) => [
        alias.toLowerCase(),
        unit.abbr,
      ]);
    }),
);

[
  ["pc", "ea"],
  ["pcs", "ea"],
  ["piece", "ea"],
  ["pieces", "ea"],
  ["unit", "ea"],
  ["units", "ea"],
  ["dozens", "dz"],
  ["doz", "dz"],
  ["kilo", "kg"],
  ["kilos", "kg"],
  ["kgs", "kg"],
  ["lbs", "lb"],
  ["liter", "l"],
  ["liters", "l"],
  ["milliliter", "ml"],
  ["milliliters", "ml"],
  ["cc", "ml"],
  ["tbsp", "Tbs"],
  ["tbsps", "Tbs"],
  ["tablespoons", "Tbs"],
  ["fl oz", "fl-oz"],
  ["fluid ounces", "fl-oz"],
].forEach(([alias, unit]) => unitAliases.set(alias, unit));

const normalizeUnitText = (unit) => String(unit ?? "").trim().toLowerCase();

export const resolveConvertibleUnit = (unit) => {
  return unitAliases.get(normalizeUnitText(unit)) ?? null;
};

export const getStandardUnitMultiplier = (baseUnit, purchaseUnit) => {
  const normalizedBase = normalizeUnitText(baseUnit);
  const normalizedPurchase = normalizeUnitText(purchaseUnit);

  if (!normalizedBase || !normalizedPurchase) return null;

  // Identical custom packaging units (for example box -> box) remain valid.
  if (normalizedBase === normalizedPurchase) return "1";

  const resolvedBase = resolveConvertibleUnit(baseUnit);
  const resolvedPurchase = resolveConvertibleUnit(purchaseUnit);

  if (!resolvedBase || !resolvedPurchase) return null;

  try {
    const multiplier = convert(1).from(resolvedPurchase).to(resolvedBase);

    if (!Number.isFinite(multiplier) || multiplier <= 0) return null;

    return String(Number(multiplier.toPrecision(12)));
  } catch {
    // Cross-measure and unsupported packaging conversions require a manual
    // multiplier so the UI never guesses an inventory quantity.
    return null;
  }
};

export const formatUnitConversionAmount = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(numericValue);
};
