export const Colors = {
  background: "#F5F0E8",
  card: "#FFFCF7",
  cardSecondary: "#EDE5DA",
  cardTertiary: "#E2D8CB",

  brown: "#5C4A3F",
  brownLight: "#8A7568",

  primary: "#C96F5C",
  primaryDark: "#A85547",
  primaryLight: "#F4C4B8",

  green: "#6B8F71",
  greenLight: "#DDE9DE",
  greenMuted: "#A3BDA7",

  warning: "#B8956B",
  warningLight: "#F0E6D6",

  danger: "#C96F5C",
  dangerLight: "#FAE5E2",

  text: "#4A3F38",
  textSecondary: "#7A6B60",
  textLight: "#A89488",

  border: "#DDD2C6",

  shadow: "rgba(74, 63, 56, 0.1)",

  white: "#FFFFFF",
  black: "#000000",

  sky: "#6FA3C4",
  skyLight: "#DCEEF7",
  honey: "#E5A84B",
  honeyLight: "#FDF0D8",
} as const;

// Subtiele beige variaties per categorie — groene rand als rustige accent
export const CategoryColors: Record<string, { bg: string; border: string }> = {
  Top: { bg: Colors.cardSecondary, border: Colors.greenMuted },
  Bottom: { bg: Colors.cardTertiary, border: Colors.greenMuted },
  Dress: { bg: Colors.cardSecondary, border: Colors.green },
  Accessory: { bg: Colors.cardTertiary, border: Colors.green },
};

export const WeatherCardColors: Record<
  string,
  { bg: string; border: string; icon: string }
> = {
  Alles: { bg: Colors.card, border: Colors.border, icon: Colors.brownLight },
  "Warm weer": {
    bg: Colors.honeyLight,
    border: Colors.honey,
    icon: Colors.honey,
  },
  "Koud weer": {
    bg: Colors.skyLight,
    border: Colors.sky,
    icon: Colors.sky,
  },
  "Hele jaar": {
    bg: Colors.greenLight,
    border: Colors.green,
    icon: Colors.green,
  },
};

export type MentionTint = "favorite" | "calm";

export const MentionTints: Record<
  MentionTint,
  { ring: string; label: string; bg: string }
> = {
  favorite: {
    ring: Colors.primary,
    label: Colors.primary,
    bg: Colors.primaryLight,
  },
  calm: {
    ring: Colors.green,
    label: Colors.green,
    bg: Colors.greenLight,
  },
};
