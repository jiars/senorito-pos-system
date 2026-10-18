import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import { Button } from "@/components/ui/button";
import {
  OFFLINE_PAGE_COPY,
  getOfflinePageStatusFeedback,
} from "@/utils/shared/feedback/offlinePageFeedback";

import "./offline-state.css";

const OfflineState = ({ canOpenPOS }) => {
  const screenRef = useRef(null);

  useEffect(() => {
    screenRef.current.focus();
  }, []);

  return (
    <section
      ref={screenRef}
      tabIndex={-1}
      aria-label={OFFLINE_PAGE_COPY.TITLE}
      data-offline-page="true"
      className="grid min-h-[60svh] min-w-0 place-items-center py-[var(--app-space-8)] outline-none"
    >
      <div className="flex w-full max-w-lg flex-col gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]">
        <i className="bi bi-wifi-off self-center text-[length:var(--app-font-size-h1)] text-[var(--app-color-brand)]" aria-hidden="true" />
        <StatusFeedback feedback={getOfflinePageStatusFeedback()} />
        <p className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
          {OFFLINE_PAGE_COPY.DRAFT_NOTICE}
        </p>
        {canOpenPOS && (
          <>
            <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              {OFFLINE_PAGE_COPY.POS_NOTICE}
            </p>
            <Button
              render={<Link to="/pos" />}
              className="min-h-[var(--app-touch-target-min)] w-full px-[var(--app-space-4)] sm:w-auto sm:self-start"
            >
              {OFFLINE_PAGE_COPY.OPEN_POS}
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default OfflineState;
