import { useEffect, useState } from "react";

import { useRequestPasswordReset } from "@/hooks/usePasswordRecovery";

import ForgotPasswordForm from "./components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const passwordResetMutation = useRequestPasswordReset();
  const isSubmitting = passwordResetMutation.isPending;

  // Reduce the resend timer every second.
  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [cooldown]);

  const sendRequest = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === "") {
      setErrorMessage("Email is required.");
      return;
    }

    setErrorMessage("");

    try {
      const response = await passwordResetMutation.mutateAsync(normalizedEmail);

      let retryAfter = Number(response.retry_after);

      if (!retryAfter || retryAfter < 1) {
        retryAfter = 60;
      }

      setEmail(normalizedEmail);
      setMessage(response.message);
      setSent(true);
      setCooldown(retryAfter);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    await sendRequest();
  };

  const handleResend = async (event) => {
    event.preventDefault();

    if (cooldown > 0 || isSubmitting) {
      return;
    }

    await sendRequest();
  };

  const handleUseAnotherEmail = () => {
    setEmail("");
    setSent(false);
    setMessage("");
    setErrorMessage("");
    setCooldown(0);
    passwordResetMutation.reset();
  };

  return (
    <ForgotPasswordForm
      email={email}
      sent={sent}
      message={message}
      errorMessage={errorMessage}
      cooldown={cooldown}
      isSubmitting={isSubmitting}
      onEmailChange={(event) => setEmail(event.target.value)}
      onSubmit={handleSubmit}
      onResend={handleResend}
      onUseAnotherEmail={handleUseAnotherEmail}
    />
  );
};

export default ForgotPasswordPage;
