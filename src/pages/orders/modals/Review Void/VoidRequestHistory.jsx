import { formatDateTime } from "@/utils/shared/formatters/dateFormatters";
import { BUSINESS_TIME_ZONE } from "@/utils/shared/formatters/businessDates";
import { getVoidRequestStatusLabel, getVoidStaffName, getVoidStockHandlingLabel } from "@/utils/orders/orderVoidUtils";

const VoidRequestHistory = ({ requests }) => {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--app-space-4)]">
      {requests.map((request) => (
        <section key={request.id} className="flex min-w-0 flex-col gap-[var(--app-space-4)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
          <div className="flex flex-wrap items-center justify-between gap-[var(--app-space-2)]">
            <h3 className="font-semibold">Reason for void</h3>
            <span className="rounded-full bg-[var(--app-color-control-hover)] px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] font-medium text-[var(--app-color-brand)]">{getVoidRequestStatusLabel(request.status)}</span>
          </div>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{request.reason}</p>
          <dl className="grid min-w-0 grid-cols-1 gap-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-[var(--app-color-text-muted)]">Requested by</dt>
              <dd className="mt-[var(--app-space-1)] font-medium [overflow-wrap:anywhere]">{getVoidStaffName(request.requester)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[var(--app-color-text-muted)]">Date requested</dt>
              <dd className="mt-[var(--app-space-1)] font-medium">{formatDateTime(request.requested_at, BUSINESS_TIME_ZONE)}</dd>
            </div>
            {request.reviewed_at && (
              <>
                <div className="min-w-0">
                  <dt className="text-[var(--app-color-text-muted)]">Reviewed by</dt>
                  <dd className="mt-[var(--app-space-1)] font-medium [overflow-wrap:anywhere]">{getVoidStaffName(request.reviewer)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[var(--app-color-text-muted)]">Date reviewed</dt>
                  <dd className="mt-[var(--app-space-1)] font-medium">{formatDateTime(request.reviewed_at, BUSINESS_TIME_ZONE)}</dd>
                </div>
              </>
            )}
          </dl>
          {request.review_reason && (
            <div>
              <p className="mb-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Review note</p>
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{request.review_reason}</p>
            </div>
          )}
          {getVoidStockHandlingLabel(request) && (
            <p className="flex items-start gap-[var(--app-space-2)] border-t border-[var(--app-color-border-subtle)] pt-[var(--app-space-4)] font-medium">
              <i className="bi bi-box-seam shrink-0 text-[var(--app-color-brand)]" aria-hidden="true" />
              {getVoidStockHandlingLabel(request)}
            </p>
          )}
        </section>
      ))}
    </div>
  );
};

export default VoidRequestHistory;
