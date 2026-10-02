const CheckoutErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="pos-checkout-error flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-danger-border)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-danger)] shadow-[var(--app-shadow-card)]" role="alert">
      <i className="bi bi-exclamation-circle shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 break-words">{message}</span>
      <button type="button" className="flex size-[var(--app-touch-target-min)] shrink-0 items-center justify-center rounded-full hover:bg-[var(--app-color-danger-surface)]" onClick={onClose} aria-label="Close error">
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
};

export default CheckoutErrorBanner;
