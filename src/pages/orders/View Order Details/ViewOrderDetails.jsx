import SharedReceiptModal from "../../../components/receipt/ReceiptModal";
import { useOrderItems } from "../../../hooks/useOrderItems";
import { getOrderReceiptItems } from "@/utils/receipt/receiptItems";

const ViewOrderDetails = ({ orderDetails, onClose }) => {
  const orderId = orderDetails ? orderDetails.id : null;
  const { items, isLoading, error } = useOrderItems(orderId);

  if (!orderDetails) return null;

  const receipt = {
    ...orderDetails,
    transactionId: orderDetails.order_number || orderDetails.id,
    items: getOrderReceiptItems(items),
  };

  return (
    <SharedReceiptModal
      receipt={receipt}
      onClose={onClose}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default ViewOrderDetails;
