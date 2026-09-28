import api from "../../utils/axios/axiosInstance";

// Get a safe message from a failed Laravel request.
const getErrorMessage = (error, fallbackMessage) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }

  return fallbackMessage;
};

// Request recovery instructions using the submitted email.
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/password/forgot", {
      email: email,
    });

    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error.message);

    throw new Error(
      getErrorMessage(error, "Unable to request a password reset."),
      { cause: error },
    );
  }
};

// Submit the token and new password to Laravel.
export const submitPasswordReset = async (payload) => {
  try {
    const response = await api.post("/auth/password/reset", payload);

    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error.message);

    throw new Error(
      getErrorMessage(
        error,
        "The password reset link is invalid or has expired.",
      ),
      { cause: error },
    );
  }
};

// Submit the employee's one-time setup token and first password.
export const submitPasswordSetup = async (payload) => {
  try {
    const response = await api.post("/auth/password/setup", payload);

    return response.data;
  } catch (error) {
    console.error("Error setting up password:", error.message);

    throw new Error(
      getErrorMessage(
        error,
        "The password setup link is invalid or has expired.",
      ),
      { cause: error },
    );
  }
};
