import defaultMenuImage from "@/assets/images/default_menu_picture.jpg";

const TopSellingItemCard = ({ item, className = "" }) => {
  const handleImageError = (event) => {
    event.currentTarget.src = defaultMenuImage;
  };

  return (
    <article
      className={`flex h-[7.25rem] min-w-0 items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)] shadow-[var(--app-shadow-card)] ${className}`}
    >
      <img
        src={item.imageUrl || item.image_url || defaultMenuImage}
        alt={item.name}
        className="size-[6rem] shrink-0 rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] object-cover"
        onError={handleImageError}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--app-space-6)]">
        <div className="min-w-0">
          <p className="truncate text-[length:var(--app-font-size-body)] font-bold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]">
            {item.name}
          </p>

          <p className="truncate text-[length:var(--app-font-size-caption)] uppercase leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            {item.category}
          </p>
        </div>

        <p className="text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-brand-deep)]">
          {item.sold} sold
        </p>
      </div>
    </article>
  );
};

export default TopSellingItemCard;
