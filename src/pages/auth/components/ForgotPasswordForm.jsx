import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/ui/floating-input";

import senoritoMark from "../../../assets/images/smoke.png";

const ForgotPasswordForm = ({
  email,
  sent,
  message,
  errorMessage,
  cooldown,
  isSubmitting,
  onEmailChange,
  onSubmit,
  onResend,
  onUseAnotherEmail,
}) => {
  let submitLabel = "Send Email";

  if (isSubmitting) {
    submitLabel = "Sending...";
  } else if (sent && cooldown > 0) {
    submitLabel = `Send Again in ${cooldown}s`;
  } else if (sent) {
    submitLabel = "Send Again";
  }

  return (
    <section className="w-full max-w-[420px]">
      <header className="text-center">
        <img
          className="mx-auto size-16 object-contain"
          src={senoritoMark}
          alt="Señorito Café"
        />

        <h1 className="mt-[var(--app-space-6)] text-[length:var(--app-font-size-h1)] leading-[var(--app-line-height-h1)] font-semibold text-[var(--app-color-brand)]">
          Forgot Password
        </h1>

        <p className="mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text-subtle)]">
          Enter your email to reset your password.
        </p>
      </header>

      <form
        className="mt-[var(--app-space-8)]"
        onSubmit={sent ? onResend : onSubmit}
        id="forgot-form"
      >
        <fieldset
          className="m-0 min-w-0 border-0 p-0 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={sent || isSubmitting}
        >
          <FloatingInput
            id="forgot-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
          />
        </fieldset>

        {sent && (
          <div
            className="mt-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-success)]/30 bg-[var(--app-color-success-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-success)]"
            role="status"
          >
            {message}
          </div>
        )}

        {errorMessage !== "" && (
          <div
            className="mt-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-danger-border)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-danger-foreground)]"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          id="forgot-submit"
          className="mt-[var(--app-space-6)] h-[var(--app-control-height)] w-full rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
          disabled={isSubmitting || (sent && cooldown > 0)}
          aria-live="polite"
        >
          {isSubmitting && (
            <i className="bi bi-arrow-repeat mr-2 animate-spin" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>

        {sent && (
          <button
            type="button"
            className="mx-auto mt-[var(--app-space-2)] flex min-h-11 items-center justify-center text-sm font-medium text-[var(--app-color-brand)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
            onClick={onUseAnotherEmail}
            disabled={isSubmitting}
          >
            Use another email
          </button>
        )}
      </form>
    </section>
  );
};

export default ForgotPasswordForm;
