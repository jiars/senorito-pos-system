import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import FloatingInput from "../../../components/ui/floating-input";

const LoginForm = ({
  email,
  password,
  showPassword,
  errorMessage,
  successMessage,
  isLoggingIn,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <section className="mt-8">
      <h2 className="m-0 text-base font-normal text-[var(--app-color-text-soft)] sm:text-lg">
        Login to your account to continue
      </h2>

      <form className="mt-6" onSubmit={onSubmit} id="login-form">
        <div className="space-y-7">
          <FloatingInput
            id="login-email"
            label="Email or Username"
            type="text"
            value={email}
            onChange={onEmailChange}
            autoComplete="username"
          />

          <FloatingInput
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={onPasswordChange}
            autoComplete="current-password"
            endAction={
              <button
                type="button"
                className="login-password-toggle"
                onClick={onTogglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                ></i>
              </button>
            }
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--app-color-text-muted)]"
            htmlFor="login-remember-me"
          >
            <input
              id="login-remember-me"
              type="checkbox"
              className="size-4 cursor-pointer accent-[var(--app-color-brand)]"
              checked={rememberMe}
              onChange={onRememberMeChange}
            />
            <span>Remember Me</span>
          </label>

          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[var(--app-color-brand)] no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
          >
            Forgot Password?
          </Link>
        </div>

        {successMessage !== "" && (
          <div
            className="mt-1 rounded-lg border border-[var(--app-color-success)]/30 bg-[var(--app-color-success-surface)] px-4 py-3 text-sm text-[var(--app-color-success)]"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {errorMessage !== "" && (
          <div
            className="mt-1 rounded-lg border border-[var(--app-color-danger-border)] bg-[var(--app-color-danger-surface)] px-4 py-3 text-sm text-[var(--app-color-danger-foreground)]"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-3 h-[var(--app-control-height)] w-full rounded-xl px-5 text-base"
          id="login-submit"
          disabled={isLoggingIn === true}
        >
          {isLoggingIn === true ? (
            <>
              <span className="login-submit-spinner" aria-hidden="true"></span>
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>
    </section>
  );
};

export default LoginForm;
