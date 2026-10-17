export type Diet = "nonveg" | "veg";

export type IScrubberChapter = {
  title: string;
  description: string;
  y: number;
  progress: number;
};

export type IHeroConfig = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  fallbackAlt: string;
  video?: string;
};

export type IDietStrategy = {
  diet: Diet;
  accent: string;
  ambient: string;
  hero: IHeroConfig;
  chapters: IScrubberChapter[];
};

const prawnVideo = new URL("../Gen/Motion/gen2.mp4", import.meta.url).href;

const strategies: Record<Diet, IDietStrategy> = {
  nonveg: {
    diet: "nonveg",
    accent: "#c42b1c",
    ambient: "rgba(196, 43, 28, .18)",
    hero: {
      title: "Prawn Ghee Roast, in four notes.",
      description:
        "Fresh prawns, Byadagi chilli, pure ghee and tamarind, roasted into a Mangalorean classic.",
      image: "/images/generated/spicy-prawn-masala-in-brass-kadai.webp",
      imageAlt:
        "Generated video of prawn ghee roast in a brass kadai; illustrative, not the restaurant’s plated service",
      fallbackAlt:
        "Generated still of prawn ghee roast in a brass kadai; illustrative, not the restaurant’s plated service",
      video: prawnVideo,
    },
    chapters: [
      {
        title: "Pure Ghee",
        description: "The rich base named in the menu.",
        y: 75,
        progress: 0.2,
      },
      {
        title: "Byadagi Chilli Masala",
        description: "A warm, red-chilli character.",
        y: 58,
        progress: 0.46,
      },
      {
        title: "Jumbo Prawns",
        description: "The coastal centrepiece of the dish.",
        y: 42,
        progress: 0.73,
      },
      {
        title: "Tamarind & Curry Leaves",
        description: "A bright, aromatic counterpoint.",
        y: 22,
        progress: 0.93,
      },
    ],
  },
  veg: {
    diet: "veg",
    accent: "#3b7a47",
    ambient: "rgba(59, 122, 71, .18)",
    hero: {
      title: "Coastal Veg Ghee Roast, in four notes.",
      description:
        "A vegetable medley finished in warming roasted spice and the fragrance of ghee.",
      image: "/images/coastal-veg-ghee-roast-user.webp",
      imageAlt: "Coastal vegetable ghee roast, a user-provided reference photograph",
      fallbackAlt: "Coastal vegetable ghee roast, a user-provided reference photograph",
    },
    chapters: [
      {
        title: "Clarified Ghee Base",
        description: "The aromatic foundation of the roast.",
        y: 75,
        progress: 0.2,
      },
      {
        title: "Roasted Byadagi Paste",
        description: "Warm chilli notes bring the masala together.",
        y: 58,
        progress: 0.46,
      },
      {
        title: "Crisp Garden Medley & Paneer",
        description: "A vegetable-forward coastal combination.",
        y: 42,
        progress: 0.73,
      },
      {
        title: "Tangy Tamarind & Tempering",
        description: "A bright finish with fragrant tempering.",
        y: 22,
        progress: 0.93,
      },
    ],
  },
};

export function getDietStrategy(diet: Diet): IDietStrategy {
  return strategies[diet];
}
