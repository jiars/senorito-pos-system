import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";

const ConfirmLogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut,
  feedback,
  onReturnFocus,
}) => {
  const handleOpenChange = (open) => {
    if (!open) onClose();
  };

  return (
    <ActionAlertDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      type="small-media"
      title="Log out?"
      iconClassName="bi bi-box-arrow-left"
      finalFocus={onReturnFocus}
      contentClassName="motion-reduce:!animate-none motion-reduce:!transition-none"
      description={
        <>
          You'll return to the{" "}
          <span className="font-semibold text-[var(--app-color-text)]">
            login screen
          </span>
          . Sign in again to continue.
        </>
      }
      actions={[
        { key: "cancel", label: "Cancel", close: true },
        {
          key: "logout",
          label: "Log out",
          tone: "brand",
          onClick: onConfirm,
          isLoading: isLoggingOut,
          loadingLabel: (
            <span className="inline-flex items-center gap-[var(--app-space-2)]">
              <span
                className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span role="status">Logging out...</span>
            </span>
          ),
        },
      ]}
    >
      <InlineFeedback feedback={feedback} id="logout-action-feedback" />
    </ActionAlertDialog>
  );
};

export default ConfirmLogoutModal;
