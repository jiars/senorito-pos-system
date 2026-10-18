import api from "@/utils/axios/axiosInstance";

// Fetch all data required by My Profile.
export const fetchProfileManagement = async () => {
  try {
    const response = await api.get("/profile-management/init");
    const data = response.data;

    if (!data || !data.profile || !data.profile.id || !data.profile.role
      || !data.profile.role.role_name || !Object.hasOwn(data, "lastActivityAt")) {
      throw new Error("The profile response is incomplete.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching Profile Management:", error.message);
    throw new Error("Could not load your profile. Please try again.", { cause: error });
  }
};
