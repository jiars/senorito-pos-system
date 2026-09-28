import ConfirmationModal from "@/components/modals/ConfirmationModal";

const PasswordResetRequestModal = ({
  open,
  onOpenChange,
  employee,
  request,
  onApprove,
  onCancelRequest,
  onResend,
  isApproving = false,
  isCancelling = false,
  isResending = false,
  error = "",
}) => {
  if (!employee || !request) return null;

  const employeeName =
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
    employee.username ||
    "Employee";

  const isPending = request.status === "pending";

  const details = [
    {
      key: "employee",
      label: "Employee",
      value: employeeName,
      iconClassName: "bi bi-person",
    },
    {
      key: "email",
      label: "Email",
      value: employee.email || "Not available",
      iconClassName: "bi bi-envelope",
    },
  ];

  const actions = isPending
    ? [
        {
          key: "approve",
          label: "Approve and Send Link",
          loadingLabel: "Approving...",
          tone: "success",
          isLoading: isApproving,
          onClick: onApprove,
        },
        {
          key: "cancel-request",
          label: "Cancel Request",
          loadingLabel: "Cancelling...",
          tone: "secondary",
          isLoading: isCancelling,
          onClick: onCancelRequest,
        },
      ]
    : [
        {
          key: "resend",
          label: "Resend Link",
          loadingLabel: "Sending...",
          tone: "success",
          isLoading: isResending,
          onClick: onResend,
        },
        {
          key: "close",
          label: "Close",
          tone: "secondary",
          close: true,
        },
      ];

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={isPending ? "Review Password Request" : "Password Reset Approved"}
      description={
        isPending
          ? `${employeeName} submitted a password-reset request.`
          : `A reset link was sent to ${employeeName}. You may resend it while the approval is still valid.`
      }
      iconClassName="bi bi-key"
      tone={isPending ? "warning" : "success"}
      details={details}
      actions={actions}
      error={error}
      maxWidth="30rem"
    />
  );
};

export default PasswordResetRequestModal;
