import api from "../../utils/axios/axiosInstance";

// Add an employee and send their setup-password link.
export const addEmployee = async (payload) => {
  try {
    const response = await api.post("/employee-management/employees", payload);

    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error.message);

    if (error.response?.data?.message)
      error.message = error.response.data.message;

    throw error;
  }
};

// Update an employee's editable account information.
export const updateEmployee = async (employeeId, payload) => {
  try {
    const response = await api.put(
      `/employee-management/employees/${employeeId}/sync`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error.message);

    if (error.response?.data?.message)
      error.message = error.response.data.message;

    throw error;
  }
};

// Send another setup link while the employee still has no password.
export const resendEmployeeSetupLink = async (employeeId) => {
  try {
    const response = await api.post(
      `/employee-management/employees/${employeeId}/setup-password/resend`,
    );

    return response.data;
  } catch (error) {
    console.error("Error resending setup link:", error.message);

    if (error.response?.data?.message)
      error.message = error.response.data.message;

    throw error;
  }
};

// Approve a pending request and send the reset link.
export const approvePasswordResetRequest = async (requestId) => {
  const response = await api.post(
    `/auth/password/requests/${requestId}/approve`,
  );

  return response.data;
};

// Cancel a pending password-reset request.
export const cancelPasswordResetRequest = async (requestId) => {
  const response = await api.patch(
    `/auth/password/requests/${requestId}/cancel`,
  );

  return response.data;
};

// Send a fresh link for an approved request.
export const resendPasswordResetLink = async (requestId) => {
  const response = await api.post(
    `/auth/password/requests/${requestId}/resend`,
  );

  return response.data;
};

// Deactivate an employee and revoke their account access.
export const deactivateEmployee = async (employeeId) => {
  const response = await api.patch(
    `/employee-management/employees/${employeeId}/deactivate`,
  );

  return response.data;
};

// Restore access to a deactivated employee account.
export const reactivateEmployee = async (employeeId) => {
  const response = await api.patch(
    `/employee-management/employees/${employeeId}/reactivate`,
  );

  return response.data;
};
