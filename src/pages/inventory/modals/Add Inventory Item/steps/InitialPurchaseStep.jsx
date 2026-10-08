import ModalFieldLabel from "@/components/modals/ModalFieldLabel";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatUnitConversionAmount } from "@/utils/inventory/unitConversion";
import { getMinimumLevelRules } from "@/utils/inventory/minimumLevel";
import { getQuantityRules } from "@/utils/inventory/quantityRules";

import {
  controlClassName,
  errorClassName,
  labelClassName,
  stepPanelClassName,
} from "../addInventoryItemClasses";
import { addInventoryItemTooltips } from "../addInventoryItemTooltips";

const InitialPurchaseStep = ({
  formData,
  showErrors,
  validation,
  standardMultiplier,
  onFieldChange,
  onPurchaseUnitChange,
  getBaseUnitCost,
}) => {
  const { errors } = validation;
  const minimumLevelRules = getMinimumLevelRules(formData.unit);
  const quantityRules = getQuantityRules(formData.purchaseUnit || formData.unit);
  const hasValidPurchaseCost =
    validation.isQtyValid && validation.isCostValid;
  const costPerPurchaseUnit = hasValidPurchaseCost
    ? validation.parsedCost / validation.parsedQty
    : null;
  const baseUnitCost = getBaseUnitCost();
  const showCostBreakdown =
    costPerPurchaseUnit !== null && baseUnitCost !== null;
  const needsCustomMultiplier =
    Boolean(formData.purchaseUnit && formData.unit) && !standardMultiplier;

  return (
    <section
      aria-labelledby="add-inventory-purchase-step"
      className={stepPanelClassName}
    >
      <div>
        <h2
          id="add-inventory-purchase-step"
          className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
        >
          Initial Purchase
        </h2>
        <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
          Record the first delivery and calculate the item&apos;s starting unit
          cost.
        </p>
      </div>

      <Field>
        <FieldLabel
          htmlFor="add-inventory-supplier"
          className={labelClassName}
        >
          Supplier Name
        </FieldLabel>
        <Input
          id="add-inventory-supplier"
          value={formData.supplier}
          onChange={(event) => onFieldChange("supplier", event.target.value)}
          placeholder="e.g. Bean Roasters Inc."
          className={controlClassName}
        />
      </Field>

      <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
        <Field data-invalid={showErrors && Boolean(errors.qtyPurchased)}>
          <FieldLabel
            htmlFor="add-inventory-quantity"
            className={labelClassName}
          >
            Quantity
            <span className="text-[var(--app-color-danger)]">*</span>
          </FieldLabel>
          <Input
            id="add-inventory-quantity"
            type="number"
            min={quantityRules.wholeNumbersOnly ? "1" : "0.01"}
            step={quantityRules.step}
            inputMode={quantityRules.inputMode}
            value={formData.qtyPurchased}
            onChange={(event) =>
              onFieldChange("qtyPurchased", event.target.value)
            }
            placeholder="Number of units purchased"
            aria-invalid={showErrors && Boolean(errors.qtyPurchased)}
            className={controlClassName}
          />
          {showErrors && Boolean(errors.qtyPurchased) && (
            <FieldError className={errorClassName}>
              {errors.qtyPurchased}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={showErrors && Boolean(errors.purchaseUnit)}>
          <ModalFieldLabel
            htmlFor="add-inventory-purchase-unit"
            label="Purchase Unit"
            tooltip={addInventoryItemTooltips.purchaseUnit}
            required
            className={labelClassName}
          />
          <Input
            id="add-inventory-purchase-unit"
            value={formData.purchaseUnit}
            onChange={(event) => onPurchaseUnitChange(event.target.value)}
            placeholder="e.g. Box, Sack, kg"
            aria-invalid={showErrors && Boolean(errors.purchaseUnit)}
            className={controlClassName}
          />
          {showErrors && Boolean(errors.purchaseUnit) && (
            <FieldError className={errorClassName}>
              {errors.purchaseUnit}
            </FieldError>
          )}
        </Field>
      </div>

      {formData.purchaseUnit && formData.unit && (
        <div className="flex flex-col gap-[var(--app-space-2)]">
          <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            {standardMultiplier
              ? `Automatic purchase conversion: 1 ${formData.purchaseUnit} = ${formatUnitConversionAmount(standardMultiplier)} ${formData.unit}.`
              : `Purchase conversion: enter how many ${formData.unit} are contained in 1 ${formData.purchaseUnit}.`}
          </p>

          {needsCustomMultiplier && (
            <Field
              className="min-w-0 sm:ml-auto sm:w-72"
              data-invalid={showErrors && Boolean(errors.purchaseMultiplier)}
            >
              <FieldLabel
                htmlFor="add-inventory-purchase-multiplier"
                className="sr-only"
              >
                Base units in one purchase unit
              </FieldLabel>
              <div className="flex items-center gap-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                <span className="shrink-0">1 {formData.purchaseUnit} =</span>
                <Input
                  id="add-inventory-purchase-multiplier"
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.purchaseMultiplier}
                  onChange={(event) =>
                    onFieldChange("purchaseMultiplier", event.target.value)
                  }
                  aria-invalid={showErrors && Boolean(errors.purchaseMultiplier)}
                  className={`${controlClassName} min-w-20 text-center`}
                />
                <span className="shrink-0">{formData.unit}</span>
              </div>
              {showErrors && Boolean(errors.purchaseMultiplier) && (
                <FieldError className={errorClassName}>
                  {errors.purchaseMultiplier}
                </FieldError>
              )}
            </Field>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
        <Field data-invalid={showErrors && Boolean(errors.minLevel)}>
          <ModalFieldLabel
            htmlFor="add-inventory-minimum-level"
            label={`Minimum Level (${formData.unit || "unit"})`}
            tooltip={addInventoryItemTooltips.minimumLevel}
            required
            className={labelClassName}
          />
          <Input
            id="add-inventory-minimum-level"
            type="text"
            inputMode={minimumLevelRules.inputMode}
            pattern={minimumLevelRules.pattern}
            value={formData.minLevel}
            onChange={(event) => {
              const value = event.target.value;
              if (minimumLevelRules.inputPattern.test(value)) {
                onFieldChange("minLevel", value);
              }
            }}
            placeholder="Enter minimum stock level"
            aria-invalid={showErrors && Boolean(errors.minLevel)}
            className={controlClassName}
          />
          {showErrors && Boolean(errors.minLevel) && (
            <FieldError className={errorClassName}>
              {errors.minLevel}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={showErrors && Boolean(errors.totalCost)}>
          <FieldLabel
            htmlFor="add-inventory-total-cost"
            className={labelClassName}
          >
            Total Cost
            <span className="text-[var(--app-color-danger)]">*</span>
          </FieldLabel>
          <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
            <InputGroupAddon className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] !px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-brand-number)]">
              ₱
            </InputGroupAddon>
            <InputGroupInput
              id="add-inventory-total-cost"
              type="number"
              min="0.01"
              step="any"
              value={formData.totalCost}
              onChange={(event) =>
                onFieldChange("totalCost", event.target.value)
              }
              placeholder="0.00"
              aria-invalid={showErrors && Boolean(errors.totalCost)}
              className="h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
            />
          </InputGroup>
          {showErrors && Boolean(errors.totalCost) && (
            <FieldError className={errorClassName}>
              {errors.totalCost}
            </FieldError>
          )}
        </Field>
      </div>

      {showCostBreakdown && (
        <div
          aria-live="polite"
          className="grid min-h-[var(--app-touch-target-min)] grid-cols-1 items-center gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] sm:grid-cols-2"
        >
          <div className="flex min-w-0 items-center justify-between gap-[var(--app-space-2)]">
            <p className="truncate text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              Cost per {formData.purchaseUnit} (Purchase Unit)
            </p>
            <p className="shrink-0 text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              {formatCurrency(costPerPurchaseUnit)}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-[var(--app-space-2)]">
            <p className="truncate text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              Cost per {formData.unit} (Base Unit)
            </p>
            <p className="shrink-0 text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              {formatCurrency(baseUnitCost)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default InitialPurchaseStep;
