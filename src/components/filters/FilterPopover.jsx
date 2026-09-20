import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FilterPopoverFooter = ({ onApply, onClear }) => {
  return (
    <footer className="flex min-h-[var(--app-touch-target-min)] shrink-0 items-center justify-between border-t border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] py-[var(--app-space-2)]">
      <Button
        type="button"
        variant="ghost"
        onClick={onClear}
        className="h-auto p-0 text-[length:var(--app-font-size-body-secondary)] font-normal text-[var(--app-color-filter-clear)] hover:bg-transparent hover:text-[var(--app-color-text-muted)]"
      >
        Clear all
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onApply}
        className="h-auto p-0 text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-filter-apply)] hover:bg-transparent hover:text-[var(--app-color-filter-apply)]"
      >
        Apply
      </Button>
    </footer>
  );
};

/**
 * `sidebarSections` is optional. Each section needs an `id`, `label`, `icon`,
 * and `content` React node. Without it, this remains the standard simple filter popover.
 */
const FilterPopover = ({
  children,
  label = "Filters",
  triggerIcon = "bi-funnel",
  onApply,
  onClear,
  showFooter = true,
  sidebarSections = [],
  sidebarPanelClassName = "!w-[28rem]",
  maxWidth = "18rem",
  maxHeight = "calc(100svh - 28rem)",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSidebarSectionId, setActiveSidebarSectionId] = useState(
    sidebarSections[0]?.id ?? null,
  );
  const usesSidebar = sidebarSections.length > 0;
  const activeSidebarSection =
    sidebarSections.find((section) => section.id === activeSidebarSectionId) ??
    sidebarSections[0];

  const handleApply = () => {
    onApply?.();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] aria-expanded:bg-[var(--app-color-brand)] aria-expanded:text-white"
          >
            <i aria-hidden="true" className={`bi ${triggerIcon}`} />
            {label}
            <i
              aria-hidden="true"
              className="bi bi-chevron-down text-[length:var(--app-font-size-body-secondary)]"
            />
          </Button>
        }
      />

      <PopoverContent
        align="end"
        sideOffset={8}
        className={`!flex !max-w-[calc(100vw-2rem)] !gap-0 !overflow-hidden !rounded-[var(--app-radius-panel-standard)] !border !border-[var(--app-color-filter-border)] !bg-[var(--app-color-filter-bg)] !p-0 !shadow-none !ring-0 ${usesSidebar ? sidebarPanelClassName : ""}`}
        style={{
          maxHeight,
          ...(usesSidebar
            ? {}
            : {
                width: `min(${maxWidth}, calc(100vw - 2rem))`,
                maxWidth,
              }),
        }}
      >
        {usesSidebar ? (
          <>
            <div className="grid min-h-0 flex-1 grid-cols-[10.5rem_minmax(0,1fr)] max-sm:grid-cols-1">
              <nav
                aria-label="Filter sections"
                className="flex min-h-0 flex-col overflow-y-auto border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-2)] max-sm:flex-row max-sm:overflow-x-auto max-sm:border-r-0 max-sm:border-b"
              >
                {sidebarSections.map((section) => {
                  const isActive = section.id === activeSidebarSection?.id;

                  return (
                    <Button
                      key={section.id}
                      type="button"
                      variant="ghost"
                      aria-pressed={isActive}
                      onClick={() => setActiveSidebarSectionId(section.id)}
                      className="h-[var(--app-touch-target-min)] w-full shrink-0 justify-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] px-[var(--app-space-2)] text-left text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)] aria-pressed:bg-[var(--app-color-filter-bg)] max-sm:w-auto"
                    >
                      <i
                        aria-hidden="true"
                        className={`bi ${section.icon} text-base`}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {section.label}
                      </span>
                      {section.indicator && (
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-[var(--app-color-success)]"
                        />
                      )}
                      {isActive && (
                        <i
                          aria-hidden="true"
                          className="bi bi-chevron-right text-sm"
                        />
                      )}
                    </Button>
                  );
                })}
              </nav>

              <div className="min-h-0 overflow-y-auto p-[var(--app-space-4)]">
                {activeSidebarSection?.content}
              </div>
            </div>

            {showFooter && (
              <FilterPopoverFooter onClear={onClear} onApply={handleApply} />
            )}
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-[var(--app-space-4)]">
              <div className="flex flex-col gap-[var(--app-gap-related)]">
                {children}
              </div>
            </div>
            {showFooter && (
              <FilterPopoverFooter onClear={onClear} onApply={handleApply} />
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
