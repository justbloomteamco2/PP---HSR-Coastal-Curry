import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import CanvasScrubber from "./components/scrubber/CanvasScrubber";
import { getDietStrategy, type Diet } from "./strategies/DietStrategy";

export default function CulinaryStory({
  diet,
  onAddToOrder,
}: {
  diet: Diet;
  onAddToOrder: () => void;
}) {
  const strategy = getDietStrategy(diet);
  const reducedMotion = useReducedMotion();
  const storyStyle: CSSProperties & Record<"--accent" | "--ambient", string> = {
    "--accent": strategy.accent,
    "--ambient": strategy.ambient,
  };

  return (
    <section
      aria-labelledby="culinary-story-title"
      className="culinary-story"
      id="coastal-story"
      style={storyStyle}
    >
      <div className="culinary-story__intro">
        <motion.h2
          animate={{ opacity: 1, y: 0 }}
          initial={reducedMotion ? false : { opacity: 0 }}
          key={strategy.hero.title}
          transition={{
            duration: reducedMotion ? 0.14 : 0.18,
            ease: "easeOut",
          }}
          id="culinary-story-title"
        >
          {strategy.hero.title}
        </motion.h2>
        <p>{strategy.hero.description}</p>
      </div>
      <CanvasScrubber strategy={strategy} onAddToOrder={onAddToOrder} />
      <p className="culinary-story__note">
        Ingredient descriptions reflect the menu. Images are illustrative and do
        not claim to show the restaurant’s own plating.
      </p>
    </section>
  );
}
