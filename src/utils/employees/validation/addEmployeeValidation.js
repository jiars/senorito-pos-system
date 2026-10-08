import { isValidEmployeeContactNumber } from "@/utils/employees/employeeContactNumber";

export const addEmployeeValidationMessages = {
  roleRequired: "Role is required.",
  roleUnavailable: "Select an available employee role.",
  firstNameRequired: "First Name is required.",
  lastNameRequired: "Last Name is required.",
  nameTooLong: "Use 100 characters or fewer.",
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  emailTooLong: "Use 255 characters or fewer.",
  contactRequired: "Contact Number is required.",
  contactInvalid: "Enter a valid Philippine mobile number.",
};

// Validation owns input rules and field messages, not toast/loading behavior.
export const validateAddEmployee = (formData, allowedRoles) => {
  const errors = {};
  const messages = addEmployeeValidationMessages;
  const selectedRole = allowedRoles.find((role) => role.id === formData.roleId);
  if (!formData.roleId) errors.roleId = messages.roleRequired;
  else if (!selectedRole) errors.roleId = messages.roleUnavailable;

  if (!formData.firstName.trim()) errors.firstName = messages.firstNameRequired;
  else if (formData.firstName.trim().length > 100) errors.firstName = messages.nameTooLong;
  if (!formData.lastName.trim()) errors.lastName = messages.lastNameRequired;
  else if (formData.lastName.trim().length > 100) errors.lastName = messages.nameTooLong;

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

export const getAddEmployeeServerFieldErrors = (backendErrors) => {
  const fieldNames = {
    first_name: "firstName", last_name: "lastName", email: "email",
    contact_number: "contactNumber", role_id: "roleId",
  };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
