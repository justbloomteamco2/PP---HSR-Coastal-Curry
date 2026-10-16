import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CloudSun,
  Flame,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  rankDishes,
  type RecommendationDish,
} from "./experience/recommendations";
import {
  getCurrentLocalWeather,
  type LocalWeather,
} from "./experience/weather";

export type ExperienceTheme = "morning" | "day" | "evening";
type ThemeChoice = "automatic" | ExperienceTheme;

type ExperienceHubProps = {
  dishes: RecommendationDish[];
  diet: "veg" | "nonveg";
  soundEnabled: boolean;
  soundVolume: number;
  onAddToOrder: (dish: RecommendationDish) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSoundVolumeChange: (volume: number) => void;
  onThemeChange: (theme: ExperienceTheme) => void;
  onSound: () => void;
};

const getAutomaticTheme = (date: Date): ExperienceTheme => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  return "evening";
};

const readStoredTheme = (): ThemeChoice => {
  try {
    const saved = window.localStorage.getItem("hsr-experience-theme");
    if (
      saved === "morning" ||
      saved === "day" ||
      saved === "evening" ||
      saved === "automatic"
    ) {
      return saved;
    }
  } catch (error) {
    console.warn("Experience theme preference could not be read.", error);
  }
  return "automatic";
};

export default function ExperienceHub({
  dishes,
  diet,
  soundEnabled,
  soundVolume,
  onAddToOrder,
  onSoundEnabledChange,
  onSoundVolumeChange,
  onThemeChange,
  onSound,
}: ExperienceHubProps) {
  const [now, setNow] = useState(() => new Date());
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>(readStoredTheme);
  const [spice, setSpice] = useState(2);
  const [richness, setRichness] = useState(55);
  const [adventure, setAdventure] = useState(45);
  const [exclusions, setExclusions] = useState("");
  const [weather, setWeather] = useState<LocalWeather>();
  const [weatherError, setWeatherError] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [recommendedDish, setRecommendedDish] =
    useState<RecommendationDish>();
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const effectiveTheme =
    themeChoice === "automatic" ? getAutomaticTheme(now) : themeChoice;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    onThemeChange(effectiveTheme);
  }, [effectiveTheme, onThemeChange]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hsr-experience-theme", themeChoice);
    } catch (error) {
      console.warn("Experience theme preference could not be saved.", error);
    }
  }, [themeChoice]);

  const rankedDishes = useMemo(
    () =>
      rankDishes(dishes, {
        diet,
        spice,
        richness,
        adventure,
        exclusions,
      }, weather),
    [adventure, diet, dishes, exclusions, richness, spice, weather],
  );

  useEffect(() => {
    setRecommendedDish(undefined);
    setRecommendationMessage("");
  }, [adventure, diet, exclusions, richness, spice, weather]);

  const updateWeather = async () => {
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const currentWeather = await getCurrentLocalWeather();
      setWeather(currentWeather);
    } catch (error) {
      const message =
        error instanceof GeolocationPositionError
          ? error.code === error.PERMISSION_DENIED
            ? "Location permission was declined. Your menu still works without weather."
            : "Nearby weather could not be checked. Your menu still works without it."
          : error instanceof Error
            ? error.message
            : "Nearby weather could not be checked. Your menu still works without it.";
      setWeatherError(message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const chooseDish = () => {
    const nextDish =
      rankedDishes.find((dish) => dish.id !== recommendedDish?.id) ??
      rankedDishes[0];
    if (!nextDish) {
      setRecommendedDish(undefined);
      setRecommendationMessage(
        "No dishes match those choices and exclusions. Remove an exclusion or contact the restaurant to ask about ingredients.",
      );
      return;
    }
    setRecommendedDish(nextDish);
    setRecommendationMessage(
      weather
        ? `A ${weather.description} read nearby is included in this suggestion.`
        : "Matched to your table's dietary choice and the menu's listed spice levels.",
    );
    onSound();
  };

  const changeTheme = (value: string) => {
    if (
      value === "automatic" ||
      value === "morning" ||
      value === "day" ||
      value === "evening"
    ) {
      setThemeChoice(value);
    }
  };

  const toggleSound = () => onSoundEnabledChange(!soundEnabled);

  return (
    <section
      aria-labelledby="taste-guide-title"
      className="experience-hub"
      id="taste-guide"
    >
      <div className="experience-hub__header">
        <div>
          <h2 id="taste-guide-title">
            Let the <em>table choose.</em>
          </h2>
          <p>
            Tell us what sounds good. We&apos;ll find a dish from the menu you
            can explore next.
          </p>
        </div>
        <Sparkles aria-hidden="true" className="experience-hub__mark" size={27} />
      </div>

      <div className="experience-settings">
        <label className="experience-theme">
          <span>
            <Sun aria-hidden="true" size={16} />
            Dining light
          </span>
          <select
            aria-label="Choose automatic or manual dining light"
            onChange={(event) => changeTheme(event.target.value)}
            value={themeChoice}
          >
            <option value="automatic">Follow local time</option>
            <option value="morning">Morning warmth</option>
            <option value="day">Daylight</option>
            <option value="evening">Evening glow</option>
          </select>
        </label>
        <div className="experience-sound">
          <button
            aria-pressed={soundEnabled}
            className="experience-sound__toggle"
            onClick={toggleSound}
            type="button"
          >
            {soundEnabled ? (
              <Volume2 aria-hidden="true" size={16} />
            ) : (
              <VolumeX aria-hidden="true" size={16} />
            )}
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
          <span>Synthesized, optional and off until you turn it on.</span>
          {soundEnabled && (
            <label className="experience-sound__volume">
              <span>Volume</span>
              <input
                aria-label="Ambient sound volume"
                max={70}
                min={0}
                onChange={(event) =>
                  onSoundVolumeChange(Number(event.target.value) / 100)
                }
                type="range"
                value={Math.round(soundVolume * 100)}
              />
            </label>
          )}
        </div>
      </div>

      <div className="experience-weather">
        <div>
          <CloudSun aria-hidden="true" size={18} />
          <span>
            {weather
              ? `Nearby weather · ${weather.description}`
              : "Weather can gently shape a suggestion"}
          </span>
        </div>
        <button
          disabled={weatherLoading}
          onClick={updateWeather}
          type="button"
        >
          {weatherLoading ? "Checking…" : "Check nearby"}
          <ArrowRight aria-hidden="true" size={14} />
        </button>
        {weatherError && (
          <p aria-live="polite" className="experience-weather__error">
            {weatherError}
          </p>
        )}
        {!weather && !weatherError && (
          <p>
            Uses your location only after you choose to share it. Conditions
            come from Open-Meteo.
          </p>
        )}
      </div>

      <div className="taste-controls">
        <label className="taste-slider">
          <span>
            <Flame aria-hidden="true" size={15} />
            Spice
            <strong>
              {spice === 0
                ? "Gentle"
                : spice === 1
                  ? "Mild"
                  : spice === 2
                    ? "Balanced"
                    : "Fiery"}
            </strong>
          </span>
          <input
            max={3}
            min={0}
            onChange={(event) => setSpice(Number(event.target.value))}
            step={1}
            type="range"
            value={spice}
          />
        </label>
        <label className="taste-slider">
          <span>
            <Moon aria-hidden="true" size={15} />
            Table mood
            <strong>{richness < 38 ? "Light" : richness > 68 ? "Rich" : "Either"}</strong>
          </span>
          <input
            max={100}
            min={0}
            onChange={(event) => setRichness(Number(event.target.value))}
            type="range"
            value={richness}
          />
        </label>
        <label className="taste-slider">
          <span>
            <Sparkles aria-hidden="true" size={15} />
            Something new
            <strong>{adventure < 38 ? "Familiar" : adventure > 68 ? "Adventurous" : "Open"}</strong>
          </span>
          <input
            max={100}
            min={0}
            onChange={(event) => setAdventure(Number(event.target.value))}
            type="range"
            value={adventure}
          />
        </label>
      </div>

      <label className="taste-exclusions">
        <span>Ingredients to avoid in the dish name or description</span>
        <input
          autoComplete="off"
          onChange={(event) => setExclusions(event.target.value)}
          placeholder="Separate terms with commas"
          value={exclusions}
        />
      </label>
      <p className="taste-disclaimer">
        This guide checks menu wording only. Ingredients, allergens and
        cross-contact are not verified here; please call the restaurant before
        ordering if those matter to you.
      </p>

      <div className="taste-actions">
        <button
          className="button button--gold"
          onClick={chooseDish}
          type="button"
        >
          Surprise me
          <Sparkles aria-hidden="true" size={16} />
        </button>
        <span>
          {diet === "veg" ? (
            <Leaf aria-hidden="true" size={14} />
          ) : (
            <Flame aria-hidden="true" size={14} />
          )}
          {diet === "veg" ? "Pure vegetarian menu" : "Non-vegetarian menu"}
        </span>
      </div>

      {recommendedDish ? (
        <motion.article
          animate={{ opacity: 1, y: 0 }}
          className="taste-result"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          key={recommendedDish.id}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <div>
            <span className="taste-result__tag">A place at your table</span>
            <h3>{recommendedDish.name}</h3>
            <p>{recommendedDish.description}</p>
            <small>{recommendationMessage}</small>
          </div>
          <button
            className="add-button"
            onClick={() => onAddToOrder(recommendedDish)}
            type="button"
          >
            Add to your order
            <ArrowRight aria-hidden="true" size={15} />
          </button>
        </motion.article>
      ) : (
        recommendationMessage && (
          <p aria-live="polite" className="taste-no-result">
            {recommendationMessage}
          </p>
        )
      )}
    </section>
  );
}
