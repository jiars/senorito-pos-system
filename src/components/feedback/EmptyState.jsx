const EmptyState = ({
  title = "Nothing to show yet.",
  description,
  className = "",
}) => {
  return (
    <div
      aria-live="polite"
      className={`grid min-h-32 flex-1 place-items-center px-[var(--app-space-4)] text-center ${className}`}
      role="status"
    >
      <div>
        <p className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold text-[var(--app-color-text)]">
          {title}
        </p>

        {description && (
          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
