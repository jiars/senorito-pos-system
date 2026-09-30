import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DataTableSheet = ({
  trigger,
  title,
  description,
  rightActions = null,
  children,
  pagination = null,
  side = "right",
  widthClassName = "!w-full sm:!w-[60vw] sm:!max-w-none",
  sheetPaddingClassName = "p-[var(--app-padding-panel)]",
  headerClassName = "",
  showCloseButton = false,
}) => {
  return (
    <Sheet>
      <SheetTrigger render={trigger} />

      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className={`${widthClassName} ${sheetPaddingClassName} !pt-[calc(var(--app-padding-panel)+var(--app-space-4))] gap-[var(--app-gap-related)] overflow-x-hidden overflow-y-auto border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] rounded-l-[var(--app-radius-panel-standard)]`}
      >
        <SheetHeader
          className={`flex-row items-start justify-between gap-[var(--app-gap-related)] p-0 ${headerClassName}`}
        >
          <div className="min-w-0">
            <SheetTitle className="text-[length:var(--app-font-size-h3)] font-semibold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
              {title}
            </SheetTitle>

            {description && (
              <SheetDescription className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                {description}
              </SheetDescription>
            )}
          </div>

          {rightActions}
        </SheetHeader>

        <div className="flex min-h-0 shrink-0 flex-col overflow-hidden">
          {children}
        </div>

        {pagination && (
          <footer className="pt-[var(--app-space-2)]">
            {pagination}
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DataTableSheet;
