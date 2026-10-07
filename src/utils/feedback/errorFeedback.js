// Behavior by feedback type, independent of any module or display location.
export const ERROR_FEEDBACK_POLICIES = {
  transient: { duration: 3000, fadeDuration: 300, role: "status" },
  validation: { duration: 0, fadeDuration: 0, role: "alert" },
  critical: { duration: 0, fadeDuration: 0, role: "alert" },
  loading: { duration: 0, fadeDuration: 0, role: "status" },
  notification: { duration: 4000, fadeDuration: 0, role: "status" },
};

export const resolveErrorFeedback = (definition) => {
  if (!definition) return null;
  const type = definition.type || "validation";
  const policy = ERROR_FEEDBACK_POLICIES[type] || ERROR_FEEDBACK_POLICIES.validation;
  const feedback = { display: "inline", tone: "error", ...definition, ...policy };

  // Inline guidance stays plain; modal action errors can opt in to visible codes.
  const isErrorType = type === "validation" || type === "critical" || type === "transient";
  const showCode = feedback.showCode === true || (feedback.display === "status" && feedback.showCode !== false);
  if (showCode && isErrorType && feedback.tone === "error" && feedback.code && feedback.message) {
    feedback.message = `${feedback.message} (Code: ${feedback.code})`;
  }

  return feedback;
};
