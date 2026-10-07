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

const actionToneClasses = {
  brand: "border-transparent bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)]",
  success: "border-transparent bg-[var(--app-color-confirm-success)] text-white hover:opacity-90",
  danger: "border-transparent bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)] hover:opacity-90",
  secondary: "border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)]",
};

// Presentation only. The caller owns async actions, errors, and when to close.
// type: "small" | "small-media" | "destructive"
// actions: [{ key, label, onClick, close?, tone?, disabled?, isLoading?, loadingLabel? }]
const ActionAlertDialog = ({
  open,
  onOpenChange,
  type = "small",
  title,
  description,
  iconClassName,
  actions = [],
  error = "",
  children,
}) => {
  const isDestructive = type === "destructive";
  const hasMedia = type === "small-media" || isDestructive;
  const isBusy = actions.some((action) => action.isLoading);
  let mediaIcon = iconClassName || "bi bi-info-circle";
  let mediaTone = "bg-[var(--app-color-filter-bg)] text-[var(--app-color-text-muted)]";

  if (isDestructive) {
    mediaIcon = iconClassName || "bi bi-trash";
    mediaTone = "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
  }

  const handleOpenChange = (nextOpen, details) => {
    if (!nextOpen && isBusy) {
      details.cancel();
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        size="sm"
        overlayClassName="!z-[1200]"
        className="!z-[1201] max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto rounded-[var(--app-radius-panel-standard)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)] ring-0"
      >
        <AlertDialogHeader>
          {hasMedia && (
            <AlertDialogMedia className={`rounded-[var(--app-radius-nested)] ${mediaTone}`}>
              <i className={`${mediaIcon} text-[length:var(--app-font-size-h2)]`} aria-hidden="true" />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle className="text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="break-words text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}
        {error && (
          <p role="alert" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]">
            {error}
          </p>
        )}

        <AlertDialogFooter className="border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)]">
          {actions.map((action, index) => {
            let tone = action.tone || "brand";
            if (!action.tone && isDestructive) tone = "danger";
            if (action.close) tone = "secondary";

            let label = action.label;
            if (action.isLoading) label = action.loadingLabel || "Processing…";

            let className = `min-h-[var(--app-touch-target-min)] min-w-0 whitespace-normal rounded-[var(--app-radius-nested)] border px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] ${actionToneClasses[tone] || actionToneClasses.brand}`;
            if (actions.length > 2 && actions.length % 2 === 1 && index === actions.length - 1) {
              className += " col-span-2";
            }

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

export default ActionAlertDialog;
