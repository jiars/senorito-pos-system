/**
 * Shared heading for back-office pages.
 * PageLayout provides its title, subtitle, and optional actions.
 */
const PageHeader = ({ title, subtitle, rightActions, className = "" }) => {
  return (
    <header
      className={`mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between ${className}`}
    >
      <div>
        <h1 className="m-0 text-2xl font-bold tracking-[-0.02em] text-[var(--app-color-brand-header)] md:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-[var(--app-color-text-subtle)]">
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
