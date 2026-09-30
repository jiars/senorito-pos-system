import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import heroSlideOne from "../../../assets/images/hero-slides/hero-slides-1.jpg";
import heroSlideTwo from "../../../assets/images/hero-slides/hero-slides-2.jpg";
import heroSlideThree from "../../../assets/images/hero-slides/hero-slides-3.jpg";
import heroSlideFour from "../../../assets/images/hero-slides/hero-slides-4.jpg";

import "../login.css";

const CAROUSEL_INTERVAL_MS = 5000;

const authHeroSlides = [
  {
    id: "auth-hero-one",
    src: heroSlideOne,
    alt: "A Señorito Café drink displayed on a wooden counter",
  },
  {
    id: "auth-hero-two",
    src: heroSlideTwo,
    alt: "A featured Señorito Café product",
  },
  {
    id: "auth-hero-three",
    src: heroSlideThree,
    alt: "A selection from Señorito Café",
  },
  {
    id: "auth-hero-four",
    src: heroSlideFour,
    alt: "A featured Señorito Café product",
  },
];

const AuthFlowLayout = () => {
  const location = useLocation();
  const [activeSlide, setActiveSlide] = useState(0);
  const isRecoveryView = location.pathname === "/forgot-password";

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotionQuery.matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => {
        return (currentSlide + 1) % authHeroSlides.length;
      });
    }, CAROUSEL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="min-h-svh w-full overflow-hidden bg-[var(--app-color-backdrop)]">
      <div className="relative min-h-svh w-full overflow-hidden bg-[var(--app-color-surface)]">
        <section
          className={`absolute inset-y-0 left-0 z-10 flex min-h-svh w-full items-center justify-center bg-[var(--app-color-surface)] px-8 py-8  transition-[transform,border-radius] duration-500 motion-reduce:transition-none sm:px-12 md:w-1/2 md:px-16 ${
            isRecoveryView
              ? "md:translate-x-full md:rounded-l-[var(--app-radius-panel)]"
              : "md:translate-x-0 md:rounded-r-[var(--app-radius-panel)]"
          }`}
        >
          <Outlet />
        </section>

        <aside
          className={`absolute inset-y-0 left-0 hidden min-h-svh w-1/2 bg-[var(--app-color-brand-deep)] transition-transform duration-500 motion-reduce:transition-none md:block ${
            isRecoveryView ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Featured Señorito Café photos"
        >
          <div
            className={`absolute top-0 h-full w-[calc(100%+3rem)] overflow-hidden ${
              isRecoveryView ? "left-0" : "-left-12"
            }`}
          >
            {authHeroSlides.map((slide, index) => {
              return (
                <img
                  key={slide.id}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                    index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                  src={slide.src}
                  alt={index === activeSlide ? slide.alt : ""}
                  aria-hidden={index !== activeSlide}
                />
              );
            })}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
          </div>

          {isRecoveryView && (
            <Link
              to="/login"
              aria-label="Back to login"
              className="absolute top-[var(--app-space-6)] left-[var(--app-space-6)] z-10 flex size-[var(--app-touch-target-min)] items-center justify-center rounded-full bg-white/65 text-[var(--app-color-text)] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <i aria-hidden="true" className="bi bi-arrow-left text-lg" />
            </Link>
          )}

          <div
            className="absolute inset-x-0 bottom-[var(--app-space-4)] flex items-center justify-center"
            aria-label="Authentication photo carousel"
          >
            {authHeroSlides.map((slide, index) => {
              return (
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
                  />
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default AuthFlowLayout;
