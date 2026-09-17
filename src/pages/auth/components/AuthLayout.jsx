import { useEffect, useState } from "react";

const CAROUSEL_INTERVAL_MS = 5000;

const AuthLayout = ({ children, heroSlides }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideCount = heroSlides.length;

  useEffect(() => {
    if (slideCount <= 1) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotionQuery.matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slideCount);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [slideCount]);

  return (
    <main className="min-h-svh w-full overflow-hidden bg-[var(--app-color-backdrop)]">
      <div className="grid min-h-svh w-full bg-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="relative z-10 flex min-h-svh items-center justify-center rounded-r-[var(--app-radius-panel)] bg-[var(--app-color-surface)] px-8 py-8 shadow-[var(--app-shadow-panel)] sm:px-12 md:px-16">
          {children}
        </section>

        <aside
          className="relative hidden min-h-svh bg-[var(--app-color-brand-deep)] md:block"
          aria-label="Featured Señorito Café photos"
        >
          {heroSlides.map((slide, index) => (
            <img
              key={slide.id}
              className={`absolute -left-12 right-0 top-0 h-full w-[calc(100%+3rem)] object-cover transition-opacity duration-700 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              src={slide.src}
              alt={index === activeSlide ? slide.alt : ""}
              aria-hidden={index !== activeSlide}
            />
          ))}
          <div className="absolute -left-12 right-0 top-0 h-full bg-gradient-to-t from-black/20 via-transparent to-black/5"></div>

          <div
            className="absolute inset-x-0 bottom-4 flex items-center justify-center"
            aria-label="Login photo carousel"
          >
            {heroSlides.map((slide, index) => (
              <button
                key={`${slide.id}-control`}
                type="button"
                className="group inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
              >
                <span
                  className={`size-2.5 rounded-full transition-colors ${
                    index === activeSlide
                      ? "bg-[var(--app-color-brand)]"
                      : "bg-white/90 group-hover:bg-white"
                  }`}
                  aria-hidden="true"
                ></span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default AuthLayout;
