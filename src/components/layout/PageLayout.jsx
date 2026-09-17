import PageHeader from "./PageHeader";

const PageLayout = ({ title, subtitle, actions, children, className = "" }) => {
  return (
    <section className={className}>
      <PageHeader title={title} subtitle={subtitle} rightActions={actions} />

      {children}
    </section>
  );
};

export default PageLayout;
