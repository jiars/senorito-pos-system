import SharedReceiptModal from "@/components/receipt/ReceiptModal";
import { getPOSReceiptItems } from "@/utils/receipt/receiptItems";

const ReceiptModal = ({ orderDetails, onClose }) => {
  if (!orderDetails) return null;

  const receipt = {
    ...orderDetails,
    cashier: orderDetails.cashier_name,
    items: getPOSReceiptItems(orderDetails.cartItems),
  };

  return (
    <SharedReceiptModal
      receipt={receipt}
      onClose={onClose}
      modalClassName="!z-[10003]"
      overlayClassName="!z-[10002]"
    />
  );
};

export default ReceiptModal;
