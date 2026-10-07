// Shared stock-save classification; each workflow owns its feedback copy.
// A missing response or server failure does not prove the write was rejected.
export const getInventorySaveErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";

  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 422) return "VALIDATION_FAILED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";

  return "SAVE_FAILED";
};
