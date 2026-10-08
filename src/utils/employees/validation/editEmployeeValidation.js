import { isValidEmployeeContactNumber } from "@/utils/employees/employeeContactNumber";

export const validateEditEmployee = (formData, editableRoles) => {
  const errors = {};
  const selectedRole = editableRoles.find((role) => role.role_name === formData.role);
  if (!formData.role) errors.role = "Role is required.";
  else if (!selectedRole) errors.role = "Select an available employee role.";

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

export const getEditEmployeeServerFieldErrors = (backendErrors) => {
  const fieldNames = { role_id: "role", email: "email", contact_number: "contactNumber" };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
