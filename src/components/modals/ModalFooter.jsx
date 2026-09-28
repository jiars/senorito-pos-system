const ModalFooter = ({ children, className = "" }) => (
  <footer
    className={`flex shrink-0 items-center justify-end gap-[var(--app-space-2)] border-t border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-6)] py-[var(--app-space-4)] max-sm:flex-col-reverse max-sm:[&>*]:w-full ${className}`}
  >
    {children}
  </footer>
);

export default ModalFooter;
