const ModalStepper = ({
  steps,
  currentStep,
  paddingX = "var(--app-space-4)",
  className = "",
}) => {
  return (
    <nav
      aria-label="Form progress"
      className={`w-full min-w-0 ${className}`}
      style={{ paddingInline: paddingX }}
    >
      <ol className="mx-auto flex w-fit max-w-full items-center">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <li
              key={step.id}
              className="flex min-w-0 items-center"
            >
              <div
                aria-current={isActive ? "step" : undefined}
                className="flex min-w-0 items-center gap-[var(--app-space-2)]"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[length:var(--app-font-size-caption)] font-semibold leading-none ${
                    isActive
                      ? "bg-[var(--app-color-brand)] text-white"
                      : isComplete
                        ? "bg-[var(--app-color-brand-soft)] text-[var(--app-color-brand)]"
                        : "bg-[var(--app-color-filter-bg)] text-[var(--app-color-text-subtle)]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={`min-w-0 break-words text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] ${
                    isActive
                      ? "font-semibold text-[var(--app-color-text)]"
                      : "font-normal text-[var(--app-color-text-subtle)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-[var(--app-space-2)] h-px w-[var(--app-space-8)] shrink-0 max-sm:mx-[var(--app-space-1)] max-sm:w-[var(--app-space-4)] ${
                    isComplete
                      ? "bg-[var(--app-color-brand-soft)]"
                      : "bg-[var(--app-color-border-subtle)]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ModalStepper;
