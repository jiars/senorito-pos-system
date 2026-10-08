import { useState } from "react";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { validateCashPayment } from "@/utils/pos/validation/cashPaymentValidation";

const labelClassName = "text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]";
const inputGroupClassName = "h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)]";
const addonClassName = "h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body)] font-semibold text-[var(--app-color-brand-number)]";
const inputClassName = "h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text)]";
const buttonClassName = "h-[var(--app-touch-target-min)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold";

const CashPaymentModal = ({
  totalQty,
  subtotal,
  discountType,
  setDiscountType,
  discountAmount,
  total,
  amountPaid,
  setAmountPaid,
  change,
  onClose,
  onProcessOrder,
  isProcessingOrder,
  isCheckoutBlocked = false,
}) => {
  const [showError, setShowError] = useState(false);
  const validation = validateCashPayment({ amountPaid, total });
  const amountError = validation.errors.amountPaid || validation.errors.total;
  const hasAmountError = showError && Boolean(amountError);
  const isPaymentLocked = isProcessingOrder || isCheckoutBlocked;

  const handleAmountChange = (event) => {
    if (isPaymentLocked) return;
    setAmountPaid(event.target.value.replace(/[^0-9.]/g, ""));
    setShowError(false);
  };

  const handleProcessClick = () => {
    if (isPaymentLocked) return;
    if (!validation.isFormValid) {
      setShowError(true);
      return;
    }
    onProcessOrder({ total, subtotal, discountAmount, change });
  };

  const handleClose = () => {
    if (!isProcessingOrder) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      maxWidth="28rem"
      className="!z-[10003]"
      overlayClassName="!z-[10002]"
    >
      <ModalHeader
        title="Cash Payment"
        description={`Total items ${totalQty}`}
        closeDisabled={isProcessingOrder}
        className="relative !justify-center [&>div]:items-center [&_[data-slot=dialog-header]]:!text-center [&_[data-slot=dialog-title]]:font-bold [&_[data-slot=dialog-title]]:text-[var(--app-color-text)] [&_[data-slot=dialog-description]]:text-[length:var(--app-font-size-body-secondary)] [&_[data-slot=dialog-description]]:text-[var(--app-color-danger)] [&>button]:absolute [&>button]:right-[var(--app-space-4)]"
      />
      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-10rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14rem)]">
        <ModalContent className="max-sm:!p-[var(--app-space-4)]">
          {/* Summary Box */}
          <div className="flex flex-col gap-[var(--app-space-2)] px-[var(--app-space-4)]">
            <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
              <span className="text-[var(--app-color-text-muted)] font-medium">Subtotal</span>
              <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-[length:var(--app-font-size-body-secondary)]">
              <span className="flex items-center gap-[var(--app-space-2)] text-[var(--app-color-text-muted)] font-medium">
                Discount
                <select
                  className="bg-[var(--app-color-canvas)] border border-[var(--app-color-border-subtle)] rounded px-[var(--app-space-1)] py-[2px] outline-none cursor-pointer text-[var(--app-color-text-muted)]"
                  value={discountType}
                  disabled={isPaymentLocked}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Senior/PWD (20%)">Senior/PWD</option>
                </select>
              </span>
              <span className={`font-semibold ${discountAmount > 0 ? 'text-[var(--app-color-danger)]' : 'text-[var(--app-color-text)]'}`}>
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0)}
              </span>
            </div>

            <div className="border-t border-dashed border-[var(--app-color-border-subtle)] my-[var(--app-space-1)]"></div>

            <div className="flex justify-between items-center text-[length:var(--app-font-size-body)]">
              <span className="font-bold text-[var(--app-color-text)]">Total</span>
              <span className="font-bold text-[var(--app-color-brand)] text-[length:var(--app-font-size-h3)]">{formatCurrency(total)}</span>
            </div>
          </div>


          <Field data-invalid={hasAmountError}>
            <FieldLabel htmlFor="pos-cash-received" className={labelClassName}>
              Cash Receive <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>
            <InputGroup className={inputGroupClassName}>
              <InputGroupAddon className={addonClassName}>₱</InputGroupAddon>
              <InputGroupInput
                id="pos-cash-received"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className={inputClassName}
                value={amountPaid}
                onChange={handleAmountChange}
                placeholder="0.00"
                aria-required="true"
                aria-invalid={hasAmountError}
                aria-describedby={hasAmountError ? "pos-cash-error" : undefined}
                disabled={isPaymentLocked}
                autoFocus
              />
            </InputGroup>
            {hasAmountError && (
              <FieldError id="pos-cash-error" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)] font-medium">
                {amountError}
              </FieldError>
            )}
          </Field>

          <Field className="opacity-60">
            <FieldLabel htmlFor="pos-cash-change" className={labelClassName}>Change</FieldLabel>
            <InputGroup className={`${inputGroupClassName} !bg-[var(--app-color-canvas)]`}>
              <InputGroupAddon className={addonClassName}>₱</InputGroupAddon>
              <InputGroupInput
                id="pos-cash-change"
                type="number"
                className={inputClassName}
                value={change > 0 ? change.toFixed(2) : ""}
                disabled
              />
            </InputGroup>
          </Field>
        </ModalContent>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          className={`${buttonClassName} text-[var(--app-color-text)] bg-[var(--app-color-canvas)] hover:bg-[var(--app-color-control-hover)]`}
          onClick={handleClose}
          disabled={isProcessingOrder}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className={`${buttonClassName} bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)]`}
          disabled={isPaymentLocked}
          onClick={handleProcessClick}
        >
          {isProcessingOrder ? "Processing..." : "Process Order"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CashPaymentModal;
