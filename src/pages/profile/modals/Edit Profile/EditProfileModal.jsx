import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { updateProfile } from "@/services/profile/profileService";
import EmployeeContactInput from "@/pages/employees/components/EmployeeContactInput";
import { normalizeEmployeeContactInput } from "@/utils/employees/employeeContactNumber";
import {
  getEditProfileErrorCode,
  getEditProfileInlineFeedback,
  getEditProfileStatusFeedback,
  getEditProfileToastFeedback,
} from "@/utils/profile/feedback/editProfileFeedback";
import {
  getEditProfileServerFieldErrors,
  hasProfileEmailChanged,
  validateEditProfile,
} from "@/utils/profile/validation/editProfileValidation";
import {
  labelClassName,
  controlClassName,
  errorClassName,
  secondaryButtonClassName,
  primaryButtonClassName,
} from "../shared/profileModalClasses";

const createInitialFormData = (profile) => ({
  email: profile.email || "",
  contactNumber: normalizeEmployeeContactInput(profile.contact_number) || profile.contact_number || "",
  currentPassword: "",
});

const EditProfileModalContent = ({ profile, onClose, refetchProfileManagement }) => {
  const [formData, setFormData] = useState(() => createInitialFormData(profile));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getEditProfileInlineFeedback);
  const validation = validateEditProfile(formData, profile.email);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const formLocked = isSubmitting || hasSaved || saveBlocked;
  const original = createInitialFormData(profile);
  const emailChanged = hasProfileEmailChanged(formData.email, original.email);
  const hasChanges = emailChanged || formData.contactNumber !== original.contactNumber;

  const handleChange = (name, value) => {
    if (formLocked) return;
    clearFeedback();
    setServerFieldErrors({});
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // A confirmed save may only retry the account read, never the update.
  const refreshUpdatedProfile = async () => {
    try {
      await refetchProfileManagement();
    } catch {
      return;
    }
    toast.add(getEditProfileToastFeedback("PROFILE_UPDATED"));
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (operationInFlight.current || hasSaved || saveBlocked || !hasChanges) return;
    setHasAttemptedSubmit(true);
    if (!validation.isFormValid || Object.keys(serverFieldErrors).length > 0) {
      const firstField = document.getElementById(`edit-profile-${Object.keys(errors)[0]}`);
      if (firstField) firstField.focus();
      return;
    }
    operationInFlight.current = true;
    clearFeedback();
    setIsSubmitting(true);
    try {
      try {
        await updateProfile({
          email: formData.email.trim().toLowerCase(),
          contact_number: formData.contactNumber,
          current_password: emailChanged ? formData.currentPassword : undefined,
        });
      } catch (error) {
        const code = getEditProfileErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "PROFILE_CONFLICT") {
          setSaveBlocked(true);
          setFormData((current) => ({ ...current, currentPassword: "" }));
        }
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getEditProfileServerFieldErrors(error.response.data.errors));
        }
        return;
      }
      setFormData((current) => ({ ...current, currentPassword: "" }));
      setHasSaved(true);
      await refreshUpdatedProfile();
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
      await refreshUpdatedProfile();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "PROFILE_SAVING";
  if (hasSaved) statusCode = "PROFILE_REFRESHING";
  if (isRefreshError) statusCode = "PROFILE_REFRESH_FAILED";
  const statusFeedback = getEditProfileStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
      <Modal isOpen={!isSubmitting && !hasSaved} onClose={handleClose} maxWidth="32rem" maxHeight="min(90svh, 44rem)">
        <ModalHeader
          title="Edit Profile"
          description="Update your email and contact number."
          iconClassName="bi bi-person-gear"
          closeDisabled={isSubmitting}
        />
        <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
          <ModalContent>
            <form id="edit-profile-form" noValidate onSubmit={handleSubmit} className="grid gap-[var(--app-gap-related)]">
              <fieldset disabled={formLocked} className="contents">
                <Field data-invalid={hasAttemptedSubmit && Boolean(errors.email)}>
                  <FieldLabel htmlFor="edit-profile-email" className={labelClassName}>
                    Email<span className="text-[var(--app-color-danger)]">*</span>
                  </FieldLabel>
                  <Input
                    id="edit-profile-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    autoComplete="email"
                    maxLength={255}
                    required
                    aria-invalid={hasAttemptedSubmit && Boolean(errors.email)}
                    aria-describedby={hasAttemptedSubmit && errors.email ? "edit-profile-email-error" : undefined}
                    className={controlClassName}
                  />
                  {hasAttemptedSubmit && errors.email && (
                    <FieldError id="edit-profile-email-error" className={errorClassName}>{errors.email}</FieldError>
                  )}
                </Field>
                <Field data-invalid={hasAttemptedSubmit && Boolean(errors.contactNumber)} className="[&_input]:text-[length:var(--app-font-size-body)]">
                  <FieldLabel htmlFor="edit-profile-contactNumber" className={labelClassName}>
                    Contact Number<span className="text-[var(--app-color-danger)]">*</span>
                  </FieldLabel>
                  <EmployeeContactInput
                    id="edit-profile-contactNumber"
                    value={formData.contactNumber}
                    onValueChange={(value) => handleChange("contactNumber", value)}
                    disabled={formLocked}
                    required
                    aria-invalid={hasAttemptedSubmit && Boolean(errors.contactNumber)}
                    aria-describedby={hasAttemptedSubmit && errors.contactNumber ? "edit-profile-contactNumber-error" : undefined}
                  />
                  {hasAttemptedSubmit && errors.contactNumber && (
                    <FieldError id="edit-profile-contactNumber-error" className={errorClassName}>{errors.contactNumber}</FieldError>
                  )}
                </Field>
                {emailChanged && (
                  <Field data-invalid={hasAttemptedSubmit && Boolean(errors.currentPassword)}>
                    <FieldLabel htmlFor="edit-profile-currentPassword" className={labelClassName}>
                      Current Password<span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <Input
                      id="edit-profile-currentPassword"
                      name="current_password"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(event) => handleChange("currentPassword", event.target.value)}
                      autoComplete="current-password"
                      maxLength={255}
                      required
                      aria-invalid={hasAttemptedSubmit && Boolean(errors.currentPassword)}
                      aria-describedby={hasAttemptedSubmit && errors.currentPassword
                        ? "edit-profile-password-help edit-profile-currentPassword-error"
                        : "edit-profile-password-help"}
                      className={controlClassName}
                    />
                    <p id="edit-profile-password-help" className="m-0 text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)]">Confirm your password because this email is used for sign-in and recovery.</p>
                    {hasAttemptedSubmit && errors.currentPassword && (
                      <FieldError id="edit-profile-currentPassword-error" className={errorClassName}>{errors.currentPassword}</FieldError>
                    )}
                  </Field>
                )}
              </fieldset>
              <InlineFeedback feedback={feedback} id="edit-profile-feedback" />
            </form>
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}
            className={secondaryButtonClassName}
          >Cancel</Button>
          <Button
            type="submit" form="edit-profile-form" disabled={formLocked || !hasChanges}
            className={primaryButtonClassName}
          >Save Changes</Button>
        </ModalFooter>
      </Modal>
      <BlockingFeedback
        open={isSubmitting || hasSaved} status={isRefreshError ? "error" : "loading"}
        title={statusFeedback.title} message={statusFeedback.message} action={blockingAction}
      />
    </>
  );
};

const EditProfileModal = ({ isOpen, profile, onClose, refetchProfileManagement }) => {
  if (!isOpen || !profile) return null;
  return <EditProfileModalContent key={profile.id} profile={profile} onClose={onClose} refetchProfileManagement={refetchProfileManagement} />;
};

export default EditProfileModal;
