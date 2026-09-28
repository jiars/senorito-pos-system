import { useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";

import AuthBrand from "./components/AuthBrand";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoggingIn(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message || "Invalid email or password. Please try again.",
      );
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
