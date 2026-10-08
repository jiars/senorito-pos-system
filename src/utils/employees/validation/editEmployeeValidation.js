import { isValidEmployeeContactNumber } from "@/utils/employees/employeeContactNumber";

export const editEmployeeValidationMessages = {
  roleRequired: "Role is required.",
  roleUnavailable: "Select an available employee role.",
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  emailTooLong: "Use 255 characters or fewer.",
  contactRequired: "Contact Number is required.",
  contactInvalid: "Enter a valid Philippine mobile number.",
};

export const validateEditEmployee = (formData, editableRoles) => {
  const errors = {};
  const messages = editEmployeeValidationMessages;
  const selectedRole = editableRoles.find((role) => role.role_name === formData.role);
  if (!formData.role) errors.role = messages.roleRequired;
  else if (!selectedRole) errors.role = messages.roleUnavailable;

  const email = formData.email.trim();
  if (!email) errors.email = messages.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = messages.emailInvalid;
  else if (email.length > 255) errors.email = messages.emailTooLong;

  if (!formData.contactNumber.trim()) errors.contactNumber = messages.contactRequired;
  else if (!isValidEmployeeContactNumber(formData.contactNumber)) {
    errors.contactNumber = messages.contactInvalid;
  }
  return { errors, isFormValid: Object.keys(errors).length === 0 };
};

export const getEditEmployeeServerFieldErrors = (backendErrors) => {
  const fieldNames = { role_id: "role", email: "email", contact_number: "contactNumber" };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
