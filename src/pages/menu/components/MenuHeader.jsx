import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MenuHeader = ({
  activeTab,
  onViewArchive,
  onManageCategories,
  onAddMenuItem,
  onAddAddon,
}) => {
  const isAddonsTab = activeTab === "addons";
  const handlePrimaryAction = isAddonsTab ? onAddAddon : onAddMenuItem;
  const primaryLabel = isAddonsTab ? "Add Add-on" : "Add Menu Item";

  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label="Open Menu Management actions"
              className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-0 text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
            >
              <i aria-hidden="true" className="bi bi-three-dots-vertical" />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="z-[100] w-52">
          <DropdownMenuItem disabled>
            <i aria-hidden="true" className="bi bi-box-arrow-up-right" />
            Export
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onManageCategories}>
            <i aria-hidden="true" className="bi bi-tags" />
            Manage Categories
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onViewArchive}>
            <i aria-hidden="true" className="bi bi-archive" />
            View Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        onClick={handlePrimaryAction}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
      >
        <i aria-hidden="true" className="bi bi-plus-lg" />
        {primaryLabel}
      </Button>
    </div>
  );
};

export default MenuHeader;
