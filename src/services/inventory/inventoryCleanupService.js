import api from "../../utils/axios/axiosInstance";

// Read today's saved result; this GET never deducts stock or runs cleanup.
export const fetchInventoryCleanupSummary = async () => {
  try {
    const response = await api.get("/inventory-management/cleanup-summary", {
      timeout: 30000,
    });

    const result = response.data;

    // Do not turn an incomplete or invalid response into "no expired batches".
    if (
      !result ||
      typeof result.business_date !== "string" ||
      typeof result.completed !== "boolean" ||
      typeof result.details_available !== "boolean" ||
      !Array.isArray(result.batches)
    ) {
      throw new Error("Inventory cleanup summary returned an invalid response.");
    }

    if (
      result.completed &&
      (!Number.isInteger(result.cleaned_batch_count) ||
        result.cleaned_batch_count < 0 ||
        (result.details_available &&
          result.batches.length !== result.cleaned_batch_count))
    ) {
      throw new Error("Inventory cleanup summary returned an invalid count.");
    }

    return result;
  } catch (error) {
    console.error("Error fetching inventory cleanup summary:", error.message);
    throw error;
  }
};

// Ask Laravel to check or complete today's inventory cleanup.
export const ensureDailyInventoryCleanup = async () => {
  try {
    const response = await api.post(
      "/inventory-management/cleanup-expired",
      {},
      { timeout: 30000 },
    );

    const result = response.data;

    // Confirm Laravel returned the business date and completion flag.
    if (
      !result ||
      typeof result.business_date !== "string" ||
      typeof result.already_completed !== "boolean"
    ) {
      throw new Error("Inventory cleanup returned an invalid response.");
    }

    return result;
  } catch (error) {
    console.error("Error checking inventory cleanup:", error.message);

    // Preserve the HTTP status and server message for module feedback.
    throw error;
  }
};
