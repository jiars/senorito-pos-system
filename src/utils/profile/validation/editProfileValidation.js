import { isValidEmployeeContactNumber } from "@/utils/employees/employeeContactNumber";

export const editProfileValidationMessages = {
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  emailTooLong: "Use 255 characters or fewer.",
  contactRequired: "Contact Number is required.",
  contactInvalid: "Enter a valid Philippine mobile number.",
  currentPasswordRequired: "Enter your current password to change your email.",
  currentPasswordTooLong: "Use 255 characters or fewer.",
};

export const hasProfileEmailChanged = (email, originalEmail) => {
  return email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
};

export const validateEditProfile = (formData, originalEmail) => {
  const errors = {};
  const messages = editProfileValidationMessages;
  const email = formData.email.trim();
  if (!email) errors.email = messages.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = messages.emailInvalid;
  else if (email.length > 255) errors.email = messages.emailTooLong;
  if (!formData.contactNumber.trim()) errors.contactNumber = messages.contactRequired;
  else if (!isValidEmployeeContactNumber(formData.contactNumber)) {
    errors.contactNumber = messages.contactInvalid;
  }
  if (hasProfileEmailChanged(email, originalEmail)) {
    if (!formData.currentPassword) errors.currentPassword = messages.currentPasswordRequired;
    else if (formData.currentPassword.length > 255) errors.currentPassword = messages.currentPasswordTooLong;
  }
  return { errors, isFormValid: Object.keys(errors).length === 0 };
};

export const getEditProfileServerFieldErrors = (backendErrors) => {
  const fieldNames = {
    email: "email",
    contact_number: "contactNumber",
    current_password: "currentPassword",
  };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
