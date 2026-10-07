import { isValidEmployeeContactNumber } from "@/utils/employees/employeeContactNumber";

// Validation owns input rules and field messages, not toast/loading behavior.
export const validateAddEmployee = (formData, allowedRoles) => {
  const errors = {};
  const selectedRole = allowedRoles.find((role) => role.id === formData.roleId);
  if (!formData.roleId) errors.roleId = "Role is required.";
  else if (!selectedRole) errors.roleId = "Select an available employee role.";

  if (!formData.firstName.trim()) errors.firstName = "First Name is required.";
  else if (formData.firstName.trim().length > 100) errors.firstName = "Use 100 characters or fewer.";
  if (!formData.lastName.trim()) errors.lastName = "Last Name is required.";
  else if (formData.lastName.trim().length > 100) errors.lastName = "Use 100 characters or fewer.";

  const email = formData.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 255) errors.email = "Use 255 characters or fewer.";

  if (!formData.contactNumber.trim()) errors.contactNumber = "Contact Number is required.";
  else if (!isValidEmployeeContactNumber(formData.contactNumber)) {
    errors.contactNumber = "Enter a valid Philippine mobile number.";
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
