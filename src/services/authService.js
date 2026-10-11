import api from "../utils/axios/axiosInstance";
import { getLoginDeviceId } from "../utils/auth/loginDevice";

let logoutInProgress = false;

export const isLogoutInProgress = () => logoutInProgress;

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
  logoutInProgress = true;
  try {
    const token = localStorage.getItem("auth_token");

    // Tell Laravel to destroy the token in the database
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Keep the local session if the server did not accept the logout.
    if (!response.ok) {
      throw new Error(`Logout failed (HTTP ${response.status}).`);
    }

    // Delete the token from the browser
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  } finally {
    logoutInProgress = false;
  }
};
