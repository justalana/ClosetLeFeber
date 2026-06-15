export type CategoryOption = {
  label: string;
  value: string;
  image?: number;
};

export const CATEGORIES: CategoryOption[] = [
  { label: "Top", value: "Top" },
  { label: "Broek/rok", value: "Bottom" },
  { label: "Jurk", value: "Dress" },
  { label: "Jas", value: "Jacket" },
  { label: "Schoenen", value: "Shoes" },
  { label: "Accessoire", value: "Accessory" },
];

export const CATEGORIES_WITH_OTHER: CategoryOption[] = [
  ...CATEGORIES,
  { label: "Anders", value: "Other" },
];

export const HOME_CATEGORIES: CategoryOption[] = [
  {
    label: "Top",
    value: "Top",
    image: require("../assets/images/tshirt.png"),
  },
  {
    label: "Broek/rok",
    value: "Bottom",
    image: require("../assets/images/jeans.png"),
  },
  {
    label: "Jurk",
    value: "Dress",
    image: require("../assets/images/dress.png"),
  },
  {
    label: "Accessoires",
    value: "Accessory",
    image: require("../assets/images/wristwatch.png"),
  },
];
