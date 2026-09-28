import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/ui/floating-input";

const PasswordForm = ({
  title,
  description,
  formId,
  idPrefix,
  submitLabel,
  submittingLabel,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  errorMessage,
  isLinkValid,
  isSubmitting,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onSubmit,
}) => {
  return (
    <section className="w-full max-w-[420px] p-[var(--app-space-6)] sm:p-[var(--app-space-8)]">
      <header className="text-center">
        <h1 className="text-[length:var(--app-font-size-h2)] leading-[var(--app-line-height-h2)] font-semibold text-[var(--app-color-text)]">
          {title}
        </h1>

        <p className="mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text-subtle)]">
          {description}
        </p>
      </header>

      <form
        className="mt-[var(--app-space-6)] flex flex-col gap-[var(--app-space-4)]"
        onSubmit={onSubmit}
        id={formId}
      >
        <fieldset
          className="m-0 flex min-w-0 flex-col gap-[var(--app-space-4)] border-0 p-0 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!isLinkValid || isSubmitting}
        >
          <div>
            <FloatingInput
              id={`${idPrefix}-new-password`}
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={onNewPasswordChange}
              autoComplete="new-password"
              endAction={
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={onToggleNewPassword}
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  aria-pressed={showNewPassword}
                >
                  <i
                    aria-hidden="true"
                    className={`bi ${showNewPassword ? "bi-eye" : "bi-eye-slash"}`}
                  />
                </button>
              }
            />

            <PasswordRequirements password={newPassword} />
          </div>

          <FloatingInput
            id={`${idPrefix}-confirm-password`}
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            autoComplete="new-password"
            endAction={
              <button
                type="button"
                className="login-password-toggle"
                onClick={onToggleConfirmPassword}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
                aria-pressed={showConfirmPassword}
              >
                <i
                  aria-hidden="true"
                  className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                />
              </button>
            }
          />
        </fieldset>

        {errorMessage && (
          <div
            className="rounded-[var(--app-radius-nested)] border border-[var(--app-color-danger-border)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-danger-foreground)]"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          id={`${idPrefix}-submit`}
          className="mt-[var(--app-space-2)] h-[var(--app-control-height)] w-full rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
          disabled={!isLinkValid || isSubmitting}
        >
          {isSubmitting && (
            <i
              className="bi bi-arrow-repeat mr-2 animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </form>
    </section>
  );
};

export default PasswordForm;
