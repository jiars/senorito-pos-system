import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ModalHeader = ({
  title,
  description = "",
  iconClassName = "",
  closeDisabled = false,
  className = "",
}) => {
  return (
    <header
      className={`flex shrink-0 items-center justify-between gap-[var(--app-gap-related)] border-b border-[var(--app-color-border-subtle)] px-[var(--app-space-6)] py-[var(--app-space-4)] ${className}`}
    >
      <div className="flex min-w-0 items-center gap-[var(--app-space-2)]">
        {iconClassName && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] text-white">
            <i className={iconClassName} aria-hidden="true" />
          </span>
        )}

        <DialogHeader className="min-w-0 gap-[var(--app-space-1)] text-left">
          <DialogTitle className="text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-semibold text-[var(--app-color-brand)]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
      </div>

      <DialogClose
        render={
          <Button
            type="button"
            variant="ghost"
            className="size-[var(--app-touch-target-min)] shrink-0 rounded-full text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-text)]"
            size="icon"
            disabled={closeDisabled}
            aria-label="Close modal"
          />
        }
      >
        <i className="bi bi-x-lg text-base" aria-hidden="true" />
      </DialogClose>
    </header>
  );
};

export default ModalHeader;
