import { addYears, startOfDay } from "date-fns";
import DatePicker from "@/components/ui/date-picker";
import ModalFieldLabel from "@/components/modals/ModalFieldLabel";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  controlClassName,
  errorClassName,
  labelClassName,
  stepPanelClassName,
} from "../addInventoryItemClasses";
import { addInventoryItemTooltips } from "../addInventoryItemTooltips";

const GeneralStep = ({
  formData,
  categories,
  units,
  showErrors,
  validation,
  onFieldChange,
}) => {
  const { errors } = validation;
  const minExpirationDate = startOfDay(new Date());
  const maxExpirationDate = addYears(minExpirationDate, 10);
  const filteredUnits = units.filter((currentUnit) => {
    const normalizedUnit = currentUnit.toLowerCase();
    return normalizedUnit !== "kg" && normalizedUnit !== "bottle";
  });
  const selectedCategory = categories.find(
    (currentCategory) =>
      String(currentCategory.id) === String(formData.category),
  );

  const handleExpiryToggle = () => {
    const nextTrackExpiry = !formData.trackExpiry;
    onFieldChange("trackExpiry", nextTrackExpiry);

    if (!nextTrackExpiry) {
      onFieldChange("expiryDate", "");
    }
  };

  return (
    <section
      aria-labelledby="add-inventory-general-step"
      className={stepPanelClassName}
    >
      <h2 id="add-inventory-general-step" className="sr-only">
        General inventory information
      </h2>

      <Field
        data-invalid={
          showErrors && Boolean(errors.itemName)
        }
      >
        <FieldLabel htmlFor="add-inventory-item-name" className={labelClassName}>
          Item Name
          <span className="text-[var(--app-color-danger)]">*</span>
        </FieldLabel>
        <Input
          id="add-inventory-item-name"
          value={formData.itemName}
          onChange={(event) => onFieldChange("itemName", event.target.value)}
          placeholder="e.g. Espresso Beans, Kraft Cups"
          aria-invalid={
            showErrors && Boolean(errors.itemName)
          }
          className={controlClassName}
        />
        {showErrors && errors.itemName && (
          <FieldError className={errorClassName}>{errors.itemName}</FieldError>
        )}
      </Field>

      <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
        <Field data-invalid={showErrors && Boolean(errors.category)}>
          <FieldLabel
            htmlFor="add-inventory-category"
            className={labelClassName}
          >
            Category
            <span className="text-[var(--app-color-danger)]">*</span>
          </FieldLabel>
          <Combobox
            items={categories}
            value={selectedCategory || null}
            onValueChange={(value) =>
              onFieldChange("category", value ? String(value.id) : "")
            }
            itemToStringLabel={(category) => category?.category_name || ""}
            itemToStringValue={(category) => String(category?.id || "")}
            isItemEqualToValue={(category, value) =>
              String(category?.id) === String(value?.id)
            }
          >
            <ComboboxInput
              id="add-inventory-category"
              placeholder="Select category"
              aria-invalid={showErrors && Boolean(errors.category)}
              className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] shadow-none has-aria-invalid:border-[var(--app-color-danger)]"
            />
            <ComboboxContent
              positionerClassName="!z-[1100]"
              className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
            >
              <ComboboxEmpty>No category found.</ComboboxEmpty>
              <ComboboxList>
                {(currentCategory) => (
                  <ComboboxItem
                    key={currentCategory.id}
                    value={currentCategory}
                    className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                  >
                    {currentCategory.category_name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {showErrors && Boolean(errors.category) && (
            <FieldError className={errorClassName}>
              {errors.category}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={showErrors && Boolean(errors.unit)}>
          <ModalFieldLabel
            htmlFor="add-inventory-base-unit"
            label="Base Unit"
            tooltip={addInventoryItemTooltips.baseUnit}
            required
            className={labelClassName}
          />
          <Combobox
            items={filteredUnits}
            value={formData.unit || null}
            onValueChange={(value) => onFieldChange("unit", value || "")}
            itemToStringLabel={(unit) => unit || ""}
            itemToStringValue={(unit) => unit || ""}
          >
            <ComboboxInput
              id="add-inventory-base-unit"
              placeholder="Select base unit"
              aria-invalid={showErrors && Boolean(errors.unit)}
              className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] shadow-none has-aria-invalid:border-[var(--app-color-danger)]"
            />
            <ComboboxContent
              positionerClassName="!z-[1100]"
              className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
            >
              <ComboboxEmpty>No base unit found.</ComboboxEmpty>
              <ComboboxList>
                {(currentUnit) => (
                  <ComboboxItem
                    key={currentUnit}
                    value={currentUnit}
                    className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                  >
                    {currentUnit}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {showErrors && Boolean(errors.unit) && (
            <FieldError className={errorClassName}>
              {errors.unit}
            </FieldError>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 items-end gap-[var(--app-gap-related)] sm:grid-cols-2">
        <Field>
          <FieldLabel className={labelClassName}>Track Expiry</FieldLabel>
          <button
            type="button"
            role="switch"
            aria-checked={formData.trackExpiry}
            onClick={handleExpiryToggle}
            className="flex min-h-[var(--app-touch-target-min)] w-full items-center gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-left"
          >
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                formData.trackExpiry
                  ? "bg-[var(--app-color-brand)]"
                  : "bg-[var(--app-color-border-subtle)]"
              }`}
            >
              <span
                className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform ${
                  formData.trackExpiry
                    ? "translate-x-[23px]"
                    : "translate-x-[3px]"
                }`}
              />
            </span>
            <span className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              Track expiry for this item
            </span>
          </button>
        </Field>

        {formData.trackExpiry && (
          <Field data-invalid={showErrors && Boolean(errors.expiryDate)}>
            <FieldLabel
              htmlFor="add-inventory-expiration-date"
              className={labelClassName}
            >
              Expiration Date
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>
            <DatePicker
              id="add-inventory-expiration-date"
              value={formData.expiryDate}
              onValueChange={(value) => onFieldChange("expiryDate", value)}
              placeholder="MM/DD/YYYY"
              minDate={minExpirationDate}
              maxDate={maxExpirationDate}
              invalid={showErrors && Boolean(errors.expiryDate)}
              triggerClassName={controlClassName}
            />
            {showErrors && errors.expiryDate && (
              <FieldError className={errorClassName}>{errors.expiryDate}</FieldError>
            )}
          </Field>
        )}
      </div>
    </section>
  );
};

export default GeneralStep;
