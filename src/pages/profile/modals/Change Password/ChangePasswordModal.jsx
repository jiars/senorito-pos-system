import { useRef, useState } from "react";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { changeProfilePassword } from "@/services/profile/profilePasswordService";
import {
  getChangePasswordErrorCode,
  getChangePasswordInlineFeedback,
  getChangePasswordStatusFeedback,
  getChangePasswordToastFeedback,
} from "@/utils/profile/feedback/changePasswordFeedback";
import {
  getChangePasswordServerFieldErrors,
  MAX_PASSWORD_LENGTH,
  validateChangePassword,
} from "@/utils/profile/validation/changePasswordValidation";
import {
  labelClassName,
  errorClassName,
  secondaryButtonClassName,
  primaryButtonClassName,
} from "../shared/profileModalClasses";

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };
const hiddenPasswords = { currentPassword: false, newPassword: false, confirmPassword: false };
const passwordFields = [
  { name: "currentPassword", label: "Current Password", autoComplete: "current-password" },
  { name: "newPassword", label: "New Password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm Password", autoComplete: "new-password" },
];

const ChangePasswordModalContent = ({ onClose, refetchProfileManagement }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [visiblePasswords, setVisiblePasswords] = useState(hiddenPasswords);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getChangePasswordInlineFeedback);
  const validation = validateChangePassword(formData);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const formLocked = isSubmitting || hasSaved || saveBlocked;

  const handleChange = (name, value) => {
    if (formLocked) return;
    clearFeedback();
    setServerFieldErrors({});
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  const clearPasswords = () => {
    setFormData(emptyForm);
    setVisiblePasswords(hiddenPasswords);
    setHasAttemptedSubmit(false);
    setServerFieldErrors({});
  };

  // Refresh failures never repeat a successful password change.
  const refreshChangedPassword = async () => {
    try {
      await refetchProfileManagement();
    } catch {
      return;
    }
    toast.add(getChangePasswordToastFeedback("PASSWORD_CHANGED"));
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (operationInFlight.current || hasSaved || saveBlocked) return;
    setHasAttemptedSubmit(true);
    if (!validation.isFormValid || Object.keys(serverFieldErrors).length > 0) {
      const firstField = document.getElementById(`change-password-${Object.keys(errors)[0]}`);
      if (firstField) firstField.focus();
      return;
    }
    operationInFlight.current = true;
    clearFeedback();
    setIsSubmitting(true);
    try {
      try {
        await changeProfilePassword({
          current_password: formData.currentPassword,
          password: formData.newPassword,
          password_confirmation: formData.confirmPassword,
        });
      } catch (error) {
        const code = getChangePasswordErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "PASSWORD_CONFLICT") {
          setSaveBlocked(true);
          clearPasswords();
        }
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getChangePasswordServerFieldErrors(error.response.data.errors));
        }
        return;
      }
      clearPasswords();
      setHasSaved(true);
      await refreshChangedPassword();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshChangedPassword();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "PASSWORD_SAVING";
  if (hasSaved) statusCode = "PASSWORD_REFRESHING";
  if (isRefreshError) statusCode = "PASSWORD_REFRESH_FAILED";
  const statusFeedback = getChangePasswordStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
      <Modal isOpen={!isSubmitting && !hasSaved} onClose={handleClose} maxWidth="32rem" maxHeight="min(90svh, 44rem)">
        <ModalHeader title="Change Password" description="Other devices will need to sign in again. This device stays signed in." iconClassName="bi bi-shield-lock" closeDisabled={isSubmitting} />
        <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
          <ModalContent>
            <form id="change-password-form" noValidate onSubmit={handleSubmit} className="grid gap-[var(--app-gap-related)]">
              <fieldset disabled={formLocked} className="contents">
                {passwordFields.map((field) => (
                  <Field key={field.name} data-invalid={hasAttemptedSubmit && Boolean(errors[field.name])}>
                    <FieldLabel htmlFor={`change-password-${field.name}`} className={labelClassName}>
                      {field.label}<span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
                      <InputGroupInput
                        id={`change-password-${field.name}`}
                        name={field.name}
                        type={visiblePasswords[field.name] ? "text" : "password"}
                        value={formData[field.name]}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        autoComplete={field.autoComplete}
                        maxLength={MAX_PASSWORD_LENGTH}
                        required
                        disabled={formLocked}
                        aria-invalid={hasAttemptedSubmit && Boolean(errors[field.name])}
                        aria-describedby={[
                          field.name === "newPassword" ? "change-password-requirements" : "",
                          hasAttemptedSubmit && errors[field.name] ? `change-password-${field.name}-error` : "",
                        ].filter(Boolean).join(" ") || undefined}
                        className="h-full min-w-0 px-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text)]"
                      />
                      <InputGroupAddon align="inline-end" className="!pr-0">
                        <Button
                          type="button" variant="ghost" disabled={formLocked}
                          aria-label={`${visiblePasswords[field.name] ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                          aria-pressed={visiblePasswords[field.name]}
                          aria-controls={`change-password-${field.name}`}
                          onClick={() => {
                            if (!formLocked) setVisiblePasswords((current) => ({ ...current, [field.name]: !current[field.name] }));
                          }}
                          className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] p-0 text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)]"
                        >
                          <i aria-hidden="true" className={`bi ${visiblePasswords[field.name] ? "bi-eye" : "bi-eye-slash"}`} />
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {hasAttemptedSubmit && errors[field.name] && (
                      <FieldError id={`change-password-${field.name}-error`} className={errorClassName}>{errors[field.name]}</FieldError>
                    )}
                    {field.name === "newPassword" && (
                      <div id="change-password-requirements" className="[&_[role=list]]:m-0 [&_[role=list]]:p-0 [&_[role=list]]:text-[length:var(--app-font-size-body-secondary)]">
                        {formData.newPassword ? <PasswordRequirements password={formData.newPassword} /> : (
                          <p className="m-0 text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">Use 8+ characters with uppercase, lowercase, a number, and a symbol.</p>
                        )}
                      </div>
                    )}
                  </Field>
                ))}
              </fieldset>
              <InlineFeedback feedback={feedback} id="change-password-feedback" />
            </form>
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}
            className={secondaryButtonClassName}
          >Cancel</Button>
          <Button
            type="submit" form="change-password-form" disabled={formLocked}
            className={primaryButtonClassName}
          >Save Changes</Button>
        </ModalFooter>
      </Modal>
      <BlockingFeedback open={isSubmitting || hasSaved} status={isRefreshError ? "error" : "loading"} title={statusFeedback.title} message={statusFeedback.message} action={blockingAction} />
    </>
  );
};

const ChangePasswordModal = ({ isOpen, profile, onClose, refetchProfileManagement }) => {
  if (!isOpen || !profile) return null;
  return <ChangePasswordModalContent key={profile.id} onClose={onClose} refetchProfileManagement={refetchProfileManagement} />;
};

export default ChangePasswordModal;
