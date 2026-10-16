import type { LocalWeather } from "./weather";

export type RecommendationDish = {
  id: string;
  name: string;
  category: string[];
  diet: "veg" | "nonveg";
  description: string;
  spice: 0 | 1 | 2 | 3;
  tag: string;
};

export type RecommendationPreferences = {
  diet: "veg" | "nonveg";
  spice: number;
  richness: number;
  adventure: number;
  exclusions: string;
};

const matchesExclusion = (dish: RecommendationDish, exclusions: string[]) => {
  const searchableText = `${dish.name} ${dish.description}`.toLocaleLowerCase();
  return exclusions.some((term) => searchableText.includes(term));
};

const scoreDish = (
  dish: RecommendationDish,
  preferences: RecommendationPreferences,
  weather?: LocalWeather,
) => {
  let score = -Math.abs(dish.spice - preferences.spice) * 3;
  const description = `${dish.name} ${dish.description} ${dish.tag}`.toLowerCase();
  const richWords = ["ghee", "gravy", "roast", "curry", "crispy", "fried"];
  const lightWords = ["light", "lacy", "steamed", "fresh"];
  const richnessHint = richWords.some((word) => description.includes(word))
    ? 1
    : lightWords.some((word) => description.includes(word))
      ? -1
      : 0;
  score += richnessHint * ((preferences.richness - 50) / 25);

  const adventurousDish = dish.category.includes("seafood");
  score +=
    (adventurousDish ? 1 : -1) * ((preferences.adventure - 50) / 25);

  if (weather?.mood === "rainy" || weather?.mood === "cool") {
    if (["curry", "gravy", "roast", "warm"].some((word) => description.includes(word))) {
      score += 1.5;
    }
  } else if (weather?.mood === "warm") {
    if (["light", "lacy", "steamed", "fresh"].some((word) => description.includes(word))) {
      score += 1.5;
    }
  }

  return score;
};

export function rankDishes(
  dishes: RecommendationDish[],
  preferences: RecommendationPreferences,
  weather?: LocalWeather,
) {
  const exclusions = preferences.exclusions
    .split(",")
    .map((term) => term.trim().toLocaleLowerCase())
    .filter(Boolean);

  return dishes
    .filter(
      (dish) =>
        dish.diet === preferences.diet &&
        !matchesExclusion(dish, exclusions),
    )
    .map((dish) => ({ dish, score: scoreDish(dish, preferences, weather) }))
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.dish.name.localeCompare(second.dish.name),
    )
    .map(({ dish }) => dish);
}
