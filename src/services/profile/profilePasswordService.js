import api from "@/utils/axios/axiosInstance";

export const changeProfilePassword = async (payload) => {
  try {
    const response = await api.patch("/profile-management/password", {
      current_password: payload.current_password,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    });
    return response.data;
  } catch (error) {
    // Never log the request, payload, or password values.
    console.error("Error changing password.");
    throw error;
  }
};
