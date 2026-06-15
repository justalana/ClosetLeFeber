export const WEATHER_OPTIONS = ["Warm weer", "Koud weer", "Hele jaar"] as const;

export type WeatherOption = (typeof WEATHER_OPTIONS)[number];

export const DEFAULT_WEATHER: WeatherOption = "Hele jaar";

export const WEATHER_FILTER_OPTIONS = [
  { label: "Alles", value: "Alles", icon: "shirt-outline" as const },
  { label: "Warm weer", value: "Warm weer", icon: "sunny-outline" as const },
  { label: "Koud weer", value: "Koud weer", icon: "snow-outline" as const },
  {
    label: "Hele jaar",
    value: "Hele jaar",
    icon: "partly-sunny-outline" as const,
  },
];
