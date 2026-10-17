import { useEffect, useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Pause, Play } from "lucide-react";
import type {
  IDietStrategy,
  IScrubberChapter,
} from "../../strategies/DietStrategy";

function AnnotationPin({
  chapter,
  progress,
  index,
  final,
  onAddToOrder,
}: {
  chapter: IScrubberChapter;
  progress: MotionValue<number>;
  index: number;
  final: boolean;
  onAddToOrder: () => void;
}) {
  const center = chapter.progress;
  const opacity = useTransform(
    progress,
    [
      index === 0 ? 0 : Math.max(0, center - 0.12),
      center,
      final ? 1 : Math.min(1, center + 0.12),
    ],
    final ? [0, 1, 1] : [0, 1, 0],
  );
  const y = useTransform(opacity, [0, 1], [12, 0]);
  const visibility = useTransform(opacity, (value) =>
    value > 0.1 ? "visible" : "hidden",
  );

  return (
    <motion.article
      aria-label={chapter.title}
      className="scrubber-pin"
      style={{ opacity, top: `${chapter.y}%`, visibility, y }}
    >
      <svg aria-hidden="true" className="scrubber-pin__leader" viewBox="0 0 84 32">
        <path d="M1 31h55L83 1" />
      </svg>
      <div className="scrubber-pin__pill">
        <strong>{chapter.title}</strong>
        <span>{chapter.description}</span>
        {final && (
          <button
            className="scrubber-pin__action"
            onClick={onAddToOrder}
            type="button"
          >
            Quick Add Dish
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function CanvasScrubber({
  strategy,
  onAddToOrder,
}: {
  strategy: IDietStrategy;
  onAddToOrder: () => void;
}) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });
  const showingVideo =
    !reducedMotion && Boolean(strategy.hero.video) && !videoError;

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return undefined;

    const isNearViewport = () => {
      const bounds = runway.getBoundingClientRect();
      return (
        bounds.top <= window.innerHeight + 1200 && bounds.bottom >= -1200
      );
    };
    if (isNearViewport()) {
      setNearViewport(true);
      return undefined;
    }

    const checkViewport = () => {
      if (!isNearViewport()) return;
      setNearViewport(true);
      window.removeEventListener("scroll", checkViewport);
      window.removeEventListener("resize", checkViewport);
    };
    window.addEventListener("scroll", checkViewport, { passive: true });
    window.addEventListener("resize", checkViewport);
    return () => {
      window.removeEventListener("scroll", checkViewport);
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {
        setVideoLoading(false);
        setVideoError(true);
      });
    } else {
      video.pause();
    }
  };

  return (
    <div
      aria-label="Scroll through the dish’s ingredient story"
      className="canvas-scrubber"
      data-reduced-motion={reducedMotion || undefined}
      ref={runwayRef}
      role="region"
    >
      <div className="canvas-scrubber__sticky">
        <figure className="canvas-scrubber__scene">
          {showingVideo ? (
            <>
              <video
                aria-label={strategy.hero.imageAlt}
                autoPlay={nearViewport}
                className="canvas-scrubber__video"
                loop
                muted
                onCanPlay={() => setVideoLoading(false)}
                onError={() => {
                  setVideoLoading(false);
                  setVideoPlaying(false);
                  setVideoError(true);
                }}
                onLoadStart={() => setVideoLoading(true)}
                onPause={() => setVideoPlaying(false)}
                onPlay={() => {
                  setVideoLoading(false);
                  setVideoPlaying(true);
                }}
                playsInline
                poster={strategy.hero.image}
                preload={nearViewport ? "auto" : "none"}
                ref={videoRef}
                role="img"
                src={nearViewport ? strategy.hero.video : undefined}
              />
              {nearViewport && (
                <button
                  aria-label={videoPlaying ? "Pause food video" : "Play food video"}
                  className="canvas-scrubber__video-toggle"
                  onClick={toggleVideo}
                  type="button"
                >
                  {videoPlaying ? (
                    <Pause aria-hidden="true" size={16} />
                  ) : (
                    <Play aria-hidden="true" size={16} />
                  )}
                </button>
              )}
              {videoLoading && (
                <p
                  aria-live="polite"
                  className="canvas-scrubber__video-status"
                  role="status"
                >
                  Loading the food story…
                </p>
              )}
            </>
          ) : (
            <img
              alt={strategy.hero.fallbackAlt}
              className="canvas-scrubber__fallback"
              decoding="async"
              loading={nearViewport ? "eager" : "lazy"}
              src={strategy.hero.image}
            />
          )}
          {videoError && (
            <p
              className="canvas-scrubber__video-status canvas-scrubber__video-status--error"
              role="alert"
            >
              The video could not load. A generated still is shown instead.
            </p>
          )}
          <figcaption>
            {showingVideo
              ? "Generated Gen2 food video; illustrative, not the restaurant’s plated service."
              : strategy.hero.video
                ? "Generated food still; illustrative, not the restaurant’s plated service."
                : "Reference food photography; illustrative, not the restaurant’s plated service."}
          </figcaption>
          {showingVideo &&
            strategy.chapters.map((chapter, index) => (
              <AnnotationPin
                chapter={chapter}
                final={index === strategy.chapters.length - 1}
                index={index}
                key={chapter.title}
                onAddToOrder={onAddToOrder}
                progress={scrollYProgress}
              />
            ))}
        </figure>

        <div className="canvas-scrubber__chapters">
          <span className="culinary-story__eyebrow">
            {strategy.diet === "veg" ? "The garden, layered" : "The coast, layered"}
          </span>
          <ol>
            {strategy.chapters.map((chapter) => (
              <li key={chapter.title}>
                <div>
                  <strong>{chapter.title}</strong>
                  <p>{chapter.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <button
            className="scrubber-chapters__action"
            onClick={onAddToOrder}
            type="button"
          >
            Quick Add Dish
          </button>
          <p className="canvas-scrubber__hint">
            {reducedMotion
              ? "A still image is shown with reduced motion enabled."
              : "Scroll to follow the ingredient notes alongside the film."}
          </p>
        </div>
      </div>
    </div>
  );
}
