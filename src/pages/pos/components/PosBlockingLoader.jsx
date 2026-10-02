const PosBlockingLoader = ({ isVisible, title, message }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pos-blocking-loader bg-black/40 p-[var(--app-space-4)]" role="status" aria-live="polite">
      <div className="flex w-full max-w-sm flex-col items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-6)] text-center shadow-[var(--app-shadow-card)]">
        <i className="bi bi-arrow-clockwise animate-spin text-[length:var(--app-font-size-h2)] text-[var(--app-color-brand)] motion-reduce:animate-none" aria-hidden="true" />
        <p className="text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]">{title}</p>
        {message && <span className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">{message}</span>}
      </div>
    </div>
  );
};

export default PosBlockingLoader;
