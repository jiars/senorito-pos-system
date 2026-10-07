import { useLayoutEffect, useRef, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { formatEmployeeContactNumber, getEmployeeContactCaret, getNationalMobileNumber, normalizeEmployeeContactInput } from "@/utils/employees/employeeContactNumber";

const EmployeeContactInput = ({ id, value, onValueChange, disabled = false, ...props }) => {
  const inputRef = useRef(null);
  const [caret, setCaret] = useState(null);

  useLayoutEffect(() => {
    if (caret && inputRef.current) {
      inputRef.current.setSelectionRange(caret.position, caret.position);
    }
  }, [caret]);

  const updateNumber = (number, digitCount) => {
    onValueChange(number);
    setCaret({ position: getEmployeeContactCaret(formatEmployeeContactNumber(number), digitCount) });
  };

  const handleChange = (event) => {
    const rawValue = event.target.value;
    const number = normalizeEmployeeContactInput(rawValue);
    let digitCount = rawValue.slice(0, event.target.selectionStart).replace(/\D/g, "").length;
    if (rawValue.startsWith("0")) digitCount = Math.max(0, digitCount - 1);
    if (number !== null) updateNumber(number, digitCount);
  };

  const handleKeyDown = (event) => {
    const input = event.currentTarget;
    const position = input.selectionStart;
    if (position !== input.selectionEnd) return;
    const isBackspace = event.key === "Backspace";
    const isDelete = event.key === "Delete";
    if (!isBackspace && !isDelete) return;
    let separatorPosition = position;
    if (isBackspace) separatorPosition -= 1;
    if (input.value[separatorPosition] !== "-") return;

    event.preventDefault();
    const nationalNumber = getNationalMobileNumber(value);
    const digitCount = input.value.slice(0, position).replace(/\D/g, "").length;
    let removedDigit = digitCount;
    if (isBackspace) removedDigit -= 1;
    const nextNumber = nationalNumber.slice(0, removedDigit) + nationalNumber.slice(removedDigit + 1);
    updateNumber(normalizeEmployeeContactInput(nextNumber), removedDigit);
  };

  const handlePaste = (event) => {
    const pastedNumber = event.clipboardData.getData("text");
    const number = normalizeEmployeeContactInput(pastedNumber);
    // Full mobile numbers replace the field; partial paste uses normal editing.
    if (/^(?:\+63|63|0)?9[\d\s()-]+$/.test(pastedNumber.trim())
      && number !== null && number.length === 11) {
      event.preventDefault();
      updateNumber(number, 10);
    }
  };

  return (
    <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
      <InputGroupAddon className="h-full shrink-0 border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] !px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)]">
        +63
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="912-3456-789"
        value={formatEmployeeContactNumber(value)}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        className="h-full min-w-0 px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
      />
    </InputGroup>
  );
};

export default EmployeeContactInput;
