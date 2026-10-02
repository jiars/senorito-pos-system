import { createPortal } from "react-dom";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import { Button } from "@/components/ui/button";
import ReceiptDocument from "./ReceiptDocument";
import ReceiptSkeleton from "./ReceiptSkeleton";
import "./receipt-print.css";

const ReceiptModal = ({
  receipt,
  onClose,
  isLoading = false,
  error = null,
  modalClassName = "",
  overlayClassName = "",
}) => {
  const canPrint = Boolean(
    receipt && receipt.items.length > 0 && !isLoading && !error,
  );

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        maxWidth="30rem"
        maxHeight="min(90svh, 48rem)"
        className={modalClassName}
        overlayClassName={overlayClassName}
      >
        <ModalHeader
          title="Receipt"
          description="Review the order before printing."
          iconClassName="bi bi-receipt"
        />

        <ModalBody
          className="bg-[var(--app-color-canvas)]"
          viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-13.75rem)]"
        >
          <ModalContent className="gap-[var(--app-gap-section)]">
            {isLoading ? (
              <ReceiptSkeleton />
            ) : error ? (
              <p
                role="alert"
                className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
              >
                {error}
              </p>
            ) : canPrint ? (
              <section
                aria-label="Order receipt"
                className="flex flex-col gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] sm:p-[var(--app-space-6)]"
              >
                <ReceiptDocument receipt={receipt} />
              </section>
            ) : (
              <p
                role="status"
                className="text-[length:var(--app-font-size-body)] text-[var(--app-color-text-muted)]"
              >
                No order items found. This receipt cannot be printed.
              </p>
            )}
          </ModalContent>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
          >
            Close
          </Button>
          <Button
            type="button"
            disabled={!canPrint}
            onClick={() => window.print()}
            className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
          >
            <i className="bi bi-printer" aria-hidden="true" />
            Print Receipt
          </Button>
        </ModalFooter>
      </Modal>
      {canPrint &&
        createPortal(
          <div className="receipt-print-root" aria-hidden="true">
            {/* Mount page settings only with a printable receipt, not for other reports. */}
            <style media="print">{"@page { size: auto; margin: 0; }"}</style>
            <ReceiptDocument receipt={receipt} />
          </div>,
          document.body,
        )}
    </>
  );
};

export default ReceiptModal;
