import api from "../../utils/axios/axiosInstance";

export const fetchAddons = async () => {
  try {
    const response = await api.get("/menu-management/addons");
    return response.data;
  } catch (error) {
    console.error("Error fetching addons:", error.message);
    return [];
  }
};

export const addAddon = async (payload) => {
  try {
    const response = await api.post("/menu-management/addons", payload);

    return response.data;
  } catch (error) {
    console.error("Error adding addon:", error.message);
    throw new Error(error.response?.data?.message || "Failed to add addon");
  }
};

export const updateAddon = async (addonId, payload) => {
  try {
    const response = await api.put(
      `/menu-management/addons/${addonId}/sync`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating addon:", error.message);
    throw new Error(error.response?.data?.message || "Failed to update addon");
  }
};

export const archiveAddon = async (addonId) => {
  try {
    const response = await api.delete(`/menu-management/addons/${addonId}`);

    return true;
  } catch (error) {
    console.error("Error archiving addon:", error.message);
    throw new Error(error.response?.data?.message || "Failed to archive addon");
  }
};

// Restore one archived Add-on.
export const unarchiveAddon = async (addonId) => {
  try {
    const response = await api.patch(
      `/menu-management/addons/${addonId}/unarchive`,
    );

    return response.data;
  } catch (error) {
    console.error("Error restoring Add-on:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to restore Add-on",
    );
  }
};
