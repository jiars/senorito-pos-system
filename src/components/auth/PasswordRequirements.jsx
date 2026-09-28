import { getPasswordRequirements } from "@/utils/validation/passwordValidation";

const passwordRuleLabels = [
  { key: "length", label: "8+ characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "lowercase", label: "Lowercase letter" },
  { key: "number", label: "At least 1 number" },
  { key: "symbol", label: "Special character" },
];

const PasswordRequirements = ({ password }) => {
  const requirements = getPasswordRequirements(password);

  if (password.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-2 space-y-1 px-2 text-xs"
      role="list"
      aria-label="Password requirements"
      aria-live="polite"
    >
      {passwordRuleLabels.map((rule) => {
        const hasPassed = requirements[rule.key];

        return (
          <div
            key={rule.key}
            role="listitem"
            className={`flex items-center gap-2 ${
              hasPassed
                ? "text-[var(--app-color-success)]"
                : "text-[var(--app-color-text-muted)]"
            }`}
          >
            <i
              className={`bi ${
                hasPassed ? "bi-check-circle-fill" : "bi-x-circle"
              }`}
              aria-hidden="true"
            />
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordRequirements;
