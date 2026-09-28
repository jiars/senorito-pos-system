import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const iconToneClasses = {
  danger: "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]",
  warning:
    "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]",
  success:
    "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]",
  neutral: "bg-[var(--app-color-filter-bg)] text-[var(--app-color-text-muted)]",
};

const actionToneClasses = {
  danger:
    "border-transparent bg-[var(--app-color-confirm-danger)] text-white hover:bg-[var(--app-color-confirm-danger)]/90",
  warning:
    "border-transparent bg-[var(--app-color-warning)] text-white hover:bg-[var(--app-color-warning)]/90",
  success:
    "border-transparent bg-[var(--app-color-confirm-success)] text-white hover:bg-[var(--app-color-confirm-success)]/90",
  brand:
    "border-transparent bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)]",
  secondary:
    "border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)]",
};

const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  iconClassName = "bi bi-exclamation-lg",
  tone = "neutral",
  details = [],
  actions = [],
  error = "",
  maxWidth = "24rem",
}) => {
  const isBusy = actions.some((action) => action.isLoading);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isBusy) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        overlayClassName="!z-[1000] !bg-black/40"
        className="!z-[1001] !w-[calc(100%-2rem)] !max-w-[var(--confirmation-modal-max-width)] !gap-[var(--app-gap-columns)] !rounded-[var(--app-radius-panel-standard)] !border !border-[var(--app-color-border-subtle)] !bg-[var(--app-color-surface)] !p-[var(--app-space-6)] !shadow-[var(--app-shadow-card)] !ring-0"
        style={{
          "--confirmation-modal-max-width": maxWidth,
        }}
      >
        <AlertDialogHeader className="!flex !flex-col !items-center !gap-[var(--app-gap-related)] !text-center">
          <AlertDialogMedia
            className={`!mb-0 !size-10 !shrink-0 !rounded-full ${
              iconToneClasses[tone] || iconToneClasses.neutral
            }`}
          >
            <i aria-hidden="true" className={`${iconClassName} text-xl`} />
          </AlertDialogMedia>

          <AlertDialogTitle className="text-[length:var(--app-font-size-h3)] font-semibold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="max-w-[30rem] text-center text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {details.length > 0 && (
          <dl className="grid grid-cols-1 gap-[var(--app-space-1)] sm:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.key || detail.label}
                className="flex min-w-0 items-center gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] px-[var(--app-space-3)] py-[var(--app-space-3)]"
              >
                {detail.iconClassName && (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--app-color-border)] text-[var(--app-color-surface)]">
                    <i
                      aria-hidden="true"
                      className={`${detail.iconClassName} text-base`}
                    />
                  </span>
                )}

                <div className="min-w-0">
                  <dt className="text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                    {detail.label}
                  </dt>

                  <dd className="break-words text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]">
                    {detail.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-3)] py-[var(--app-space-2)] text-center text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter className="!m-0 !flex !flex-col !gap-[var(--app-gap-related)] !border-0 !bg-transparent !p-0">
          {actions.map((action) => {
            const label = action.isLoading
              ? action.loadingLabel || "Processing..."
              : action.label;

            const className = `min-h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium ${
              actionToneClasses[action.tone] || actionToneClasses.secondary
            }`;

            if (action.close) {
              return (
                <AlertDialogCancel
                  key={action.key}
                  disabled={isBusy || action.disabled}
                  onClick={action.onClick}
                  className={className}
                >
                  {label}
                </AlertDialogCancel>
              );
            }

            return (
              <AlertDialogAction
                key={action.key}
                type="button"
                disabled={isBusy || action.disabled}
                onClick={action.onClick}
                className={className}
              >
                {label}
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
