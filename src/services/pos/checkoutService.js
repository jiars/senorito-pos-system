import api from "../../utils/axios/axiosInstance";

// Send one complete online checkout to Laravel.
export const processOnlineCheckout = async (payload, clientTransactionId) => {
  try {
    const response = await api.post("/pos-management/checkout", payload, {
      headers: { "Idempotency-Key": clientTransactionId },
    });

    return response.data;
  } catch (error) {
    console.error("Error processing checkout:", error.message);

    const checkoutError = new Error(
      error.response?.data?.message || "Failed to process checkout",
    );

    checkoutError.status = error.response?.status || null;
    checkoutError.details = error.response?.data?.errors || null;

    throw checkoutError;
  }
};
