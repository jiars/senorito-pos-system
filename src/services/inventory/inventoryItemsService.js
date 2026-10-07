import { supabase } from "../supabaseClient";
import api from "../../utils/axios/axiosInstance";

export const fetchInventoryItems = async () => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      *,
      inventory_categories (
        id,
        category_name
      ),
      inventory_batches (
        id,
        batch_number,
        expiration_date,
        quantity,
        unit_cost,
        source,
        created_at
      ),
      inventory_conversion_units (
        id,
        converted_unit,
        equivalent_base_amount
      ),
      inventory_audit_logs (
        created_at,
        action
      )
    `,
    )
    .eq("archived", false)
    .order("item_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const fetchAffectedMenuItems = async (inventoryItemId) => {
  try {
    const response = await api.get(
      `/inventory-management/items/${inventoryItemId}/affected`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch affected records.",
    );
  }
};

export const addInventoryItem = async (payload) => {
  try {
    const response = await api.post("/inventory-management/items", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding inventory item:", error.message);
    throw error;
  }
};

export const updateInventoryItem = async (id, payload) => {
  try {
    const response = await api.put(
      `/inventory-management/items/${id}/sync`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating inventory item:", error.message);

    throw error;
  }
};

export const archiveInventoryItem = async (id) => {
  try {
    const response = await api.delete(`/inventory-management/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to archive inventory item:", error.message);
    throw error;
  }
};

export const unarchiveInventoryItem = async (id) => {
  try {
    const response = await api.patch(
      `/inventory-management/items/${id}/unarchive`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to restore inventory item:", error.message);
    throw error;
  }
};
