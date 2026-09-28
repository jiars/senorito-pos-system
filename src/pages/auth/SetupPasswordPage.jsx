import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useSetupPassword } from "@/hooks/usePasswordRecovery";
import { isPasswordValid } from "@/utils/validation/passwordValidation";

import PasswordForm from "./components/PasswordForm";

import "./login.css";

const SetupPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchParams] = useSearchParams();
  const setupPasswordMutation = useSetupPassword();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const isLinkValid = token !== "" && email !== "";
  const isSubmitting = setupPasswordMutation.isPending;

  let displayedErrorMessage = errorMessage;

  if (!isLinkValid && displayedErrorMessage === "") {
    displayedErrorMessage =
      "This password setup link is incomplete or invalid.";
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!isLinkValid) {
      setErrorMessage("This password setup link is incomplete or invalid.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setErrorMessage("Please meet all password requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      const response = await setupPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        token: token,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      localStorage.removeItem("auth_token");
      sessionStorage.setItem("password_reset_message", response.message);
      window.location.replace("/login");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
      <PasswordForm
        title="Set Up Password"
        description="Create and confirm your account password."
        formId="setup-password-form"
        idPrefix="setup-password"
        submitLabel="Set Up Password"
        submittingLabel="Setting up..."
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        errorMessage={displayedErrorMessage}
        isLinkValid={isLinkValid}
        isSubmitting={isSubmitting}
        onNewPasswordChange={(event) => setNewPassword(event.target.value)}
        onConfirmPasswordChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        onToggleNewPassword={() => setShowNewPassword((current) => !current)}
        onToggleConfirmPassword={() =>
          setShowConfirmPassword((current) => !current)
        }
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default SetupPasswordPage;
