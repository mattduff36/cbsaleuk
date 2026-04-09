export const BRAND = {
  name: "carbootsale.com",
  domain: "carbootsale.com",
  strapline: "The clean, trusted way to find and run UK car boot sales.",
  description:
    "Search verified UK car boot sales, check the weekend outlook, and manage premium organiser listings without the clutter of ad-heavy directories.",
  tagline:
    "A cleaner marketplace for boot sale buyers, organisers, and the next early-morning bargain.",
  supportEmail: "hello@carbootsale.com",
  accent: {
    brown: "#4A3428",
    green: "#7FFF00",
    sky: "#87CEEB",
    cream: "#F5F0E8",
    ink: "#16120E",
  },
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/car-boot-tips", label: "Tips" },
  { href: "/subscribe", label: "Premium" },
];

export const HOME_FEATURES = [
  {
    icon: "/icons/search.png",
    title: "Search nearby sales quickly",
    description:
      "Use location search, radius filters, and featured picks to find the right field before sunrise.",
  },
  {
    icon: "/icons/map.png",
    title: "See the practical details first",
    description:
      "Toilets, refreshments, accessibility, parking, and indoor or outdoor setup are surfaced before you travel.",
  },
  {
    icon: "/icons/directions.png",
    title: "Get there with confidence",
    description:
      "Open directions, save the next event to your calendar, and keep organiser contact details close at hand.",
  },
  {
    icon: "/icons/outdoor.png",
    title: "Run a premium organiser profile",
    description:
      "Verified badges, richer imagery, social links, event announcements, and admin-backed moderation keep listings trustworthy.",
  },
];

export const TIER_FEATURES = {
  free: [
    "One live image",
    "Essential pricing and opening times",
    "Directions and contact details",
    "Listed in search results",
  ],
  premium: [
    "Multiple images and richer storytelling",
    "Verified organiser badge after review",
    "Featured placement options and announcements",
    "Subscription-backed listing management",
  ],
};
