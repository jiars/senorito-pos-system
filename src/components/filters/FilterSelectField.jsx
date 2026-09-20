import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

/**
 * Shared select field styled like FilterDateRange. Keep report-period options
 * to the approved presets; a manual range displays as Custom but is not a menu option.
 */
const FilterSelectField = ({
  id,
  label,
  value,
  options,
  onValueChange,
}) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Field>
      <FieldLabel
        htmlFor={id}
        className="text-[length:var(--app-font-size-body-secondary)] font-normal leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]"
      >
        {label}
      </FieldLabel>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="data-[size=default]:!h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] !border-[var(--app-color-border-subtle)] !bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] hover:!bg-[var(--app-color-control-hover)] [&>svg]:size-[14px]"
        >
          <span>{selectedOption?.label ?? value}</span>
        </SelectTrigger>

        <SelectContent className="z-[60]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default FilterSelectField;
