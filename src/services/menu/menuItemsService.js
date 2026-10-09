import api from "../../utils/axios/axiosInstance";

export const addMenuItem = async (itemData) => {
  try {
    const response = await api.post("/menu-management/items", itemData);
    return response.data;
  } catch (error) {
    console.error("Error adding menu item:", error.message);
    throw error;
  }
};

export const syncMenuItem = async (itemId, nestedPayload) => {
  try {
    const response = await api.put(
      `/menu-management/items/${itemId}/sync`,
      nestedPayload,
    );
    return response.data;
  } catch (error) {
    console.error("Error syncing menu item:", error.message);
    throw error;
  }
};

export const archiveMenuItem = async (itemId) => {
  try {
    const response = await api.delete(`/menu-management/items/${itemId}`);
    return true;
  } catch (error) {
    console.error("Error archiving menu item:", error.message);
    throw error;
  }
};

// Restore one archived Menu Item.
export const unarchiveMenuItem = async (itemId) => {
  try {
    const response = await api.patch(
      `/menu-management/items/${itemId}/unarchive`,
    );

    return response.data;
  } catch (error) {
    console.error("Error restoring menu item:", error.message);

    throw error;
  }
};
