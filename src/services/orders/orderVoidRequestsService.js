import api from "@/utils/axios/axiosInstance";

// Preserve the original response/status for validation and uncertain-save feedback.
export const requestOrderVoid = async (orderId, reason) => {
  const response = await api.post(`/order-management/orders/${orderId}/void-requests`, { reason });
  return response.data;
};

export const reviewOrderVoid = async (requestId, decision, reviewReason) => {
  const response = await api.patch(`/order-management/void-requests/${requestId}/review`, {
    decision,
    review_reason: reviewReason,
  });
  return response.data;
};
