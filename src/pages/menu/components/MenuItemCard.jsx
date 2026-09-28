import defaultMenuImage from "@/assets/images/default_menu_picture.jpg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/currencyFormatters";

const MenuItemCard = ({
  item,
  mode = "active",
  onEdit,
  onArchive,
  onRestore,
  isRestoring = false,
}) => {
  const prices = Array.isArray(item.menu_prices) ? item.menu_prices : [];
  const category = item.menu_categories?.category_name || "Uncategorized";
  const isArchived = item.archived === true;
  const isArchiveMode = mode === "archive";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultMenuImage;
  };

  return (
    <article className="relative grid min-h-[10rem] min-w-0 grid-cols-[8rem_minmax(0,1fr)] gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] shadow-[var(--app-shadow-card)] max-sm:min-h-[8.5rem] max-sm:grid-cols-[6.5rem_minmax(0,1fr)]">
      <img
        src={item.image_url || defaultMenuImage}
        alt={item.item_name || "Menu item"}
        onError={handleImageError}
        className="aspect-square size-[8rem] self-start rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] object-cover max-sm:size-[6.5rem]"
      />

      <div className="my-[var(--app-space-2)] flex min-w-0 flex-col gap-[var(--app-space-2)] pr-[var(--app-space-4)]">
        <div className="min-w-0">
          <h3 className="break-words text-[length:var(--app-font-size-body)] leading-[1.2] font-bold text-[var(--app-color-brand-header)]">
            {item.item_name || "Unnamed item"}
          </h3>

          <p className="break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-brand-light)]">
            {category}
          </p>
        </div>

        <div className="mt-auto grid gap-[var(--app-space-1)]">
          {prices.length > 0 ? (
            prices.map((price) => (
              <div
                key={price.id || price.variant_name}
                className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1fr)] items-center gap-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-bold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-brand)]"
              >
                <span className="truncate">{price.variant_name}</span>
                <span aria-hidden="true">-</span>
                <span className="text-right">
                  {formatCurrency(price.selling_price)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              No price configured
            </p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              aria-label={`Open actions for ${item.item_name || "menu item"}`}
              className="absolute right-0 top-0 size-[var(--app-touch-target-min)] rounded-full bg-transparent p-0 text-[var(--app-color-text)] shadow-none hover:bg-transparent"
            >
              <span className="grid size-[1.25rem] place-items-center rounded-full border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]">
                <i
                  aria-hidden="true"
                  className="bi bi-three-dots-vertical text-[0.625rem]"
                />
              </span>
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="z-[100] w-40">
          {isArchiveMode ? (
            <DropdownMenuItem
              disabled={isRestoring}
              onClick={() => onRestore?.(item)}
            >
              <i aria-hidden="true" className="bi bi-arrow-counterclockwise" />
              {isRestoring ? "Restoring..." : "Restore"}
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onEdit?.(item)}>
                <i aria-hidden="true" className="bi bi-pencil" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isArchived}
                onClick={() => onArchive?.(item)}
              >
                <i aria-hidden="true" className="bi bi-archive" />
                Archive
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
};

export default MenuItemCard;
