import { useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";

import AuthBrand from "./components/AuthBrand";
import LoginForm from "./components/LoginForm";

import { getLoginFeedback } from "../../utils/auth/loginFeedback";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState(() => {
    return sessionStorage.getItem("password_reset_message") || "";
  });

  const { login } = useAuth();

  useEffect(() => {
    if (successMessage !== "") {
      sessionStorage.removeItem("password_reset_message");
    }
  }, [successMessage]);

  useEffect(() => {
    if (lockedUntil === 0) return;

    const timerId = window.setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );

      setCooldown(secondsLeft);

      if (secondsLeft === 0) {
        setLockedUntil(0);
        setAttemptsRemaining(null);
        setErrorMessage("");
        window.clearInterval(timerId);
      }
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [lockedUntil]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoggingIn || lockedUntil > Date.now()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoggingIn(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (error) {
      const feedback = getLoginFeedback(error);

      setErrorMessage(feedback.message);
      setAttemptsRemaining(feedback.attemptsRemaining);

      if (feedback.retryAfter > 0) {
        setLockedUntil(Date.now() + feedback.retryAfter * 1000);
        setCooldown(feedback.retryAfter);
      }

      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] md:-translate-y-3">
      <AuthBrand />
      <LoginForm
        email={email}
        password={password}
        showPassword={showPassword}
        errorMessage={errorMessage}
        successMessage={successMessage}
        attemptsRemaining={attemptsRemaining}
        cooldown={cooldown}
        isLoggingIn={isLoggingIn}
        rememberMe={rememberMe}
        onEmailChange={(event) => setEmail(event.target.value)}
        onPasswordChange={(event) => setPassword(event.target.value)}
        onRememberMeChange={(event) => setRememberMe(event.target.checked)}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default LoginPage;
