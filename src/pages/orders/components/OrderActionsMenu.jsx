import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canRequestOrderVoid, canReviewOrderVoid, getOrderVoidDisabledReason } from "@/utils/orders/orderVoidUtils";

const OrderActionsMenu = ({ order, userId, role, onViewOrder, onRequestVoid, onReviewVoid }) => {
  const canRequest = canRequestOrderVoid(order, userId, role);
  const disabledReason = getOrderVoidDisabledReason(order);
  const hasHistory = Boolean(order.pending_void_request) || (order.void_requests && order.void_requests.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" aria-label={`Actions for ${order.order_number}`} className="size-[var(--app-touch-target-min)] text-[var(--app-color-brand)]">
          <i className="bi bi-three-dots-vertical" aria-hidden="true" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onViewOrder(order)} className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)]">
          <i className="bi bi-eye" aria-hidden="true" />
          View receipt
        </DropdownMenuItem>
        {canRequest && (
          <DropdownMenuItem
            disabled={Boolean(disabledReason)}
            title={disabledReason}
            onClick={() => onRequestVoid(order)}
            className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-danger)]"
          >
            <i className="bi bi-x-circle" aria-hidden="true" />
            {order.pending_void_request ? "Void requested" : "Request void"}
          </DropdownMenuItem>
        )}
        {hasHistory && (
          <DropdownMenuItem onClick={() => onReviewVoid(order)} className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)]">
            <i className="bi bi-clipboard-check" aria-hidden="true" />
            {canReviewOrderVoid(order, role) ? "Review void request" : "View void history"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionsMenu;
