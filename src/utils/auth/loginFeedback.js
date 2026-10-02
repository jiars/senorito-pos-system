export const getLoginFeedback = (error) => {
  const feedback = {
    message: "Unable to log in. Please try again.",
    attemptsRemaining: null,
    retryAfter: 0,
  };

  if (!error.response) return feedback;

  const response = error.response;
  const data = response.data || {};

  if (data.message) feedback.message = data.message;

  if (Number.isInteger(data.attempts_remaining))
    feedback.attemptsRemaining = data.attempts_remaining;

  // Both account and IP lockouts return HTTP 429.
  if (response.status === 429) {
    let retryAfter = data.retry_after;

    if (retryAfter === undefined || retryAfter === null)
      retryAfter = response.headers["retry-after"];

    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds > 0)
      feedback.retryAfter = Math.ceil(seconds);
  }

  return feedback;
};
