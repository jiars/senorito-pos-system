import PageHeader from "./PageHeader";

const PageLayout = ({
  title,
  subtitle,
  actions,
  titleAccessory,
  children,
  className = "",
}) => {
  return (
    <section className={className}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        titleAccessory={titleAccessory}
        rightActions={actions}
      />

      {children}
    </section>
  );
};

export default PageLayout;
