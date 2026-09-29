import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  controlClassName, errorClassName, labelClassName,
  stepPanelClassName, toggleClassName,
} from "@/pages/menu/modals/shared/menuModalClasses";

const GeneralStep = ({
  headingRef, addonName, isAvailable, categories, selectedCategories,
  errors, onNameChange, onAvailabilityChange, onCategoryToggle,
}) => {
  return (
    <section aria-labelledby="add-addon-general" className={stepPanelClassName}>
      <h2 id="add-addon-general" ref={headingRef} tabIndex={-1} className="sr-only">General add-on information</h2>
      <Field data-invalid={Boolean(errors.addonName)}>
        <FieldLabel htmlFor="add-addon-name" className={labelClassName}>Add-on Name <span className="text-[var(--app-color-danger)]">*</span></FieldLabel>
        <Input id="add-addon-name" value={addonName} onChange={(event) => onNameChange(event.target.value)} placeholder="e.g. Extra Shot" className={controlClassName} aria-invalid={Boolean(errors.addonName)} aria-describedby={errors.addonName ? "add-addon-name-error" : undefined} />
        {errors.addonName && <FieldError id="add-addon-name-error" className={errorClassName}>{errors.addonName}</FieldError>}
      </Field>

      <Field data-invalid={Boolean(errors.categories)}>
        <span id="add-addon-categories-label" className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">Apply to Categories <span className="text-[var(--app-color-danger)]">*</span></span>
        <div role="group" aria-labelledby="add-addon-categories-label" aria-describedby={errors.categories ? "add-addon-categories-error" : undefined} className="grid max-h-[min(30svh,14rem)] grid-cols-2 gap-x-[var(--app-gap-related)] gap-y-[var(--app-space-2)] overflow-y-auto px-[var(--app-space-2)] py-[var(--app-space-1)] sm:grid-cols-4 sm:px-[var(--app-space-6)]">
          {categories.map((category) => (
            <label key={category.id} className="flex min-w-0 min-h-[var(--app-touch-target-min)] cursor-pointer items-center gap-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onCategoryToggle(category.id)}
                className="size-[18px] border-[var(--app-color-border)] bg-[var(--app-color-filter-checkbox-surface)] data-checked:border-[var(--app-color-brand)] data-checked:bg-[var(--app-color-brand)] data-checked:text-white"
              />
              <span className="min-w-0 break-words">{category.category_name}</span>
            </label>
          ))}
          {categories.length === 0 && <p className="col-span-full text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">No categories found.</p>}
        </div>
        {errors.categories && <FieldError id="add-addon-categories-error" className={errorClassName}>{errors.categories}</FieldError>}
      </Field>
      <button type="button" role="switch" aria-checked={isAvailable} onClick={onAvailabilityChange} className={toggleClassName}>
        <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${isAvailable ? "bg-[var(--app-color-brand)]" : "bg-[var(--app-color-border-subtle)]"}`}>
          <span className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${isAvailable ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
        </span>
        Available for sale
      </button>
    </section>
  );
};

export default GeneralStep;
