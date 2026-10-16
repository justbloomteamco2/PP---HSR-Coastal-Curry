import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Flame,
  Fish,
  Leaf,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import ExperienceHub, { type ExperienceTheme } from "./ExperienceHub";
import CulinaryStory from "./CulinaryStory";
import { AudioExperience } from "./experience/audio";

type Diet = "nonveg" | "veg";
type MenuCategory = "coastal" | "seafood" | "tandoor" | "breads";

const readDietPreference = (): Diet => {
  try {
    return window.localStorage.getItem("hsr-diet-preference") === "veg"
      ? "veg"
      : "nonveg";
  } catch (error) {
    console.warn("Diet preference could not be read.", error);
    return "nonveg";
  }
};

type Dish = {
  id: string;
  name: string;
  category: MenuCategory[];
  diet: Diet;
  description: string;
  image?: string;
  imageAlt?: string;
  spice: 0 | 1 | 2 | 3;
  tag: string;
};

const imageRoot = "/images/";
const unsplashImageUrl = (source: string, width: number) => {
  const url = new URL(source);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fm", "webp");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("crop", "entropy");
  url.searchParams.set("w", String(width));
  url.searchParams.set("h", String(width));
  url.searchParams.set("q", "84");
  return url.toString();
};
const restaurantPhone = "919632082153";
const restaurantAddress =
  "172, 9th Main Rd, 7th Sector, HSR Layout, Bengaluru, Karnataka 560102";
const initialGarnishes = {
  lime: { x: 82, y: 16 },
  leaf: { x: 89, y: 69 },
};

const categoryTabs: { id: MenuCategory; label: string }[] = [
  { id: "coastal", label: "Signature Coastal Specialties" },
  { id: "seafood", label: "Premium Seafood Selection" },
  { id: "tandoor", label: "Tandoori & North Indian" },
  { id: "breads", label: "Breads & Rice" },
];

const dishes: Dish[] = [
  {
    id: "prawn-ghee-roast",
    name: "Prawn Ghee Roast",
    category: ["coastal"],
    diet: "nonveg",
    description:
      "Fresh prawns, Byadagi chilli, pure ghee and tamarind, roasted into a fiery Mangalorean classic.",
    image: "https://images.unsplash.com/photo-1781332143666-5d02f0fe7865",
    imageAlt: "Shrimp curry in a metal kadai on a wooden platter",
    spice: 3,
    tag: "A coastal original",
  },
  {
    id: "chicken-ghee-roast",
    name: "Chicken Ghee Roast",
    category: ["coastal"],
    diet: "nonveg",
    description:
      "Slow-roasted chicken wrapped in the deep, dark warmth of roasted coastal masala.",
    spice: 3,
    tag: "Slow roasted",
  },
  {
    id: "neer-dosa",
    name: "Neer Dosa",
    category: ["coastal", "breads"],
    diet: "veg",
    description:
      "Lacy, paper-thin unfermented rice crepes made for gathering every last bit of gravy.",
    image: "neer-dosa-user.webp",
    imageAlt: "Neer dosa served with coastal accompaniments",
    spice: 0,
    tag: "Soft & lacy",
  },
  {
    id: "kori-roti",
    name: "Kori Roti with Chicken Gassy",
    category: ["coastal", "breads"],
    diet: "nonveg",
    description:
      "Crisp dry rice wafers with a generous pour of rich, coconut-based chicken curry.",
    image: "kori-roti-user.webp",
    imageAlt: "Kori roti served with chicken curry",
    spice: 2,
    tag: "Coastal comfort",
  },
  {
    id: "coastal-veg-ghee-roast",
    name: "Coastal Veg Ghee Roast",
    category: ["coastal"],
    diet: "veg",
    description:
      "A vegetable medley finished in warming roasted spice and the fragrance of ghee.",
    image: "coastal-veg-ghee-roast-user.webp",
    imageAlt: "Coastal vegetable ghee roast",
    spice: 2,
    tag: "Vegetarian",
  },
  {
    id: "tandoori-pomfret",
    name: "Tandoori Pomfret",
    category: ["seafood"],
    diet: "nonveg",
    description:
      "Whole pomfret marinated with yoghurt and tandoori spices, then char-grilled.",
    spice: 2,
    tag: "From the tandoor",
  },
  {
    id: "pomfret-rava-fry",
    name: "Pomfret Rava Fry",
    category: ["seafood"],
    diet: "nonveg",
    description:
      "A semolina-crusted pomfret, pan-fried for a crisp outside and tender centre.",
    spice: 2,
    tag: "Crisp & coastal",
  },
  {
    id: "maanji-curry",
    name: "Maanji (Pomfret) Curry",
    category: ["seafood"],
    diet: "nonveg",
    description:
      "A traditional, tangy coastal curry with pomfret and a warmly spiced gravy.",
    image: "south-indian-fish-curry.jpg",
    imageAlt: "South Indian fish curry",
    spice: 2,
    tag: "Tamarind warmth",
  },
  {
    id: "bangada-rava-fry",
    name: "Bangada (Mackerel) Rava Fry",
    category: ["seafood"],
    diet: "nonveg",
    description:
      "Mackerel seasoned with coastal spices, coated in semolina and shallow-fried.",
    spice: 2,
    tag: "Semolina crust",
  },
  {
    id: "fish-curry-combo",
    name: "Fish Curry Combo",
    category: ["seafood"],
    diet: "nonveg",
    description:
      "Catch of the day in tangy tamarind-coconut gravy, served with steamed rice.",
    image: "fish-curry-combo-user.webp",
    imageAlt: "Fish curry served with steamed rice",
    spice: 2,
    tag: "Catch of the day",
  },
  {
    id: "punjabi-tangdi",
    name: "Punjabi Tangdi",
    category: ["tandoor"],
    diet: "nonveg",
    description:
      "Three chicken drumsticks seasoned with warming spices and roasted in a clay tandoor.",
    spice: 2,
    tag: "Three pieces",
  },
  {
    id: "tandoori-chicken",
    name: "Tandoori Chicken",
    category: ["tandoor"],
    diet: "nonveg",
    description:
      "Classic red-spiced chicken, marinated and roasted in the clay oven.",
    image: "tandoori-chicken-mb41.jpg",
    imageAlt: "Tandoori chicken roasted in a clay oven",
    spice: 2,
    tag: "Clay oven",
  },
  {
    id: "chicken-seekh-kabab",
    name: "Chicken Seekh Kabab",
    category: ["tandoor"],
    diet: "nonveg",
    description:
      "Minced chicken skewers seasoned with a fragrant blend of warm spices.",
    spice: 1,
    tag: "Tandoor fired",
  },
  {
    id: "palak-paneer",
    name: "Palak Paneer",
    category: ["tandoor"],
    diet: "veg",
    description:
      "Soft cottage-cheese cubes in smooth, gently spiced spinach gravy.",
    image: "cottage-cheese-in-spinach-gravy-palak-paneer.jpg",
    imageAlt: "Cottage cheese in spinach gravy, palak paneer",
    spice: 1,
    tag: "Vegetarian",
  },
  {
    id: "boiled-veg",
    name: "Boiled Veg",
    category: ["tandoor"],
    diet: "veg",
    description: "A light, steamed vegetable side, simply seasoned.",
    image: "boiled-veg-user.webp",
    imageAlt: "A bowl of mixed vegetables",
    spice: 0,
    tag: "Light & simple",
  },
];

const heroDishIds: Record<Diet, string[]> = {
  nonveg: [
    "prawn-ghee-roast",
    "tandoori-chicken",
    "fish-curry-combo",
    "kori-roti",
  ],
  veg: ["neer-dosa", "palak-paneer", "coastal-veg-ghee-roast", "boiled-veg"],
};

const reviews = [
  {
    quote:
      "If you're someone who constantly craves authentic coastal cuisine, HSR Coastal Curry is a place you shouldn't miss. From the moment you walk in, the hospitality stands out.",
    name: "Neha Saxena",
    note: "Local Guide",
  },
  {
    quote:
      "Another favorite seafood restaurant in Bangalore... it has never disappointed.",
    name: "Rajuvan Ibrahim",
    note: "Local Guide",
  },
  {
    quote:
      "This is so good! I wasn't expecting that much. The place has a really pleasing interior with always welcoming staff.",
    name: "Elango UmaRani",
    note: "Guest review",
  },
];

const assetCredits = [
  {
    file: "ghee-roasted-prawns.jpg",
    title: "Ghee Roasted Prawns",
    creator: "Charles Haynes",
    license: "CC BY-SA 2.0",
    url: "https://www.flickr.com/photos/87232391@N00/2202932059",
  },
  {
    file: "tandoori-chicken-mb41.jpg",
    title: "Tandoori chicken-MB41",
    creator: "Rajeeb Dutta",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Tandoori_chicken-MB41.jpg",
  },
  {
    file: "south-indian-fish-curry.jpg",
    title: "South Indian Fish Curry",
    creator: "Shreya Shetty",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:South_Indian_Fish_Curry.JPG",
  },
  {
    file: "spicy-red-fish-curry.jpg",
    title: "Spicy Red Fish Curry",
    creator: "Mathew Jibin",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Spicy_Red_Fish_Curry.jpg",
  },
  {
    file: "a-plate-of-south-indian-masala-dosa.jpg",
    title: "A plate of South Indian Masala Dosa",
    creator: "Billjones94",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:A_plate_of_South_Indian_Masala_Dosa.jpg",
  },
  {
    file: "masala-dosa-01.jpg",
    title: "Masala dosa 01",
    creator: "Marajozkee",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Masala_dosa_01.jpg",
  },
  {
    file: "cottage-cheese-in-spinach-gravy-palak-paneer.jpg",
    title: "Cottage cheese in spinach gravy (palak paneer)",
    creator: "Radhikamprabhu82",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Cottage_cheese_in_spinach_gravy(palak_paneer).jpg",
  },
  {
    file: "photos-of-mangalore-mangaluru-karnataka-india-2024.jpg",
    title: "Jetty at the coastal city of Mangaluru",
    creator: "Fredericknoronha",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Photos_of_Mangalore_(Mangaluru),_Karnataka,_India._2024_October_07Jetty_at_the_coastal_city.jpg",
  },
  {
    file: "Remote WebP, optimized through the Unsplash CDN",
    title: "Shrimp curry in a metal bowl surrounded by fresh vegetables",
    creator: "Zayed Ahmed Zadu",
    license: "Unsplash License",
    url: "https://unsplash.com/photos/JcJ5k21tiA0",
  },
  {
    file: "neer-dosa-user.webp",
    title: "Neer Dosa",
    creator: "Not specified (user-provided image)",
    license: "Usage rights not specified",
  },
  {
    file: "coastal-veg-ghee-roast-user.webp",
    title: "Coastal Veg Ghee Roast",
    creator: "Not specified (user-provided image)",
    license: "Usage rights not specified",
  },
  {
    file: "boiled-veg-user.webp",
    title: "Boiled Veg",
    creator: "Not specified (user-provided image)",
    license: "Usage rights not specified",
  },
  {
    file: "fish-curry-combo-user.webp",
    title: "Fish Curry Combo",
    creator: "Not specified (user-provided image)",
    license: "Usage rights not specified",
  },
  {
    file: "kori-roti-user.webp",
    title: "Kori Roti with Chicken Gassy",
    creator: "Not specified (user-provided image)",
    license: "Usage rights not specified",
  },
];

const getDish = (id: string) => dishes.find((dish) => dish.id === id)!;

function CoastMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 44 44"
    >
      <circle cx="22" cy="22" r="20.5" stroke="currentColor" />
      <path
        d="M13 24.3c2.25-2.15 4.5-2.15 6.75 0s4.5 2.15 6.75 0 4.5-2.15 6.5 0M14.5 29.5h15m-7.5-17v4m-2.8-1.2 1.35 1.35m4-1.35-1.35 1.35"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      <circle cx="22" cy="22" r="4.4" stroke="currentColor" />
    </svg>
  );
}

function PlateIllustration({ label }: { label: string }) {
  const isDosa = label.toLowerCase().includes("dosa");
  const isVegetable =
    label.toLowerCase().includes("veg") ||
    label.toLowerCase().includes("palak");

  return (
    <div
      className="plate-illustration"
      role="img"
      aria-label={`${label}, illustrated`}
    >
      <svg aria-hidden="true" fill="none" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="#171616" />
        <circle cx="150" cy="150" r="128" stroke="#63594d" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="110" stroke="#38322d" strokeWidth="1" />
        {isDosa ? (
          <g stroke="#bea984" strokeWidth="2">
            <path d="m82 155 60-71 54 71-57 67-57-67Z" fill="#ddd0b3" />
            <path d="m108 155 34-40 29 40-32 40-31-40Z" fill="#eadfc7" />
            <path
              d="M97 157c18-15 30-14 48 1m-37 13c14-11 25-12 40-2m-29-29 21 15m-37 8 38 16m-18-42 20 33"
              fill="none"
              stroke="#ab9877"
              strokeWidth="1.5"
            />
            <circle cx="200" cy="163" r="17" fill="#aeb479" />
            <circle cx="205" cy="161" r="4" fill="#e9dfc5" />
            <circle cx="202" cy="165" r="2" fill="#737d4e" />
            <circle cx="104" cy="207" r="12" fill="#b96941" />
            <circle cx="104" cy="207" r="6" fill="#d9ac64" />
          </g>
        ) : (
          <>
            <ellipse cx="150" cy="160" rx="78" ry="63" fill="#31271d" />
            <ellipse
              cx="150"
              cy="154"
              rx="69"
              ry="53"
              fill={isVegetable ? "#577145" : "#8e3827"}
              opacity=".88"
            />
            <path
              d="M101 150c16-24 34-22 48-4s26 18 50-3M106 169c20-10 42 14 62-3s22-11 30-4"
              stroke={isVegetable ? "#d0c27c" : "#deaa68"}
              strokeLinecap="round"
              strokeWidth="5"
            />
            <path
              d="M113 122c10 4 13 12 8 20-8 2-15-5-16-13 2-4 5-6 8-7Zm58 46c7-3 14 0 16 7-3 7-10 9-17 5-2-5-1-9 1-12Z"
              fill="#698051"
              stroke="#b8bb81"
              strokeWidth="1.5"
            />
            <circle cx="134" cy="154" r="4" fill="#f0c56e" />
            <circle cx="177" cy="158" r="3" fill="#f0c56e" />
            <circle cx="142" cy="180" r="2.5" fill="#efd8b2" />
          </>
        )}
        <path
          d="M62 107c7 1 12 6 11 13-8 3-16 0-19-7 2-4 4-6 8-6Zm153 85c7-6 15-6 20 0-1 8-8 13-17 11-4-3-5-7-3-11Z"
          fill="#486447"
          stroke="#9cab73"
          strokeWidth="1.5"
        />
        <path
          d="M66 112c1 5 3 7 6 8m145 65c7 2 11 4 15 7"
          stroke="#bdc58e"
          strokeLinecap="round"
        />
        <path d="M149 48v7m-3.5-3.5h7" stroke="#d5b783" strokeLinecap="round" />
      </svg>
      <span aria-hidden="true">Illustration</span>
    </div>
  );
}

function DishPicture({
  dish,
  className = "",
  eager = false,
  sizes,
}: {
  dish: Dish;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  if (!dish.image) {
    return <PlateIllustration label={dish.name} />;
  }

  const imageSource = dish.image;
  const isUnsplashImage = imageSource.startsWith(
    "https://images.unsplash.com/",
  );

  return (
    <img
      alt={`${dish.imageAlt ?? dish.name} reference photograph; illustrative, not from the restaurant`}
      className={`${className}${eager && isUnsplashImage ? " dish-picture--hero" : ""}`}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      sizes={
        sizes ??
        (eager
          ? "(min-width: 1280px) 366px, (min-width: 768px) 38vw, 72vw"
          : "(min-width: 1000px) 280px, (min-width: 700px) 40vw, 90vw")
      }
      src={
        isUnsplashImage
          ? unsplashImageUrl(imageSource, 768)
          : `${imageRoot}${imageSource}`
      }
      srcSet={
        isUnsplashImage
          ? [480, 768, 1200]
              .map(
                (width) => `${unsplashImageUrl(imageSource, width)} ${width}w`,
              )
              .join(", ")
          : undefined
      }
    />
  );
}

function SpiceDots({ level }: { level: Dish["spice"] }) {
  if (level === 0) {
    return <span className="spice-note">Gentle</span>;
  }
  return (
    <span
      className="spice-dots"
      aria-label={`Spice level ${level} of 3`}
      title={`Spice level ${level} of 3`}
    >
      {[1, 2, 3].map((dot) => (
        <i
          aria-hidden="true"
          className={dot <= level ? "is-hot" : ""}
          key={dot}
        />
      ))}
    </span>
  );
}

function WhatsAppLink({
  children,
  message,
  className,
  onClick,
}: {
  children: ReactNode;
  message: string;
  className: string;
  onClick?: () => void;
}) {
  return (
    <a
      className={className}
      href={`https://wa.me/${restaurantPhone}?text=${encodeURIComponent(message)}`}
      onClick={onClick}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function App() {
  const [diet, setDiet] = useState<Diet>(readDietPreference);
  const [category, setCategory] = useState<MenuCategory>("coastal");
  const [selectedHero, setSelectedHero] = useState(0);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [previewDish, setPreviewDish] = useState<Dish | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationDiet, setReservationDiet] = useState<Diet>("nonveg");
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [timeTheme, setTimeTheme] = useState<ExperienceTheme>(() => {
    const hour = new Date().getHours();
    return hour >= 5 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 17
        ? "day"
        : "evening";
  });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.35);
  const [garnishes, setGarnishes] = useState(initialGarnishes);
  const prefersReducedMotion = useReducedMotion();
  const pillLayoutTransition = prefersReducedMotion
    ? { layout: { duration: 0 } }
    : {
        layout: {
          duration: 0.24,
          ease: [0.23, 1, 0.32, 1] as const,
        },
      };
  const tiltX = useSpring(0, { stiffness: 88, damping: 16 });
  const tiltY = useSpring(0, { stiffness: 88, damping: 16 });
  const glintX = useSpring(0, { stiffness: 88, damping: 16 });
  const glintY = useSpring(0, { stiffness: 88, damping: 16 });
  const dialogHeading = useRef<HTMLHeadingElement>(null);
  const audioExperience = useRef<AudioExperience | null>(null);
  const totalInOrder = Object.values(orderCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const currentHeroDishes = useMemo(
    () => heroDishIds[diet].map(getDish),
    [diet],
  );
  const featuredDish = currentHeroDishes[selectedHero];
  const platterRotation = (diet === "veg" ? 180 : 0) - selectedHero * 90;
  const todayIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  useEffect(() => {
    return () => audioExperience.current?.dispose();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("hsr-diet-preference", diet);
    } catch (error) {
      console.warn("Diet preference could not be saved.", error);
    }
  }, [diet]);

  useEffect(() => {
    const updateTime = () => {
      setLocalTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h12",
        }).format(new Date()),
      );
    };
    updateTime();
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reservationOpen || orderOpen || kitchenOpen || previewDish) {
      const previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialogHeading.current?.focus();
      const dialog = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-modal="true"]',
      );
      const handleDialogKeys = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") {
          setReservationOpen(false);
          setOrderOpen(false);
          setKitchenOpen(false);
          setPreviewDish(null);
          return;
        }
        if (event.key !== "Tab" || !dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", handleDialogKeys);
      document.body.classList.add("dialog-open");
      return () => {
        document.removeEventListener("keydown", handleDialogKeys);
        document.body.classList.remove("dialog-open");
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      };
    }
    return undefined;
  }, [reservationOpen, orderOpen, kitchenOpen, previewDish]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const changeDiet = (nextDiet: Diet) => {
    if (nextDiet === diet) return;
    setDiet(nextDiet);
    setSelectedHero(0);
    setReservationDiet(nextDiet);
    setMobileNavOpen(false);
    setGarnishes(initialGarnishes);
  };

  const addToOrder = (dish: Dish) => {
    setOrderCounts((current) => ({
      ...current,
      [dish.id]: (current[dish.id] ?? 0) + 1,
    }));
    setToast(`${dish.name} added to your order`);
    if (soundEnabled) audioExperience.current?.playInteraction();
  };

  const updateSoundPreference = async (enabled: boolean) => {
    if (!enabled) {
      audioExperience.current?.disable();
      setSoundEnabled(false);
      return;
    }

    audioExperience.current ??= new AudioExperience();
    try {
      await audioExperience.current.enable();
      setSoundEnabled(true);
    } catch (error) {
      console.error("Optional audio could not be enabled.", error);
      setSoundEnabled(false);
      setToast("Optional audio could not start. Check your browser settings.");
    }
  };

  const updateTimeTheme = useCallback((theme: ExperienceTheme) => {
    setTimeTheme(theme);
  }, []);

  const updateSoundVolume = (volume: number) => {
    setSoundVolume(volume);
    audioExperience.current?.setVolume(volume);
  };

  const changeQuantity = (id: string, amount: number) => {
    setOrderCounts((current) => {
      const nextCount = (current[id] ?? 0) + amount;
      if (nextCount <= 0) {
        const { [id]: _removed, ...remaining } = current;
        return remaining;
      }
      return { ...current, [id]: nextCount };
    });
  };

  const menuForCategory = dishes.filter(
    (dish) =>
      dish.category.includes(category) &&
      (diet === "veg" ? dish.diet === "veg" : dish.diet === "nonveg"),
  );
  const orderMessage = Object.entries(orderCounts)
    .map(([id, count]) => `${count} × ${getDish(id).name}`)
    .join("\n");

  const submitReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Hello, I would like to ask about a table at HSR Coastal Curry.\nDate: ${reservationDate}\nGuests: ${guestCount}\nPreference: ${reservationDiet === "veg" ? "Pure vegetarian" : "Non-vegetarian"}\nPlease confirm availability and timings.`;
    window.open(
      `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setReservationOpen(false);
  };

  const selectNextHero = (direction: number) => {
    setSelectedHero(
      (current) =>
        (current + direction + currentHeroDishes.length) %
        currentHeroDishes.length,
    );
    setGarnishes(initialGarnishes);
  };

  const moveGarnish = (
    event: ReactPointerEvent<HTMLButtonElement>,
    garnish: keyof typeof initialGarnishes,
  ) => {
    event.stopPropagation();
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const bounds = event.currentTarget
      .closest(".platter-field")
      ?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    const x = Math.max(
      5,
      Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100),
    );
    const y = Math.max(
      5,
      Math.min(95, ((event.clientY - bounds.top) / bounds.height) * 100),
    );
    setGarnishes((current) => ({ ...current, [garnish]: { x, y } }));
  };

  const handleGarnishKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    garnish: keyof typeof initialGarnishes,
  ) => {
    const movement = event.shiftKey ? 5 : 2;
    const deltas: Record<string, { x: number; y: number }> = {
      ArrowDown: { x: 0, y: movement },
      ArrowLeft: { x: -movement, y: 0 },
      ArrowRight: { x: movement, y: 0 },
      ArrowUp: { x: 0, y: -movement },
    };
    if (event.key === "Home") {
      event.preventDefault();
      setGarnishes((current) => ({
        ...current,
        [garnish]: initialGarnishes[garnish],
      }));
      return;
    }
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    setGarnishes((current) => ({
      ...current,
      [garnish]: {
        x: Math.max(5, Math.min(95, current[garnish].x + delta.x)),
        y: Math.max(5, Math.min(95, current[garnish].y + delta.y)),
      },
    }));
  };

  const movePlatterLighting = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltX.set(-y * 8);
    tiltY.set(x * 8);
    glintX.set(x * 28);
    glintY.set(y * 20);
  };

  const resetPlatterLighting = () => {
    tiltX.set(0);
    tiltY.set(0);
    glintX.set(0);
    glintY.set(0);
  };

  const closeMobileNav = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") setMobileNavOpen(false);
  };

  const navLinks = [
    { href: "#experience", label: "Experience" },
    { href: "#menu", label: "Signature menu" },
    { href: "#coastal-story", label: "Coastal story" },
    { href: "#taste-guide", label: "Taste guide" },
    { href: "#reviews", label: "Reviews" },
    { href: "#visit", label: "Location" },
  ];

  return (
    <div
      className="restaurant-shell"
      data-mode={diet}
      data-time-theme={timeTheme}
    >
      <header className="site-header">
        <a
          aria-label="HSR Coastal Curry home"
          className="brand-lockup"
          href="#top"
          onClick={() => setMobileNavOpen(false)}
        >
          <CoastMark className="brand-mark" />
          <span className="brand-wordmark">
            <span>HSR</span>
            <span>Coastal Curry</span>
          </span>
        </a>

        <button
          aria-expanded={mobileNavOpen}
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          className="mobile-nav-toggle"
          onClick={() => setMobileNavOpen((open) => !open)}
          type="button"
        >
          {mobileNavOpen ? <X size={20} /> : <ChevronDown size={20} />}
        </button>

        <nav
          aria-label="Main navigation"
          className={`primary-nav${mobileNavOpen ? " is-open" : ""}`}
          onKeyDown={closeMobileNav}
        >
          {navLinks.map((link) => (
            <a
              href={link.href}
              key={link.href}
              onClick={() => setMobileNavOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div
          aria-label="Filter menu by diet"
          className="diet-toggle"
          role="group"
        >
          <button
            aria-pressed={diet === "nonveg"}
            className={`diet-option${diet === "nonveg" ? " is-active" : ""}`}
            onClick={() => changeDiet("nonveg")}
            type="button"
          >
            {diet === "nonveg" && (
              <motion.span
                className="diet-active-pill"
                layoutId="diet-active-pill"
                transition={pillLayoutTransition}
              />
            )}
            <span className="diet-dot diet-dot--red" />
            <span>Non-veg</span>
          </button>
          <button
            aria-pressed={diet === "veg"}
            className={`diet-option${diet === "veg" ? " is-active" : ""}`}
            onClick={() => changeDiet("veg")}
            type="button"
          >
            {diet === "veg" && (
              <motion.span
                className="diet-active-pill"
                layoutId="diet-active-pill"
                transition={pillLayoutTransition}
              />
            )}
            <span className="diet-dot diet-dot--green" />
            <span>Pure veg</span>
          </button>
        </div>

        <button
          className="nav-reserve"
          onClick={() => setReservationOpen(true)}
          type="button"
        >
          Reserve <span>a table</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </button>
      </header>

      <main id="top">
        <section
          aria-labelledby="hero-title"
          className="hero-section"
          id="platter"
        >
          <div className="hero-copy">
            <p className="hero-proof">
              <span aria-label="Rated 4.4 out of 5">
                <Star aria-hidden="true" className="proof-star" size={14} />
                4.4
              </span>
              <span className="proof-divider" />
              211 verified Google reviews
              <span className="proof-divider" />
              Sector 7, HSR Layout
            </p>

            <h1 id="hero-title">
              Authentic coastal
              <br />
              flavors in the
              <br />
              <em>heart of HSR.</em>
            </h1>
            <p className="hero-description">
              From fiery Byadagi Prawn Ghee Roast to lacy Neer Dosa—experience
              Mangalorean fine dining crafted with coastal heritage.
            </p>

            <div className="hero-actions">
              <button
                className="button button--gold"
                onClick={() => setReservationOpen(true)}
                type="button"
              >
                Reserve a table
                <ArrowUpRight aria-hidden="true" size={16} />
              </button>
              <button
                className="button button--quiet"
                onClick={() => setOrderOpen(true)}
                type="button"
              >
                <ShoppingBag aria-hidden="true" size={16} />
                Order online
              </button>
            </div>

            <a className="hero-scroll" href="#menu">
              <span>Explore the 3D menu</span>
              <ArrowDown aria-hidden="true" size={15} />
            </a>
          </div>

          <div className="platter-visual">
            <div className="platter-visual__caption">
              <span>On today's table</span>
              <span>Swipe to explore</span>
            </div>
            <motion.div
              animate={{ rotate: platterRotation }}
              className="platter-field"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              dragSnapToOrigin
              onPointerLeave={resetPlatterLighting}
              onPointerMove={movePlatterLighting}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 35) {
                  selectNextHero(info.offset.x < 0 ? 1 : -1);
                }
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 88, damping: 16 }
              }
              style={{ rotateX: tiltX, rotateY: tiltY }}
              aria-describedby="platter-instructions"
              aria-label="Featured dish platter"
              role="group"
            >
              <div className="platter-shadow" />
              <div aria-hidden="true" className="platter-rim">
                <span className="plate-orbit plate-orbit--outer" />
                <span className="plate-orbit plate-orbit--inner" />
                <motion.span
                  animate={{ rotate: -platterRotation }}
                  className="plate-label plate-label--top"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 88, damping: 16 }
                  }
                >
                  HSR · 172
                </motion.span>
                <motion.span
                  animate={{ rotate: -platterRotation }}
                  className="plate-label plate-label--bottom"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 88, damping: 16 }
                  }
                >
                  COASTAL TABLE
                </motion.span>
              </div>
              <div className="featured-dish">
                <motion.div
                  animate={{ rotate: -platterRotation }}
                  className="featured-dish__image"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 88, damping: 16 }
                  }
                >
                  <DishPicture
                    dish={featuredDish}
                    eager
                    sizes="(min-width: 1280px) 468px, (min-width: 768px) 45vw, 72vw"
                  />
                </motion.div>
                <motion.span
                  aria-hidden="true"
                  className="featured-dish__glint"
                  style={{ x: glintX, y: glintY, rotate: -37 }}
                />
              </div>

              {currentHeroDishes.map((dish, index) => (
                <motion.button
                  aria-label={`Show ${dish.name}`}
                  aria-pressed={selectedHero === index}
                  className={`orbit-node orbit-node--${index + 1}${selectedHero === index ? " is-selected" : ""}`}
                  animate={{ rotate: -platterRotation }}
                  key={dish.id}
                  style={{
                    left: `${50 + Math.cos(((-135 + index * 90) * Math.PI) / 180) * 42}%`,
                    top: `${50 + Math.sin(((-135 + index * 90) * Math.PI) / 180) * 42}%`,
                    x: "-50%",
                    y: "-50%",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedHero(index);
                    setGarnishes(initialGarnishes);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 88, damping: 16 }
                  }
                  type="button"
                >
                  <span className="orbit-node__thumbnail">
                    <DishPicture dish={dish} sizes="36px" />
                  </span>
                  <span className="orbit-node__label">{dish.name}</span>
                </motion.button>
              ))}

              <motion.button
                aria-label="Move lemon garnish. Use arrow keys or drag; press Home to reset."
                className="ingredient ingredient--lime"
                onKeyDown={(event) => handleGarnishKeyDown(event, "lime")}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => moveGarnish(event, "lime")}
                onPointerUp={(event) => {
                  event.stopPropagation();
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                style={{
                  left: `${garnishes.lime.x}%`,
                  top: `${garnishes.lime.y}%`,
                }}
                type="button"
              >
                <span />
              </motion.button>
              <motion.button
                aria-label="Move curry leaf garnish. Use arrow keys or drag; press Home to reset."
                className="ingredient ingredient--leaf"
                onKeyDown={(event) => handleGarnishKeyDown(event, "leaf")}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => moveGarnish(event, "leaf")}
                onPointerUp={(event) => {
                  event.stopPropagation();
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                style={{
                  left: `${garnishes.leaf.x}%`,
                  top: `${garnishes.leaf.y}%`,
                }}
                type="button"
              >
                <span />
                <span />
                <span />
              </motion.button>
            </motion.div>
            <span className="sr-only" id="platter-instructions">
              Select a dish around the platter or drag horizontally to explore
              the featured dishes. Move garnishes with the arrow keys or a
              pointer, and press Home to reset one. Use the previous and next
              controls below the platter with a keyboard.
            </span>

            <div aria-live="polite" className="platter-info">
              <div>
                <span className="platter-info__mode">
                  {diet === "veg" ? (
                    <Leaf aria-hidden="true" size={14} />
                  ) : (
                    <Flame aria-hidden="true" size={14} />
                  )}
                  {diet === "veg" ? "From the garden" : "From the coast"}
                </span>
                <h2>{featuredDish.name}</h2>
                <p>{featuredDish.tag}</p>
              </div>
              <div className="platter-controls">
                <button
                  aria-label="Previous dish"
                  className="round-arrow"
                  onClick={() => selectNextHero(-1)}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={18} />
                </button>
                <button
                  aria-label="Next dish"
                  className="round-arrow"
                  onClick={() => selectNextHero(1)}
                  type="button"
                >
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
            <p className="hero-image-note">
              Reference food photography; plated service may differ.
              <button
                onClick={() => setPreviewDish(featuredDish)}
                type="button"
              >
                See it on your table
                <ArrowUpRight aria-hidden="true" size={13} />
              </button>
            </p>
            <button
              className="platter-reset"
              onClick={() => setGarnishes(initialGarnishes)}
              type="button"
            >
              Reset garnishes
            </button>
          </div>

          <div className="hero-edge-note" aria-hidden="true">
            <span>12°54' N</span>
            <span>From Mangaluru, with warmth</span>
          </div>
        </section>

        <section
          aria-labelledby="experience-title"
          className="story-section"
          id="experience"
        >
          <div className="story-copy">
            <h2 id="experience-title">
              A coastal table,
              <br />
              <em>right around the corner.</em>
            </h2>
            <p>
              There is a particular comfort in ghee, roasted chilli and the
              people you share them with. At 172, that coastal feeling finds a
              home in Sector 7—with Mangalorean favourites, generous gravies and
              room to linger.
            </p>
            <a className="text-link" href="#menu">
              Come hungry
              <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
          <figure className="coast-photo">
            <img
              alt="A fishing jetty on the coast of Mangaluru, Karnataka"
              decoding="async"
              loading="lazy"
              src={`${imageRoot}photos-of-mangalore-mangaluru-karnataka-india-2024.jpg`}
            />
            <figcaption>
              Mangaluru, Karnataka
              <span>Coastal reference photograph</span>
            </figcaption>
          </figure>
        </section>

        <CulinaryStory />

        <ExperienceHub
          diet={diet}
          dishes={dishes}
          onAddToOrder={(dish) => addToOrder(getDish(dish.id))}
          onSound={() => {
            if (soundEnabled) audioExperience.current?.playInteraction();
          }}
          onSoundEnabledChange={(enabled) => {
            void updateSoundPreference(enabled);
          }}
          onSoundVolumeChange={updateSoundVolume}
          onThemeChange={updateTimeTheme}
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
        />

        <section
          aria-labelledby="menu-title"
          className="menu-section"
          id="menu"
        >
          <div className="menu-header">
            <div>
              <h2 id="menu-title">
                The <em>menu</em>
              </h2>
            </div>
            <p className="price-range">
              <span>At the table</span>
              <strong>₹200–₹1,200</strong>
              per person
            </p>
          </div>

          <div className="menu-diet-line" aria-live="polite">
            <p>
              {diet === "veg"
                ? "Made without meat or seafood, chosen for the whole table."
                : "Coastal favourites, fresh seafood and tandoor-fired classics."}
            </p>
            <span className={`diet-label diet-label--${diet}`}>
              <i />
              {diet === "veg" ? "Pure vegetarian" : "Non-vegetarian"}
            </span>
          </div>

          <div aria-label="Menu categories" className="menu-tabs" role="group">
            {categoryTabs.map((tab) => (
              <button
                aria-pressed={category === tab.id}
                className={`menu-tab${category === tab.id ? " is-active" : ""}`}
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                type="button"
              >
                {category === tab.id && (
                  <motion.span
                    aria-hidden="true"
                    className="menu-tab__indicator"
                    layoutId="menu-active-pill"
                    transition={pillLayoutTransition}
                  />
                )}
                <span className="menu-tab__label">{tab.label}</span>
                <ArrowUpRight aria-hidden="true" size={14} />
              </button>
            ))}
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="dish-grid"
            initial={{ opacity: 0, y: 16 }}
            key={`${diet}-${category}`}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {menuForCategory.map((dish, index) => (
              <article
                className={`dish-card${index === 0 ? " dish-card--lead" : ""}`}
                key={dish.id}
              >
                <div className="dish-card__visual">
                  <DishPicture dish={dish} />
                  <span
                    className={`dish-diet-mark dish-diet-mark--${dish.diet}`}
                  >
                    {dish.diet === "veg" ? (
                      <Leaf aria-hidden="true" size={13} />
                    ) : (
                      <Fish aria-hidden="true" size={13} />
                    )}
                    {dish.diet === "veg" ? "Veg" : "Non-veg"}
                  </span>
                  <span className="dish-card__tag">{dish.tag}</span>
                </div>
                <div className="dish-card__body">
                  <div className="dish-card__heading">
                    <h3>{dish.name}</h3>
                    <SpiceDots level={dish.spice} />
                  </div>
                  <p>{dish.description}</p>
                  <button
                    className="add-button"
                    onClick={() => addToOrder(dish)}
                    type="button"
                  >
                    Add to order
                    <Plus aria-hidden="true" size={15} />
                  </button>
                </div>
              </article>
            ))}
            {menuForCategory.length === 0 && (
              <div className="menu-empty">
                <span className="menu-empty__icon">
                  <Leaf aria-hidden="true" size={22} />
                </span>
                <h3>A different kind of catch.</h3>
                <p>
                  Nothing in this selection is marked vegetarian. Try a coastal
                  signature or tandoor favourite instead.
                </p>
                <button
                  className="text-link"
                  onClick={() => setCategory("coastal")}
                  type="button"
                >
                  Explore vegetarian signatures
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              </div>
            )}
          </motion.div>
          <p className="menu-price-note">
            Menu selection and prices can change. Call us for today&apos;s
            prices and catch of the day.
          </p>
        </section>

        <section
          aria-labelledby="hospitality-title"
          className="hospitality-section"
        >
          <div className="hospitality-intro">
            <h2 id="hospitality-title">
              Stay for
              <br />
              <em>the feeling.</em>
            </h2>
            <p>
              A welcoming place to sit down, pick up, or bring the good stuff
              home.
            </p>
          </div>
          <div className="hospitality-list">
            <article className="hospitality-item">
              <span className="service-icon">
                <UtensilsCrossed size={20} />
              </span>
              <div>
                <h3>Fine dining</h3>
                <p>A pleasant interior and warm, attentive hospitality.</p>
              </div>
              <span className="service-note">Come in</span>
            </article>
            <article className="hospitality-item">
              <span className="service-icon">
                <ShoppingBag size={20} />
              </span>
              <div>
                <h3>Quick takeaway</h3>
                <p>Coastal comforts, carefully packed for the journey home.</p>
              </div>
              <a className="service-note" href={`tel:+${restaurantPhone}`}>
                Call to collect
              </a>
            </article>
            <article className="hospitality-item">
              <span className="service-icon">
                <Navigation size={20} />
              </span>
              <div>
                <h3>Online delivery</h3>
                <p>Ask us about direct ordering and delivery in your area.</p>
              </div>
              <a className="service-note" href={`tel:+${restaurantPhone}`}>
                Check delivery
              </a>
            </article>
            <article className="hospitality-item">
              <span className="service-icon">
                <CalendarDays size={20} />
              </span>
              <div>
                <h3>Table reservations</h3>
                <p>
                  Tell us when you&apos;re coming; we&apos;ll confirm directly.
                </p>
              </div>
              <button
                className="service-note"
                onClick={() => setReservationOpen(true)}
                type="button"
              >
                Find a table
              </button>
            </article>
          </div>
        </section>

        <section
          aria-labelledby="review-title"
          className="review-section"
          id="reviews"
        >
          <div className="review-heading">
            <div>
              <h2 id="review-title">
                Good food
                <br />
                <em>travels by word.</em>
              </h2>
            </div>
            <a
              className="rating-seal"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`HSR Coastal Curry ${restaurantAddress}`)}`}
              rel="noreferrer"
              target="_blank"
            >
              <span
                className="rating-seal__stars"
                aria-label="4.4 out of 5 stars"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    aria-hidden="true"
                    fill="currentColor"
                    key={index}
                    size={13}
                  />
                ))}
              </span>
              <strong>
                4.4 <span>/ 5</span>
              </strong>
              <span>211 guest reviews</span>
              <ArrowUpRight
                aria-hidden="true"
                className="rating-seal__arrow"
                size={14}
              />
            </a>
          </div>
          <div className="review-list">
            {reviews.map((review, index) => (
              <figure className="review-card" key={review.name}>
                <span aria-hidden="true" className="quote-mark">
                  “
                </span>
                <blockquote>{review.quote}</blockquote>
                <figcaption>
                  <span
                    className={`review-monogram review-monogram--${index + 1}`}
                  >
                    {review.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <strong>{review.name}</strong>
                    <small>{review.note}</small>
                  </span>
                  <Star
                    aria-label="5-star guest review"
                    className="review-star"
                    fill="currentColor"
                    size={14}
                  />
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="review-source-note">
            Guest quotations and rating supplied by the restaurant.
          </p>
        </section>

        <section
          aria-labelledby="visit-title"
          className="visit-section"
          id="visit"
        >
          <div className="visit-header">
            <div>
              <h2 id="visit-title">
                The table
                <br />
                <em>is set.</em>
              </h2>
            </div>
            <p>
              HSR Layout, Bengaluru
              <br />A little coastal warmth, close to home.
            </p>
          </div>

          <div className="visit-grid">
            <div className="visit-map-card">
              <div className="map-art" aria-hidden="true">
                <span className="map-road map-road--one" />
                <span className="map-road map-road--two" />
                <span className="map-road map-road--three" />
                <span className="map-road map-road--four" />
                <span className="map-block map-block--one" />
                <span className="map-block map-block--two" />
                <span className="map-block map-block--three" />
                <span className="map-block map-block--four" />
                <span className="map-pin">
                  <MapPin aria-hidden="true" size={22} />
                </span>
                <span className="map-caption">HSR Layout · not to scale</span>
              </div>
              <div className="visit-map-card__bottom">
                <span>Find your way here</span>
                <a
                  aria-label="Open directions to HSR Coastal Curry in Google Maps"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantAddress)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Navigation aria-hidden="true" size={17} />
                </a>
              </div>
            </div>

            <div className="visit-details">
              <div className="visit-detail">
                <MapPin aria-hidden="true" size={17} />
                <div>
                  <span>Come find us</span>
                  <p>{restaurantAddress}</p>
                  <small>Plus Code: WJ6P+C4 Bengaluru, Karnataka</small>
                </div>
              </div>
              <a
                className="visit-detail visit-detail--link"
                href={`tel:+${restaurantPhone}`}
              >
                <Phone aria-hidden="true" size={17} />
                <span>
                  <span>Give us a call</span>
                  <strong>096320 82153</strong>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="visit-detail__arrow"
                  size={16}
                />
              </a>
              <div className="visit-hours">
                <div className="visit-hours__title">
                  <Clock3 aria-hidden="true" size={16} />
                  <span>Bengaluru local time · {localTime || "—"}</span>
                  <span className="hours-indicator" />
                </div>
                <div className="hours-times">
                  <strong>Open daily</strong>
                  <span>Until 12:00 AM</span>
                </div>
                <div className="dinner-peak">
                  <span>Typical dinner rush</span>
                  <div
                    aria-label="Dinner tends to be busiest from 7 to 10 PM"
                    className="dinner-peak__track"
                  >
                    <i />
                  </div>
                  <span className="dinner-peak__time">
                    7 PM <b>—</b> 10 PM
                  </span>
                </div>
                <small className="peak-note">
                  An indicative evening guide, not live occupancy. Please call
                  to confirm opening and table availability.
                </small>
              </div>
              <p className="parking-note">
                <MapPin aria-hidden="true" size={14} />
                Sector 7 street-side parking availability may vary.
              </p>
            </div>
          </div>

          <div className="visit-cta">
            <p>Celebrating, catching up, or simply craving coastal?</p>
            <button
              className="button button--gold"
              onClick={() => setReservationOpen(true)}
              type="button"
            >
              Ask us to save you a table
              <ArrowUpRight aria-hidden="true" size={16} />
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a
            aria-label="HSR Coastal Curry home"
            className="footer-brand"
            href="#top"
          >
            <CoastMark className="footer-mark" />
            <span>
              HSR
              <br />
              Coastal Curry
            </span>
          </a>
          <p>
            Mangalorean soul.
            <br />
            Bengaluru address.
          </p>
          <nav aria-label="Footer navigation" className="footer-links">
            <a href="#menu">Menu</a>
            <a href="#reviews">Guest notes</a>
            <a href="#visit">Find us</a>
            <button onClick={() => setKitchenOpen(true)} type="button">
              <Bell aria-hidden="true" size={14} />
              Kitchen notes
            </button>
          </nav>
          <a className="footer-call" href={`tel:+${restaurantPhone}`}>
            <Phone aria-hidden="true" size={15} />
            096320 82153
          </a>
        </div>
        <div className="footer-credits">
          <p>
            Dish and Mangaluru reference photographs are illustrative, not
            restaurant photography. User-provided image creators and usage
            rights have not been independently verified; confirm permission
            before publication. Other cropped display images are attributed to
            their original creators.
          </p>
          <details className="image-credit-list">
            <summary>
              Image credits
              <ChevronDown aria-hidden="true" size={15} />
            </summary>
            <ul>
              {assetCredits.map((credit) => (
                <li key={credit.file}>
                  {credit.url ? (
                    <a href={credit.url} rel="noreferrer" target="_blank">
                      “{credit.title}”
                    </a>
                  ) : (
                    `“${credit.title}”`
                  )}{" "}
                  by {credit.creator}, {credit.license}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <div className="footer-bottom">
          <span>© HSR Coastal Curry</span>
          <span>Made with warmth in Bengaluru</span>
          <a href="#top">Back to the top ↑</a>
        </div>
      </footer>

      <button
        aria-label={`Open order, ${totalInOrder} ${totalInOrder === 1 ? "item" : "items"}`}
        className={`order-fab${totalInOrder > 0 ? " has-items" : ""}`}
        onClick={() => setOrderOpen(true)}
        type="button"
      >
        <ShoppingBag aria-hidden="true" size={17} />
        <span>Your order</span>
        {totalInOrder > 0 && <strong>{totalInOrder}</strong>}
      </button>

      <AnimatePresence>
        {reservationOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setReservationOpen(false)}
          >
            <motion.section
              aria-labelledby="reservation-title"
              aria-modal="true"
              className="booking-dialog"
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dialog-heading">
                <div>
                  <h2 id="reservation-title" ref={dialogHeading} tabIndex={-1}>
                    Save your <em>seat.</em>
                  </h2>
                </div>
                <button
                  aria-label="Close reservation form"
                  className="round-arrow"
                  onClick={() => setReservationOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
              <p className="dialog-description">
                Share a few details. We&apos;ll confirm your reservation
                directly over WhatsApp.
              </p>
              <form className="booking-form" onSubmit={submitReservation}>
                <label className="form-field">
                  <span>Which day?</span>
                  <span className="input-with-icon">
                    <CalendarDays aria-hidden="true" size={16} />
                    <input
                      aria-label="Reservation date"
                      min={todayIso}
                      onChange={(event) =>
                        setReservationDate(event.target.value)
                      }
                      required
                      type="date"
                      value={reservationDate}
                    />
                  </span>
                </label>
                <fieldset className="form-field guest-picker">
                  <legend>How many joining?</legend>
                  <button
                    aria-label="Remove one guest"
                    disabled={guestCount <= 1}
                    onClick={() =>
                      setGuestCount((count) => Math.max(1, count - 1))
                    }
                    type="button"
                  >
                    <Minus aria-hidden="true" size={15} />
                  </button>
                  <output aria-live="polite">
                    {guestCount} {guestCount === 1 ? "guest" : "guests"}
                  </output>
                  <button
                    aria-label="Add one guest"
                    disabled={guestCount >= 20}
                    onClick={() =>
                      setGuestCount((count) => Math.min(20, count + 1))
                    }
                    type="button"
                  >
                    <Plus aria-hidden="true" size={15} />
                  </button>
                </fieldset>
                <fieldset className="form-field form-diet">
                  <legend>Your table&apos;s preference</legend>
                  <div className="form-diet__options">
                    {(["nonveg", "veg"] as const).map((option) => (
                      <button
                        aria-pressed={reservationDiet === option}
                        className={
                          reservationDiet === option ? "is-selected" : ""
                        }
                        key={option}
                        onClick={() => setReservationDiet(option)}
                        type="button"
                      >
                        {option === "veg" ? (
                          <Leaf aria-hidden="true" size={14} />
                        ) : (
                          <Fish aria-hidden="true" size={14} />
                        )}
                        {option === "veg" ? "Pure veg" : "Non-veg"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <button
                  className="button button--gold booking-submit"
                  type="submit"
                >
                  Continue on WhatsApp
                  <ArrowUpRight aria-hidden="true" size={16} />
                </button>
                <p className="form-footnote">
                  Your request isn&apos;t a confirmed booking. We&apos;ll reply
                  directly to confirm availability.
                </p>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-backdrop modal-backdrop--drawer"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setOrderOpen(false)}
          >
            <motion.aside
              aria-labelledby="order-title"
              aria-modal="true"
              className="order-dialog"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 30 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dialog-heading">
                <div>
                  <h2 id="order-title" ref={dialogHeading} tabIndex={-1}>
                    Your <em>order.</em>
                  </h2>
                </div>
                <button
                  aria-label="Close order"
                  className="round-arrow"
                  onClick={() => setOrderOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
              {totalInOrder === 0 ? (
                <div className="order-empty">
                  <span>
                    <ShoppingBag aria-hidden="true" size={22} />
                  </span>
                  <h3>A little room on the table.</h3>
                  <p>
                    Add a dish from the menu and we&apos;ll help you send it our
                    way.
                  </p>
                  <button
                    className="button button--gold"
                    onClick={() => {
                      setOrderOpen(false);
                      document.querySelector("#menu")?.scrollIntoView({
                        behavior: prefersReducedMotion ? "auto" : "smooth",
                      });
                    }}
                    type="button"
                  >
                    Browse the menu
                    <ArrowDown aria-hidden="true" size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <ul className="order-list">
                    {Object.entries(orderCounts).map(([id, count]) => {
                      const dish = getDish(id);
                      return (
                        <li key={id}>
                          <div className="order-list__dish">
                            <span
                              className={`order-diet order-diet--${dish.diet}`}
                            >
                              {dish.diet === "veg" ? (
                                <Leaf aria-hidden="true" size={14} />
                              ) : (
                                <Fish aria-hidden="true" size={14} />
                              )}
                            </span>
                            <span>
                              <strong>{dish.name}</strong>
                              <small>{dish.tag}</small>
                            </span>
                          </div>
                          <div className="quantity-stepper">
                            <button
                              aria-label={`Remove one ${dish.name}`}
                              onClick={() => changeQuantity(id, -1)}
                              type="button"
                            >
                              <Minus aria-hidden="true" size={13} />
                            </button>
                            <span>{count}</span>
                            <button
                              aria-label={`Add one ${dish.name}`}
                              onClick={() => changeQuantity(id, 1)}
                              type="button"
                            >
                              <Plus aria-hidden="true" size={13} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="order-contact">
                    <p>
                      We&apos;ll confirm current prices, availability and
                      delivery with you directly.
                    </p>
                    <WhatsAppLink
                      className="button button--gold booking-submit"
                      message={`Hello, I'd like to ask about placing an order:\n${orderMessage}\nPlease confirm availability, current prices and delivery or takeaway options.`}
                      onClick={() => setOrderOpen(false)}
                    >
                      Ask us on WhatsApp
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </WhatsAppLink>
                    <a
                      className="order-call-link"
                      href={`tel:+${restaurantPhone}`}
                    >
                      <Phone aria-hidden="true" size={14} />
                      Prefer to call? 096320 82153
                    </a>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {kitchenOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setKitchenOpen(false)}
          >
            <motion.section
              aria-labelledby="kitchen-note-title"
              aria-modal="true"
              className="experience-dialog"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dialog-heading">
                <div>
                  <h2 id="kitchen-note-title" ref={dialogHeading} tabIndex={-1}>
                    A note from <em>the kitchen.</em>
                  </h2>
                </div>
                <button
                  aria-label="Close kitchen notes"
                  className="round-arrow"
                  onClick={() => setKitchenOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
              <p className="dialog-description">
                This is not a live kitchen feed. No authorized kitchen footage
                was supplied, so we won&apos;t pretend to show one.
              </p>
              <div className="kitchen-note">
                <span>From the menu</span>
                <p>
                  The Prawn Ghee Roast is described with prawns, Byadagi chilli,
                  pure ghee and tamarind. Ingredient sourcing and kitchen
                  footage are not available here.
                </p>
              </div>
              <a
                className="button button--gold"
                href="#coastal-story"
                onClick={() => setKitchenOpen(false)}
              >
                Read the coastal story
                <ArrowRight aria-hidden="true" size={15} />
              </a>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewDish && (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setPreviewDish(null)}
          >
            <motion.section
              aria-labelledby="dish-preview-title"
              aria-modal="true"
              className="experience-dialog experience-dialog--preview"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dialog-heading">
                <div>
                  <h2 id="dish-preview-title" ref={dialogHeading} tabIndex={-1}>
                    {previewDish.name}
                  </h2>
                </div>
                <button
                  aria-label="Close dish preview"
                  className="round-arrow"
                  onClick={() => setPreviewDish(null)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
              <div className="dish-preview-image">
                <DishPicture
                  dish={previewDish}
                  eager
                  sizes="(min-width: 600px) 420px, 88vw"
                />
              </div>
              <p className="dialog-description">
                This is a flat reference photo, not a 3D model or an AR
                placement. No optimized dish model is available, so this preview
                will not request camera access.
              </p>
              <button
                className="button button--gold"
                onClick={() => {
                  setPreviewDish(null);
                  addToOrder(previewDish);
                }}
                type="button"
              >
                Add this dish to your order
                <Plus aria-hidden="true" size={15} />
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="order-toast"
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 10 }}
          >
            <Check aria-hidden="true" size={15} />
            {toast}
            <button
              aria-label="View your order"
              onClick={() => setOrderOpen(true)}
              type="button"
            >
              View
              <ArrowRight aria-hidden="true" size={14} />
            </button>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
