const VoidStockHandlingField = ({ value, onChange, canReturnStock, disabled, error }) => {
  const options = [
    { value: "keep_deducted", label: "Keep stock deducted", description: "The order was prepared or ingredients were already used." },
    { value: "return_stock", label: "Return unused stock", description: "Nothing was prepared. Restore all ingredient and add-on deductions." },
  ];

  return (
    <fieldset disabled={disabled} aria-describedby={error ? "void-stock-choice-help void-stock-help void-stock-error" : "void-stock-choice-help void-stock-help"} className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
      <legend className="mb-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold">Stock handling<span className="ml-[var(--app-space-1)] text-[var(--app-color-danger)]" aria-hidden="true">*</span></legend>
      <p id="void-stock-choice-help" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">Choose one before approving. No stock choice is needed to reject.</p>
      <div className="grid grid-cols-1 gap-[var(--app-space-2)] sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex min-h-[var(--app-touch-target-min)] cursor-pointer items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] hover:bg-[var(--app-color-control-hover)] has-[:checked]:border-[var(--app-color-brand)] has-[:checked]:bg-[var(--app-color-control-hover)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--app-color-brand)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
            <input type="radio" name="void-stock-handling" value={option.value} checked={value === option.value}
              onChange={() => onChange(option.value)} disabled={option.value === "return_stock" && !canReturnStock}
              aria-invalid={Boolean(error)} className="mt-1 size-4 shrink-0 accent-[var(--app-color-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]" />
            <span className="flex min-w-0 flex-col gap-[var(--app-space-1)]">
              <span className="text-[length:var(--app-font-size-body-secondary)] font-semibold">{option.label}</span>
              <span className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      <p id="void-stock-help" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
        {canReturnStock ? "Full-order return only. Original batches must exist and be unexpired." : "Stock tracking is unavailable for this order. Only Keep stock deducted is available."}
      </p>
      {error && <p id="void-stock-error" role="alert" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]">{error}</p>}
    </fieldset>
  );
};

export default VoidStockHandlingField;
