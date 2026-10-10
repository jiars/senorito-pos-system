import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const SALES_REPORT_STATUS_FEEDBACK = {
  SALES_REPORT_LOAD_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Could not load Sales Report",
    message: "Refresh the page to try again.",
  },
};

export const getSalesReportStatusFeedback = (code) => {
  const definition = SALES_REPORT_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
