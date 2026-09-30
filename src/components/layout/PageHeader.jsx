/**
 * Shared heading for back-office pages.
 * PageLayout provides its title, subtitle, and optional actions.
 */
const PageHeader = ({
  title,
  subtitle,
  titleAccessory,
  rightActions,
  className = "",
}) => {
  return (
    <header
      className={`flex flex-col gap-4 md:flex-row md:items-start md:justify-between ${className}`}
    >
      <div className="flex-1 min-w-[12rem] max-w-[16rem] md:max-w-[22rem] lg:max-w-none">
        <div className="flex items-center gap-[var(--app-space-2)]">
          <h1 className="m-0 text-2xl font-bold tracking-[-0.02em] text-[var(--app-color-brand-header)] md:text-3xl">
            {title}
          </h1>

          {titleAccessory}
        </div>

        {subtitle && (
          <p className="mt-1 text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-subtle)]">
            {subtitle}
          </p>
        )}
      </div>

      {rightActions && (
        <div className="flex flex-wrap items-center gap-2">{rightActions}</div>
      )}
    </header>
  );
};

export default PageHeader;
