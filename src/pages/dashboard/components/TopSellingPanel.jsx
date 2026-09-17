import defaultMenuImage from "../../../assets/images/default_menu_picture.jpg";

const TopSellingPanel = ({ topSellingItems, isLoadingBottom }) => {
  const handleImageError = (event) => {
    event.currentTarget.src = defaultMenuImage;
  };

  return (
    <section className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div>
          <h3 className="m-0 text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
            Top Selling Items
          </h3>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Your best-performing menu items based on sales this week.
          </p>
        </div>
      </header>

      {isLoadingBottom ? (
        <div className="grid min-h-32 place-items-center text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-subtle)]">
          Loading top items...
        </div>
      ) : topSellingItems.length === 0 ? (
        <div className="grid min-h-32 place-items-center text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-subtle)]">
          No sales recorded yet.
        </div>
      ) : (
        <div className="flex gap-[var(--app-gap-related)] overflow-x-auto pb-[var(--app-space-2)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topSellingItems.slice(0, 5).map((item) => (
            <article
              key={item.id}
              className="flex min-h-[18rem] w-[32rem] shrink-0 items-center rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]"
            >
              <img
                src={item.imageUrl || defaultMenuImage}
                alt={item.name}
                className="mr-[var(--app-gap-section)] size-24 shrink-0 rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] object-cover shadow-[var(--app-shadow-card)]"
                onError={handleImageError}
              />

              <div className="flex min-h-48 min-w-0 flex-1 flex-col justify-between py-[var(--app-space-6)]">
                <div>
                  <p className="truncate text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-bold text-[var(--app-color-text)]">
                    {item.name}
                  </p>

                  <p className="mt-[var(--app-space-2)] truncate text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] uppercase text-[var(--app-color-text-subtle)]">
                    {item.category}
                  </p>
                </div>

                <p className="text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-brand-deep)]">
                  {item.sold} sold
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TopSellingPanel;
