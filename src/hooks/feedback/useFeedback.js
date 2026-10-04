import { useCallback, useEffect, useMemo, useState } from "react";

// Module resolvers supply messages/policies; this hook owns the timer lifecycle.
export const useFeedback = (resolveFeedback, { persistentCode = null } = {}) => {
  const [request, setRequest] = useState({ code: null, attempt: 0 });
  const [fadingLifecycle, setFadingLifecycle] = useState(null);
  const code = request.code ? persistentCode || request.code : null;
  const definition = resolveFeedback(code);
  const duration = definition?.duration || 0;
  const fadeDuration = definition?.fadeDuration || 0;
  // A fresh lifecycle prevents an old fade from hiding a replacement message.
  const lifecycle = useMemo(
    () => ({ code, attempt: request.attempt, duration, fadeDuration }),
    [code, request.attempt, duration, fadeDuration],
  );

  const showFeedback = useCallback((nextCode) => {
    setRequest((previous) => ({ code: nextCode, attempt: previous.attempt + 1 }));
  }, []);
  const clearFeedback = useCallback(() => showFeedback(null), [showFeedback]);

  useEffect(() => {
    if (!code || duration <= 0) return;
    const fadeTimer = window.setTimeout(() => setFadingLifecycle(lifecycle), duration);
    const dismissTimer = window.setTimeout(() => {
      setRequest((previous) => previous.attempt === lifecycle.attempt
        ? { ...previous, code: null } : previous);
    }, duration + fadeDuration);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [code, duration, fadeDuration, lifecycle]);

  return {
    feedback: definition ? { ...definition, isFading: fadingLifecycle === lifecycle } : null,
    showFeedback,
    clearFeedback,
  };
};
