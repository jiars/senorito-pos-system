import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { calculateEstCost, calculateProfit, calculateMargin } from "@/utils/menu/pricingCalculations";
import { getSellingPriceError, MAX_SELLING_PRICE } from "@/utils/menu/validation/sellingPriceValidation";
import { getQuantityRules } from "@/utils/inventory/quantityRules";
import IngredientStockNotice from "@/pages/menu/components/IngredientStockNotice";
import {
  addButtonClassName, comboClassName, controlClassName, errorClassName,
  labelClassName, optionClassName, popupClassName, removeButtonClassName,
  stepPanelClassName,
} from "@/pages/menu/modals/shared/menuModalClasses";

import "../addAddonLayout.css";

const RecipePricingStep = ({
  headingRef,
  recipe,
  inventoryItems,
  errors,
  disabled,
  onRecipeChange,
  onAddIngredient,
  className = "",
}) => {
  const prefix = "addon";
  const priceError = errors.sellingPrice;
  const estimatedCost = calculateEstCost(recipe.ingredients, inventoryItems);
  const canPreviewPrice = !getSellingPriceError(recipe.sellingPrice) && Number.isFinite(estimatedCost);
  let profitDisplay = "—";
  let marginDisplay = "—";
  if (canPreviewPrice) {
    const profit = calculateProfit(recipe.sellingPrice, estimatedCost);
    const margin = calculateMargin(profit, recipe.sellingPrice);
    profitDisplay = profit.toFixed(2);
    marginDisplay = `${margin.toFixed(2)}%`;
  }
  const metrics = [
    { key: "price", label: "Selling Price", value: recipe.sellingPrice, editable: true },
    { key: "cost", label: "Est. Cost", value: estimatedCost.toFixed(2) },
    { key: "profit", label: "Profit", value: profitDisplay },
    { key: "margin", label: "Margin", value: marginDisplay, percentage: true },
  ];

  const updateIngredient = (ingredientId, field, value) => {
    onRecipeChange((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient) => {
        if (ingredient.id !== ingredientId) return ingredient;

        const nextIngredient = { ...ingredient, [field]: value };
        if (field === "ingredientId") {
          const selectedItem = inventoryItems.find((item) => item.id === value);
          nextIngredient.unit = selectedItem ? selectedItem.base_unit : "";
        }
        return nextIngredient;
      }),
    }));
  };

  const removeIngredient = (ingredientId) => {
    onRecipeChange((current) => {
      if (current.ingredients.length === 1) return current;

      return {
        ...current,
        ingredients: current.ingredients.filter((ingredient) => ingredient.id !== ingredientId),
      };
    });
  };

  return (
    <section aria-labelledby="add-addon-recipe-pricing" className={`${stepPanelClassName} ${className}`}>
      <h2 id="add-addon-recipe-pricing" ref={headingRef} tabIndex={-1} className="sr-only">
        Recipe and pricing
      </h2>
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[var(--app-space-2)] sm:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
        {metrics.map((metric) => (
          <Field key={metric.key} className="min-w-0" data-invalid={Boolean(metric.editable && priceError)}>
            <FieldLabel htmlFor={`${prefix}-${metric.key}`} className={labelClassName}>{metric.label}{metric.editable && <span className="text-[var(--app-color-danger)]">*</span>}</FieldLabel>
            {metric.editable ? (
              <InputGroup className={`${comboClassName} overflow-hidden`}>
                <InputGroupAddon className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-2)]" aria-hidden="true">₱</InputGroupAddon>
                <InputGroupInput id={`${prefix}-${metric.key}`} type="number" min="0.01" max={MAX_SELLING_PRICE} step="0.01" placeholder="0.00" value={metric.value} onChange={(event) => onRecipeChange((current) => ({ ...current, sellingPrice: event.target.value }))} aria-invalid={Boolean(priceError)} aria-describedby={priceError ? `${prefix}-price-error` : undefined} className="min-w-0 text-[length:var(--app-font-size-body-secondary)]" />
              </InputGroup>
            ) : (
              <output id={`${prefix}-${metric.key}`} className="flex min-h-[var(--app-touch-target-min)] min-w-0 items-center gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                {!metric.percentage && <span aria-hidden="true" className="shrink-0">₱</span>}
                <span className="min-w-0 [overflow-wrap:anywhere] tabular-nums">{metric.value}</span>
              </output>
            )}
            {metric.editable && priceError && <FieldError id={`${prefix}-price-error`} className={errorClassName}>{priceError}</FieldError>}
          </Field>
        ))}
      </div>

      <div>
        <h3 className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">Recipe / Ingredient Deduction</h3>
        <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">Select ingredients that will be deducted from inventory when sold.</p>
      </div>

      <div aria-hidden="true" className="add-addon-ingredient-row !hidden sm:!grid">
        {["Ingredient *", "Quantity *", "Unit *", "Est. Cost"].map((label) => <span key={label} className={labelClassName}>{label}</span>)}
        <span />
      </div>
      {recipe.ingredients.map((ingredient, ingredientIndex) => {
        const ingredientPrefix = `ing_${ingredient.id}`;
        const selectedItem = inventoryItems.find((item) => item.id === ingredient.ingredientId) || null;
        const units = selectedItem ? [selectedItem.base_unit, ...new Set((selectedItem.inventory_conversion_units || []).map((unit) => unit.converted_unit).filter((unit) => unit !== selectedItem.base_unit))] : [];
        const rowCost = calculateEstCost([ingredient], inventoryItems);
        const idError = errors[`${ingredientPrefix}_id`];
        const qtyError = errors[`${ingredientPrefix}_qty`];
        const unitError = errors[`${ingredientPrefix}_unit`];

        return (
          <div key={ingredient.id} className="add-addon-ingredient-row">
            <Field className="add-addon-ingredient-picker min-w-0" data-invalid={Boolean(idError)}>
              <FieldLabel htmlFor={`${ingredientPrefix}-item`} className={`${labelClassName} sm:sr-only`}>Ingredient {ingredientIndex + 1} *</FieldLabel>
              <Combobox disabled={disabled} items={inventoryItems} value={selectedItem} onValueChange={(item) => updateIngredient(ingredient.id, "ingredientId", item?.id ?? "")} itemToStringLabel={(item) => item?.item_name || ""} itemToStringValue={(item) => String(item?.id || "")} isItemEqualToValue={(item, value) => item?.id === value?.id}>
                <ComboboxInput id={`${ingredientPrefix}-item`} placeholder="Search ingredient" className={comboClassName} aria-invalid={Boolean(idError)} aria-describedby={idError ? `${ingredientPrefix}-item-error` : undefined} />
                <ComboboxContent positionerClassName="!z-[1100]" className={popupClassName}>
                  <ComboboxEmpty>No ingredient found.</ComboboxEmpty>
                  <ComboboxList>{(item) => (
                    <ComboboxItem key={item.id} value={item} className={optionClassName}>
                      <span className="min-w-0 break-words">{item.item_name} <span className="text-[length:var(--app-font-size-caption)] italic text-[var(--app-color-text-muted)]">— ₱{Number(item.cost_per_unit || 0).toFixed(2)}/{item.base_unit}</span></span>
                    </ComboboxItem>
                  )}</ComboboxList>
                </ComboboxContent>
              </Combobox>
              <IngredientStockNotice ingredient={selectedItem} quantity={ingredient.qty} unit={ingredient.unit} />
              {idError && <FieldError id={`${ingredientPrefix}-item-error`} className={errorClassName}>{idError}</FieldError>}
            </Field>
            <Field className="min-w-0" data-invalid={Boolean(qtyError)}>
              <FieldLabel htmlFor={`${ingredientPrefix}-qty`} className={`${labelClassName} sm:sr-only`}>Quantity {ingredientIndex + 1} *</FieldLabel>
              <Input id={`${ingredientPrefix}-qty`} type="number" min="0" step={getQuantityRules(ingredient.unit).step} inputMode={getQuantityRules(ingredient.unit).inputMode} placeholder="0" value={ingredient.qty} onChange={(event) => updateIngredient(ingredient.id, "qty", event.target.value)} className={controlClassName} aria-invalid={Boolean(qtyError)} aria-describedby={qtyError ? `${ingredientPrefix}-qty-error` : undefined} />
              {qtyError && <FieldError id={`${ingredientPrefix}-qty-error`} className={errorClassName}>{qtyError}</FieldError>}
            </Field>
            <Field className="min-w-0" data-invalid={Boolean(unitError)}>
              <FieldLabel htmlFor={`${ingredientPrefix}-unit`} className={`${labelClassName} sm:sr-only`}>Unit {ingredientIndex + 1} *</FieldLabel>
              <Combobox disabled={disabled || !selectedItem} items={units} value={ingredient.unit || null} onValueChange={(unit) => updateIngredient(ingredient.id, "unit", unit || "")}>
                <ComboboxInput id={`${ingredientPrefix}-unit`} disabled={disabled || !selectedItem} placeholder="Unit" className={comboClassName} aria-invalid={Boolean(unitError)} aria-describedby={unitError ? `${ingredientPrefix}-unit-error` : undefined} />
                <ComboboxContent positionerClassName="!z-[1100]" className={popupClassName}>
                  <ComboboxEmpty>No unit found.</ComboboxEmpty>
                  <ComboboxList>{(unit) => <ComboboxItem key={unit} value={unit} className={optionClassName}>{unit}{unit === selectedItem?.base_unit ? " (Base)" : ""}</ComboboxItem>}</ComboboxList>
                </ComboboxContent>
              </Combobox>
              {unitError && <FieldError id={`${ingredientPrefix}-unit-error`} className={errorClassName}>{unitError}</FieldError>}
            </Field>
            <Field className="min-w-0">
              <FieldLabel htmlFor={`${ingredientPrefix}-cost`} className={`${labelClassName} sm:sr-only`}>Est. Cost {ingredientIndex + 1}</FieldLabel>
              <InputGroup className={`${comboClassName} overflow-hidden bg-[var(--app-color-filter-bg)]`}>
                <InputGroupAddon aria-hidden="true" className="h-full border-r border-[var(--app-color-border-subtle)] px-[var(--app-space-2)]">₱</InputGroupAddon>
                <InputGroupInput id={`${ingredientPrefix}-cost`} readOnly value={rowCost.toFixed(2)} className="min-w-0 text-[length:var(--app-font-size-body-secondary)]" />
              </InputGroup>
            </Field>
            <Button type="button" variant="outline" size="icon" disabled={recipe.ingredients.length === 1} className={`${removeButtonClassName} add-addon-ingredient-remove`} title={recipe.ingredients.length === 1 ? "At least one ingredient is required." : "Remove ingredient"} aria-label={`Remove ingredient ${ingredientIndex + 1}`} onClick={() => removeIngredient(ingredient.id)}>
              <i aria-hidden="true" className="bi bi-trash" />
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={onAddIngredient} className={addButtonClassName}><i aria-hidden="true" className="bi bi-plus-lg" /> Add Ingredient</Button>
    </section>
  );
};

export default RecipePricingStep;
