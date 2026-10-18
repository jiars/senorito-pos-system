import { isPasswordValid } from "@/utils/auth/validation/passwordValidation";

export const MAX_PASSWORD_LENGTH = 255;
export const changePasswordValidationMessages = {
  currentRequired: "Current Password is required.",
  newRequired: "New Password is required.",
  passwordTooLong: "Use 255 characters or fewer.",
  passwordWeak: "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.",
  passwordUnchanged: "Choose a password different from your current password.",
  passwordUnsupported: "Use a shorter password without null characters (maximum 72 bytes).",
  confirmationRequired: "Confirm Password is required.",
  confirmationMismatch: "Passwords do not match.",
};

export const validateChangePassword = (formData) => {
  const errors = {};
  const messages = changePasswordValidationMessages;
  // Passwords are checked exactly as entered, including intentional spaces.
  if (!formData.currentPassword) errors.currentPassword = messages.currentRequired;
  else if (formData.currentPassword.length > MAX_PASSWORD_LENGTH) errors.currentPassword = messages.passwordTooLong;

  if (!formData.newPassword) errors.newPassword = messages.newRequired;
  else if (formData.newPassword.length > MAX_PASSWORD_LENGTH) errors.newPassword = messages.passwordTooLong;
  else if (new TextEncoder().encode(formData.newPassword).length > 72 || formData.newPassword.includes("\0")) {
    errors.newPassword = messages.passwordUnsupported;
  }
  else if (!isPasswordValid(formData.newPassword)) errors.newPassword = messages.passwordWeak;
  else if (formData.newPassword === formData.currentPassword) errors.newPassword = messages.passwordUnchanged;

  if (!formData.confirmPassword) errors.confirmPassword = messages.confirmationRequired;
  else if (formData.confirmPassword.length > MAX_PASSWORD_LENGTH) errors.confirmPassword = messages.passwordTooLong;
  else if (formData.confirmPassword !== formData.newPassword) errors.confirmPassword = messages.confirmationMismatch;

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};

export const getChangePasswordServerFieldErrors = (backendErrors) => {
  const fieldNames = {
    current_password: "currentPassword",
    password: "newPassword",
    password_confirmation: "confirmPassword",
  };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
