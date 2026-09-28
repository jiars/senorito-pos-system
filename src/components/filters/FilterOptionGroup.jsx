import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldLabel } from "@/components/ui/field";

const FilterOptionGroup = ({
  id,
  label,
  options,
  selectedValues,
  onSelectedValuesChange,
  selectionMode = "multiple",
  defaultOpen = false,
  collapsible = true,
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleCheckedChange = (value, isChecked) => {
    const nextValues =
      selectionMode === "single"
        ? isChecked
          ? [value]
          : []
        : isChecked
          ? [...selectedValues, value]
          : selectedValues.filter((selectedValue) => selectedValue !== value);

    onSelectedValuesChange(nextValues);
  };

  const optionRows = options.map((option) => {
    const optionId = `${id}-${option.value}`;
    const isChecked = selectedValues.includes(option.value);

    return (
      <Field
        key={option.value}
        orientation="horizontal"
        className="min-h-[var(--app-touch-target-min)] cursor-pointer rounded-[var(--app-radius-nested)] bg-[var(--app-color-surface)] px-[var(--app-space-4)]"
      >
        <Checkbox
          id={optionId}
          checked={isChecked}
          onCheckedChange={(checked) =>
            handleCheckedChange(option.value, checked)
          }
          className="!bg-[var(--app-color-filter-checkbox-surface)] data-checked:!border-[var(--app-color-brand)] data-checked:!bg-[var(--app-color-brand)]"
        />

        <FieldLabel
          htmlFor={optionId}
          className="cursor-pointer text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text)]"
        >
          {option.label}
        </FieldLabel>

        {option.indicator && (
          <span
            aria-hidden="true"
            className="ml-auto size-2 rounded-full bg-[#46B549]"
          />
        )}
      </Field>
    );
  });

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-[var(--app-space-2)]">
        {showLabel && (
          <p className="text-[length:var(--app-font-size-body-secondary)] font-normal text-[var(--app-color-text-subtle)]">
            {label}
          </p>
        )}
        {optionRows}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-[var(--app-space-2)]"
      >
        <CollapsibleTrigger
          type="button"
          className="flex w-full appearance-none items-center justify-between border-0 bg-transparent p-0 text-left text-[length:var(--app-font-size-body-secondary)] font-normal text-[var(--app-color-text-subtle)] outline-none focus-visible:ring-0"
        >
          {label}
          <i
            aria-hidden="true"
            className={`bi bi-chevron-down text-[length:var(--app-font-size-body-secondary)] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col gap-[var(--app-space-2)] pt-0">
          {optionRows}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterOptionGroup;
