import { cn } from "@/lib/utils";

const feedbackColors = {
  error: "text-[var(--app-color-danger)]",
  warning: "text-[var(--app-color-warning)]",
  info: "text-[var(--app-color-text-muted)]",
};

const InlineFeedback = ({ feedback, id, className }) => {
  if (!feedback || feedback.display !== "inline") return null;

  return (
    <p
      id={id}
      role={feedback.role}
      aria-atomic="true"
      style={{ transitionDuration: `${feedback.fadeDuration}ms` }}
      className={cn(
        "text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] transition-opacity motion-reduce:transition-none",
        feedbackColors[feedback.tone] || feedbackColors.error,
        feedback.isFading ? "opacity-0" : "opacity-100",
        className,
      )}
    >
      {feedback.message}
    </p>
  );
};

export default InlineFeedback;
