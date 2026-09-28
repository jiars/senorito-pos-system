const ModalContent = ({ children, className = "" }) => {
  return (
    <div
      className={`flex flex-col gap-[var(--app-gap-related)] p-[var(--app-space-8)] ${className}`}
    >
      {children}
    </div>
  );
};

export default ModalContent;
