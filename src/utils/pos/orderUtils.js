// Create one permanent ID for one checkout and all its retries.
export const generateClientTransactionId = () => {
  return crypto.randomUUID();
};
