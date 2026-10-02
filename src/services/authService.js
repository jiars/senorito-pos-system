import api from "../utils/axios/axiosInstance";
import { getLoginDeviceId } from "../utils/auth/loginDevice";

export const loginUser = async (login, password) => {
  try {
    const response = await api.post("/login", {
      login: login.trim(),
      password,
      device_id: getLoginDeviceId(),
    });

    // Preserve the existing successful-login behavior.
    localStorage.setItem("auth_token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error.message);

    // Preserve Laravel's response body, status, and headers.
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("auth_token");

    // Tell Laravel to destroy the token in the database
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Delete the token from the browser
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};
