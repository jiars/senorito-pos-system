import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const OFFLINE_PAGE_COPY = {
  TITLE: "This page needs an internet connection",
  MESSAGE: "Reconnect to continue. This page will return automatically when your browser is back online.",
  DRAFT_NOTICE: "Inputs stay on this page while disconnected. Leaving the page or reloading can discard unsaved changes.",
  POS_NOTICE: "POS can continue only when this device has a usable offline menu and session.",
  OPEN_POS: "Go to POS",
};

export const OFFLINE_PAGE_STATUS_FEEDBACK = {
  PAGE_OFFLINE: {
    type: "critical",
    display: "status",
    tone: "warning",
    title: OFFLINE_PAGE_COPY.TITLE,
    message: OFFLINE_PAGE_COPY.MESSAGE,
  },
};

export const getOfflinePageStatusFeedback = () => {
  return resolveErrorFeedback({
    code: "PAGE_OFFLINE",
    ...OFFLINE_PAGE_STATUS_FEEDBACK.PAGE_OFFLINE,
  });
};
