import leftBean from "@/assets/images/loading/left.png";
import middleBean from "@/assets/images/loading/middle.png";
import rightBean from "@/assets/images/loading/right.png";
import "./loading-state.css";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-svh items-center justify-center bg-[var(--app-color-surface)] px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex -translate-y-6 flex-col items-center text-center">
        <div className="relative h-38 w-44" aria-hidden="true">
          <img
            src={leftBean}
            alt=""
            className="loading-bean loading-bean--left"
          />

          <img
            src={middleBean}
            alt=""
            className="loading-bean loading-bean--middle"
          />

          <img
            src={rightBean}
            alt=""
            className="loading-bean loading-bean--right"
          />
        </div>

        <p className="mt-4 text-base font-bold text-[var(--app-color-brand)]">
          Take your morning sip.
        </p>

        <p className="mt-10 translate-y-24 text-sm text-[var(--app-color-brand)]">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
