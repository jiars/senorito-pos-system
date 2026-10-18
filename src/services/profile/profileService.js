import api from "@/utils/axios/axiosInstance";

// Current password confirms an email change; account IDs and roles are never sent.
export const updateProfile = async (payload) => {
  try {
    const response = await api.patch("/profile-management/profile", {
      email: payload.email,
      contact_number: payload.contact_number,
      current_password: payload.current_password,
    });
    return response.data;
  } catch (error) {
    // Do not log request details now that this payload may contain a password.
    console.error("Error updating profile.");
    throw error;
  }
};

export const fetchCurrentProfile = async () => {
  try {
    const response = await api.get("/user");
    const user = response.data;
    if (!user || !user.id || !user.role || !user.role.role_name) {
      throw new Error("The account response is incomplete.");
    }
    return user;
  } catch (error) {
    console.error("Error refreshing profile:", error.message);
    throw error;
  }
};
