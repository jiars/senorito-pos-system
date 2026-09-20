import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ToolbarSearchInput = ({ placeholder, value, onValueChange }) => {
  return (
    <InputGroup className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-filter-font-color)] has-[[data-slot=input-group-control]:focus-visible]:border-[var(--app-color-border-subtle)] has-[[data-slot=input-group-control]:focus-visible]:ring-0">
      <InputGroupInput
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] placeholder:text-[var(--app-color-filter-font-color)] focus:!bg-transparent focus-visible:!border-0 focus-visible:!ring-0"
      />

      <InputGroupAddon
        align="inline-start"
        className="mx-1 text-[var(--app-color-filter-font-color)]"
      >
        <i
          aria-hidden="true"
          className="bi bi-search text-[length:var(--app-font-size-body-secondary)]"
        />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default ToolbarSearchInput;
