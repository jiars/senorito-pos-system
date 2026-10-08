import ModalFieldLabel from "@/components/modals/ModalFieldLabel";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

import {
  controlClassName,
  errorClassName,
  labelClassName,
  stepPanelClassName,
} from "../addInventoryItemClasses";
import { addInventoryItemTooltips } from "../addInventoryItemTooltips";

const RecipeConversionStep = ({
  validation,
  conversions,
  baseUnit,
  showErrors,
  getBaseUnitCost,
  onAddConversion,
  onRemoveConversion,
  onConversionChange,
}) => {
  const baseUnitCost = getBaseUnitCost();

  return (
    <section
      aria-labelledby="add-inventory-conversion-step"
      className={stepPanelClassName}
    >
      <div>
        <h2
          id="add-inventory-conversion-step"
          className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
        >
          Recipe Conversion
        </h2>
        <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
          Add only the alternate units used when preparing menu recipes.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_var(--app-touch-target-min)] gap-[var(--app-space-2)]">
        <ModalFieldLabel
          htmlFor={`add-inventory-converted-unit-${conversions[0]?.id || "first"}`}
          label="Converted Unit"
          tooltip={addInventoryItemTooltips.recipeConversion}
          className={labelClassName}
        />
        <span className={labelClassName}>
          Equivalent Amount in {baseUnit || "Base Unit"}
        </span>
        <span aria-hidden="true" />
      </div>

      {conversions.map((conversion, index) => {
        const equivalent = Number(conversion.equivalent);
        const hasUnit = Boolean(conversion.unit.trim());
        const rowErrors = validation.errors.conversions?.[conversion.id] || {};
        const isUnitInvalid = Boolean(rowErrors.unit);
        const isEquivalentInvalid = Boolean(rowErrors.equivalent);
        const conversionCost =
          baseUnitCost !== null && hasUnit && !isEquivalentInvalid
            ? baseUnitCost * equivalent
            : null;

        return (
          <div
            key={conversion.id}
            className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_var(--app-touch-target-min)] items-start gap-[var(--app-space-2)]"
          >
            <Field data-invalid={showErrors && isUnitInvalid}>
              <Input
                id={`add-inventory-converted-unit-${conversion.id}`}
                aria-label={`Converted unit ${index + 1}`}
                value={conversion.unit}
                onChange={(event) =>
                  onConversionChange(
                    conversion.id,
                    "unit",
                    event.target.value,
                  )
                }
                placeholder="e.g. shot, tbsp"
                aria-invalid={showErrors && isUnitInvalid}
                className={controlClassName}
              />
              {showErrors && isUnitInvalid && (
                <FieldError className={errorClassName}>
                  {rowErrors.unit}
                </FieldError>
              )}
            </Field>

            <Field data-invalid={showErrors && isEquivalentInvalid}>
              <Input
                id={`add-inventory-equivalent-${conversion.id}`}
                aria-label={`Equivalent amount in ${baseUnit || "base unit"} for converted unit ${index + 1}`}
                type="number"
                min="0.01"
                step="any"
                value={conversion.equivalent}
                onChange={(event) =>
                  onConversionChange(
                    conversion.id,
                    "equivalent",
                    event.target.value,
                  )
                }
                placeholder="Enter amount"
                aria-invalid={showErrors && isEquivalentInvalid}
                className={controlClassName}
              />
              {conversionCost !== null && (
                <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                  Estimated cost: {formatCurrency(conversionCost)} per{" "}
                  {conversion.unit}
                </p>
              )}
              {showErrors && isEquivalentInvalid && (
                <FieldError className={errorClassName}>
                  {rowErrors.equivalent}
                </FieldError>
              )}
            </Field>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onRemoveConversion(conversion.id)}
              className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-danger)] hover:bg-[var(--app-color-danger-surface)]"
              aria-label={`Remove converted unit ${index + 1}`}
            >
              <i className="bi bi-trash" aria-hidden="true" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={onAddConversion}
        className="min-h-[var(--app-touch-target-min)] w-fit rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-brand)] hover:bg-[var(--app-color-control-hover)]"
      >
        <i className="bi bi-plus-lg" aria-hidden="true" />
        Add Converted Unit
      </Button>
    </section>
  );
};

export default RecipeConversionStep;
