export const Colors = {
  background: "#FBF7F2",

  card: "#FFFFFF",
  cardSecondary: "#F1ECE6",

  primary: "#C96F5C",
  primaryDark: "#A85547",
  primaryLight: "#F4C4B8",

  accent: {
    lavender: "#9B87C4",
    lavenderLight: "#EDE7F6",
    peach: "#E8907A",
    peachLight: "#FCEEE8",
    sage: "#7FAF82",
    sageLight: "#E2F0E3",
    sky: "#6FA3C4",
    skyLight: "#DCEEF7",
    honey: "#E5A84B",
    honeyLight: "#FDF0D8",
  },

  success: "#6FA872",
  successLight: "#DCEEDC",

  warning: "#E5A84B",
  warningLight: "#FDF0D8",

  danger: "#D4655A",
  dangerLight: "#FAE5E2",

  text: "#3A322E",
  textSecondary: "#73665E",
  textLight: "#A8948C",

  border: "#E5D9CF",

  shadow: "rgba(58, 50, 46, 0.1)",

  white: "#FFFFFF",
  black: "#000000",
} as const;

export type AccentName = keyof typeof Colors.accent;

export const CategoryColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  Top: {
    bg: Colors.accent.lavenderLight,
    border: Colors.accent.lavender,
    label: Colors.accent.lavender,
  },
  Bottom: {
    bg: Colors.accent.skyLight,
    border: Colors.accent.sky,
    label: Colors.accent.sky,
  },
  Dress: {
    bg: Colors.accent.peachLight,
    border: Colors.accent.peach,
    label: Colors.accent.peach,
  },
  Accessory: {
    bg: Colors.accent.sageLight,
    border: Colors.accent.sage,
    label: Colors.accent.sage,
  },
};

export const WeatherCardColors: Record<
  string,
  { bg: string; border: string; icon: string }
> = {
  Alles: {
    bg: Colors.accent.lavenderLight,
    border: Colors.accent.lavender,
    icon: Colors.accent.lavender,
  },
  "Warm weer": {
    bg: Colors.accent.honeyLight,
    border: Colors.accent.honey,
    icon: Colors.accent.honey,
  },
  "Koud weer": {
    bg: Colors.accent.skyLight,
    border: Colors.accent.sky,
    icon: Colors.accent.sky,
  },
  "Hele jaar": {
    bg: Colors.accent.sageLight,
    border: Colors.accent.sage,
    icon: Colors.accent.sage,
  },
};

export type MentionTint = "honey" | "lavender";

export const MentionTints: Record<
  MentionTint,
  { ring: string; label: string; bg: string }
> = {
  honey: {
    ring: Colors.accent.honey,
    label: Colors.accent.honey,
    bg: Colors.accent.honeyLight,
  },
  lavender: {
    ring: Colors.accent.lavender,
    label: Colors.accent.lavender,
    bg: Colors.accent.lavenderLight,
  },
};
