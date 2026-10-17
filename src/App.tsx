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
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import CulinaryStory from "./CulinaryStory";
import { BentoCard, BentoGrid } from "./components/ui/BentoGrid";
import { Magnetic } from "./components/ui/Magnetic";
import { reservationService } from "./services/ReservationService";
import type { Diet } from "./strategies/DietStrategy";

const daylightEntrance =
  "/images/generated/daylight-hsr-coastal-curry-entrance.webp";
const nighttimeEntrance =
  "/images/generated/nighttime-coastal-curry-restaurant-entrance.webp";

type MenuCategory = "coastal" | "seafood" | "tandoor" | "breads";
type ExperienceTheme = "morning" | "day" | "evening";

const readDietPreference = (): { diet: Diet; error?: string } => {
  try {
    return {
      diet:
        window.localStorage.getItem("hsr-diet-preference") === "veg"
          ? "veg"
          : "nonveg",
    };
  } catch {
    return {
      diet: "nonveg",
      error: "Your saved diet preference could not be read on this device.",
    };
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
    image: "generated/rustic-spicy-prawn-masala.webp",
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
    image: "generated/rustic-spiced-chicken-curry-bowl.webp",
    imageAlt: "Spiced chicken curry served in a rustic bowl",
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
    image: "generated/rustic-south-indian-crepes-with-chutneys.webp",
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
    image: "generated/chicken-and-roti.webp",
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
    image: "generated/mixed-vegetable-dish.webp",
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
    image: "generated/whole-fish-platter.webp",
    imageAlt: "Whole grilled fish served with coastal accompaniments",
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
    image: "generated/fish-on-banana-leaf.webp",
    imageAlt: "Fried fish served on a banana leaf",
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
    image: "generated/fish-curry-platter.webp",
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
    image: "generated/fish-platter-with-garnish.webp",
    imageAlt: "Golden fried fish with coastal garnishes",
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
    image: "generated/south-indian-banana-leaf-feast.webp",
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
    image: "generated/tandoori-chicken-platter.webp",
    imageAlt: "Tandoori chicken platter",
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
    image: "generated/tandoori-chicken-roast.webp",
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
    image: "generated/green-herb-kebabs.webp",
    imageAlt: "Green herb chicken kebabs",
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
    file: "cottage-cheese-in-spinach-gravy-palak-paneer.jpg",
    title: "Cottage cheese in spinach gravy (palak paneer)",
    creator: "Radhikamprabhu82",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Cottage_cheese_in_spinach_gravy(palak_paneer).jpg",
  },
  {
    file: "AI-generated food and restaurant illustrations",
    title: "Generated food and restaurant concept imagery",
    creator: "User-provided generated assets",
    license: "Illustrative only; not restaurant photography",
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
];

const getDish = (id: string) => dishes.find((dish) => dish.id === id)!;
const hasGeneratedDishImage = (dish: Dish) =>
  dish.image?.startsWith("generated/") ?? false;

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

function EntrancePhoto({
  placement,
  timeTheme,
}: {
  placement: "story" | "visit";
  timeTheme: ExperienceTheme;
}) {
  return (
    <figure
      aria-label="AI-generated daylight and evening concepts for a restaurant entrance; not actual restaurant photos"
      className={`entrance-photo entrance-photo--${placement}`}
      data-time-theme={timeTheme}
    >
      <img
        alt=""
        aria-hidden="true"
        className="entrance-photo__day"
        decoding="async"
        loading="lazy"
        src={daylightEntrance}
      />
      <img
        alt=""
        aria-hidden="true"
        className="entrance-photo__night"
        decoding="async"
        loading="lazy"
        src={nighttimeEntrance}
      />
      <figcaption>
        HSR Coastal Curry
        <span>AI-generated exterior concept, not an actual restaurant photo</span>
      </figcaption>
    </figure>
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
}: {
  dish: Dish;
  className?: string;
  eager?: boolean;
}) {
  if (!dish.image) {
    return <PlateIllustration label={dish.name} />;
  }

  const imageSource = dish.image;
  const isGeneratedImage = hasGeneratedDishImage(dish);

  return (
    <img
      alt={
        isGeneratedImage
          ? `AI-generated illustration of ${dish.imageAlt ?? dish.name}; not a photograph of a dish served by the restaurant`
          : `${dish.imageAlt ?? dish.name} reference photograph; illustrative, not from the restaurant`
      }
      className={className}
      decoding="async"
      draggable={false}
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      src={`${imageRoot}${imageSource}`}
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
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function App() {
  const [storedPreference] = useState(readDietPreference);
  const [diet, setDiet] = useState<Diet>(storedPreference.diet);
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
  const [reservationReady, setReservationReady] = useState(false);
  const [reservationError, setReservationError] = useState("");
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState(storedPreference.error ?? "");
  const [toastError, setToastError] = useState(Boolean(storedPreference.error));
  const [localTime, setLocalTime] = useState("");
  const [timeTheme] = useState<ExperienceTheme>(() => {
    const hour = new Date().getHours();
    return hour >= 5 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 17
        ? "day"
        : "evening";
  });
  const [garnishes, setGarnishes] = useState(initialGarnishes);
  const prefersReducedMotion = useReducedMotion();
  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, bounce: 0, duration: 0.38 };
  const surfaceTransition = prefersReducedMotion
    ? {
        opacity: { duration: 0.14, ease: "easeOut" as const },
        scale: { duration: 0.14, ease: "easeOut" as const },
        x: { duration: 0 },
        y: { duration: 0 },
      }
    : springTransition;
  const fadeTransition = prefersReducedMotion
    ? { duration: 0.14, ease: "easeOut" as const }
    : springTransition;
  const pillLayoutTransition = prefersReducedMotion
    ? { layout: { duration: 0 } }
    : { layout: { type: "spring" as const, bounce: 0, duration: 0.38 } };
  const tiltX = useSpring(0, { stiffness: 180, damping: 28 });
  const tiltY = useSpring(0, { stiffness: 180, damping: 28 });
  const glintX = useSpring(0, { stiffness: 180, damping: 28 });
  const glintY = useSpring(0, { stiffness: 180, damping: 28 });
  const dialogHeading = useRef<HTMLHeadingElement>(null);
  const mobileNavToggle = useRef<HTMLButtonElement>(null);
  const totalInOrder = Object.values(orderCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const hasCoastalRoast =
    Boolean(orderCounts["prawn-ghee-roast"]) ||
    Boolean(orderCounts["coastal-veg-ghee-roast"]);
  const hasNeerDosa = Boolean(orderCounts["neer-dosa"]);
  const tableStatus = hasCoastalRoast
    ? hasNeerDosa
      ? "Coastal ritual complete"
      : "Add Neer Dosa to complete"
    : totalInOrder > 0
      ? "Ready for the table"
      : "Build your table";
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
  const isNotFound =
    window.location.pathname !== "/" &&
    window.location.pathname !== "/index.html";

  useEffect(() => {
    document.title = isNotFound
      ? "Page not found | HSR Coastal Curry"
      : "HSR Coastal Curry | Mangalorean dining in HSR Layout";
  }, [isNotFound]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hsr-diet-preference", diet);
    } catch {
      setToastError(true);
      setToast("Your diet preference could not be saved on this device.");
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
        const dialogHeading = dialog.querySelector<HTMLElement>(
          '[tabindex="-1"]',
        );
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogHeading)
        ) {
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
    const pairingHint =
      (dish.id === "prawn-ghee-roast" ||
        dish.id === "coastal-veg-ghee-roast") &&
      !hasNeerDosa
        ? " Pair with lacy Neer Dosa to complete the coastal ritual."
        : "";
    setToastError(false);
    setToast(`${dish.name} added to your order.${pairingHint}`);
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

  const reservationDraft = { date: reservationDate, guests: guestCount, diet: reservationDiet } as const;
  const reservationMessage = reservationService.createWhatsAppMessage(reservationDraft);

  const submitReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = reservationService.validate(reservationDraft, todayIso);
    if (!validation.valid) {
      setReservationError(validation.message);
      setReservationReady(false);
      return;
    }
    setReservationError("");
    setReservationReady(true);
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
    if (event.key === "Escape") {
      setMobileNavOpen(false);
      mobileNavToggle.current?.focus();
    }
  };

  const navLinks = [
    { href: "#coastal-story", label: "Coastal story" },
    { href: "#menu", label: "Signature menu" },
    { href: "#experience", label: "Experience" },
    { href: "#reviews", label: "Reviews" },
    { href: "#visit", label: "Location" },
  ];

  if (isNotFound) {
    return (
      <main className="not-found">
        <CoastMark className="not-found__mark" />
        <p>HSR Coastal Curry</p>
        <h1>This page wandered off.</h1>
        <span>
          That address does not lead to a page on our menu. Let&apos;s get you
          back to the table.
        </span>
        <a className="button button--gold" href="/">
          Back to the home page
          <ArrowUpRight aria-hidden="true" size={16} />
        </a>
      </main>
    );
  }

  return (
    <div
      className="restaurant-shell"
      data-mode={diet}
      data-time-theme={timeTheme}
    >
      <a className="skip-link" href="#top">
        Skip to content
      </a>
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
          aria-controls="primary-navigation"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          className="mobile-nav-toggle"
          onClick={() => setMobileNavOpen((open) => !open)}
          ref={mobileNavToggle}
          type="button"
        >
          {mobileNavOpen ? <X size={20} /> : <ChevronDown size={20} />}
        </button>

        <nav
          aria-label="Main navigation"
          className={`primary-nav${mobileNavOpen ? " is-open" : ""}`}
          id="primary-navigation"
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
          <div aria-hidden="true" className="hero-aura" />
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
              Coastal food
              <br />
              in HSR.
            </h1>
            <p className="hero-description">
              From fiery Byadagi Prawn Ghee Roast to lacy Neer Dosa—experience
              Mangalorean fine dining crafted with coastal heritage.
            </p>

            <div className="hero-actions">
              <Magnetic>
                <button
                  className="button button--gold"
                  onClick={() => setReservationOpen(true)}
                  type="button"
                >
                  Reserve a table
                  <ArrowUpRight aria-hidden="true" size={16} />
                </button>
              </Magnetic>
              <Magnetic strength={0.08}>
                <button
                  className="button button--quiet"
                  onClick={() => setOrderOpen(true)}
                  type="button"
                >
                  <ShoppingBag aria-hidden="true" size={16} />
                  Order online
                </button>
              </Magnetic>
            </div>

            <a className="hero-scroll" href="#coastal-story">
              <span>Scroll to unlayer the roast</span>
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
              dragConstraints={{ left: -36, right: 36 }}
              dragElastic={0.55}
              dragSnapToOrigin
              onPointerLeave={resetPlatterLighting}
              onPointerMove={movePlatterLighting}
              onDragEnd={(_, info) => {
                const projectedX =
                  info.offset.x +
                  (info.velocity.x / 1000) * (0.998 / (1 - 0.998));
                if (Math.abs(projectedX) > 80) {
                  selectNextHero(projectedX < 0 ? 1 : -1);
                }
              }}
              transition={springTransition}
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
                  transition={springTransition}
                >
                  HSR · 172
                </motion.span>
                <motion.span
                  animate={{ rotate: -platterRotation }}
                  className="plate-label plate-label--bottom"
                  transition={springTransition}
                >
                  COASTAL TABLE
                </motion.span>
              </div>
              <div className="featured-dish">
                <motion.div
                  animate={{ rotate: -platterRotation }}
                  className="featured-dish__image"
                  transition={springTransition}
                >
                  <DishPicture dish={featuredDish} eager />
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
                  transition={springTransition}
                  type="button"
                >
                  <span className="orbit-node__thumbnail">
                    <DishPicture dish={dish} />
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
              {hasGeneratedDishImage(featuredDish)
                ? "AI-generated food illustration; not restaurant photography."
                : "Reference food photography; plated service may differ."}
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

        <CulinaryStory
          diet={diet}
          onAddToOrder={() =>
            addToOrder(
              getDish(
                diet === "veg" ? "coastal-veg-ghee-roast" : "prawn-ghee-roast",
              ),
            )
          }
        />

        <section aria-labelledby="menu-title" className="menu-section" id="menu">
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
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }
            }
            key={`${diet}-${category}`}
            transition={
              prefersReducedMotion
                ? fadeTransition
                : { type: "spring", bounce: 0, duration: 0.38 }
            }
          >
            {menuForCategory.map((dish, index) => (
              <article
                className={`dish-card${index === 0 ? " dish-card--lead" : ""}`}
                key={dish.id}
              >
                <div className="dish-card__visual">
                  <DishPicture dish={dish} />
                  {hasGeneratedDishImage(dish) && (
                    <span className="dish-card__image-note">
                      Generated illustration
                    </span>
                  )}
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
          aria-labelledby="experience-title"
          className="story-section"
          id="experience"
        >
          <div className="story-copy">
            <h2 id="experience-title">
              A coastal table,
              <br />
              close to home.
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
          <EntrancePhoto placement="story" timeTheme={timeTheme} />
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
          <BentoGrid className="hospitality-list">
            <BentoCard className="hospitality-item">
              <span className="service-icon">
                <UtensilsCrossed size={20} />
              </span>
              <div>
                <h3>Fine dining</h3>
                <p>A pleasant interior and warm, attentive hospitality.</p>
              </div>
              <span className="service-note">Come in</span>
            </BentoCard>
            <BentoCard className="hospitality-item">
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
            </BentoCard>
            <BentoCard className="hospitality-item">
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
            </BentoCard>
            <BentoCard className="hospitality-item">
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
            </BentoCard>
          </BentoGrid>
        </section>

        <section
          aria-labelledby="review-title"
          className="review-section"
          id="reviews"
        >
          <div className="review-heading">
            <div>
              <h2 id="review-title">
                Good
                <br />
                words.
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

          <EntrancePhoto placement="visit" timeTheme={timeTheme} />

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
            Generated food and restaurant visuals are illustrative, not photos
            of dishes, staff, or spaces at the restaurant. User-provided image
            creators and usage rights have not been independently verified;
            confirm permission before publication. Other reference images are
            attributed to their original creators.
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
          <span>© {new Date().getFullYear()} HSR Coastal Curry</span>
          <span>Made with warmth in Bengaluru</span>
          <a href="#top">Back to the top ↑</a>
        </div>
      </footer>

      <button
        aria-label={`Open order, ${totalInOrder} ${totalInOrder === 1 ? "item" : "items"}. ${tableStatus}`}
        className={`order-fab${totalInOrder > 0 ? " has-items" : ""}`}
        onClick={() => setOrderOpen(true)}
        type="button"
      >
        <ShoppingBag aria-hidden="true" size={17} />
        <span className="order-fab__label">
          Your table
          <small>{tableStatus}</small>
        </span>
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
            transition={fadeTransition}
          >
            <motion.section
              aria-labelledby="reservation-title"
              aria-modal="true"
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="booking-dialog"
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              initial={
                prefersReducedMotion
                  ? { opacity: 0, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={surfaceTransition}
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
                        {
                          setReservationDate(event.target.value);
                          setReservationError("");
                          setReservationReady(false);
                        }
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
                      {
                        setReservationReady(false);
                        setReservationError("");
                        setGuestCount((count) => Math.max(1, count - 1));
                      }
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
                      {
                        setReservationReady(false);
                        setReservationError("");
                        setGuestCount((count) => Math.min(20, count + 1));
                      }
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
                        onClick={() => {
                          setReservationReady(false);
                          setReservationError("");
                          setReservationDiet(option);
                        }}
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
                {reservationReady ? (
                  <>
                    <p className="reservation-ready" role="status">
                      Your request is ready. Send it in WhatsApp; your table
                      isn&apos;t reserved until the restaurant confirms.
                    </p>
                    <WhatsAppLink
                      className="button button--gold booking-submit"
                      message={reservationMessage}
                    >
                      Open WhatsApp to send
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </WhatsAppLink>
                    <button
                      className="reservation-edit"
                      onClick={() => setReservationReady(false)}
                      type="button"
                    >
                      Edit reservation details
                    </button>
                  </>
                ) : (
                  <>
                    {reservationError && (
                      <p className="form-error" role="alert">
                        {reservationError}
                      </p>
                    )}
                    <button
                      className="button button--gold booking-submit"
                      type="submit"
                    >
                      Prepare WhatsApp request
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </button>
                  </>
                )}
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
            transition={fadeTransition}
          >
            <motion.aside
              aria-labelledby="order-title"
              aria-modal="true"
              className="order-dialog"
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : window.innerWidth <= 680
                    ? { opacity: 0, y: 30 }
                    : { opacity: 0, x: 30 }
              }
              initial={
                prefersReducedMotion
                  ? { opacity: 0, x: 0, y: 0 }
                  : window.innerWidth <= 680
                    ? { opacity: 0, y: 30 }
                    : { opacity: 0, x: 30 }
              }
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={surfaceTransition}
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
            transition={fadeTransition}
          >
            <motion.section
              aria-labelledby="kitchen-note-title"
              aria-modal="true"
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="experience-dialog"
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              initial={
                prefersReducedMotion
                  ? { opacity: 0, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={surfaceTransition}
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
            transition={fadeTransition}
          >
            <motion.section
              aria-labelledby="dish-preview-title"
              aria-modal="true"
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="experience-dialog experience-dialog--preview"
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              initial={
                prefersReducedMotion
                  ? { opacity: 0, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={surfaceTransition}
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
                <DishPicture dish={previewDish} eager />
              </div>
              <p className="dialog-description">
                This is a flat{" "}
                {hasGeneratedDishImage(previewDish)
                  ? "AI-generated illustration"
                  : "reference photo"}
                , not a 3D model or AR placement. No optimized dish model is
                available, so this preview will not request camera access.
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
            className={`order-toast${toastError ? " order-toast--error" : ""}`}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
            }
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
            }
            role={toastError ? "alert" : "status"}
            transition={fadeTransition}
          >
            {toastError ? (
              <X aria-hidden="true" size={15} />
            ) : (
              <Check aria-hidden="true" size={15} />
            )}
            {toast}
            {!toastError && (
              <button
                aria-label="View your order"
                onClick={() => setOrderOpen(true)}
                type="button"
              >
                View
                <ArrowRight aria-hidden="true" size={14} />
              </button>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
