import { Dialog, DialogContent } from "@/components/ui/dialog";

const Modal = ({
  isOpen,
  onClose,
  children,
  maxWidth = "32rem",
  maxHeight = "min(90svh, 52rem)",
  className = "",
  style = {},
}) => {
  const handleOpenChange = (open) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="!z-[1000] !bg-black/40"
        className={`!z-[1001] !flex !max-h-[var(--app-modal-max-height)] !w-[calc(100%-2rem)] !flex-col !gap-0 !overflow-hidden !rounded-[var(--app-radius-panel-standard)] !border !border-[var(--app-color-border-subtle)] !bg-[var(--app-color-surface)] !p-0 !text-[var(--app-color-text)] !shadow-[var(--app-shadow-card)] !ring-0 sm:!max-w-[var(--app-modal-max-width)] ${className}`}
        style={{
          "--app-modal-max-width": maxWidth,
          "--app-modal-max-height": maxHeight,
          ...style,
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
