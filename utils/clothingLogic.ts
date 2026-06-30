export type ClothingItem = {
  id: string;
  name: string;
  category: string;
  season?: string | null;
  times_worn?: number | null;
  last_worn?: string | null;
};

export function getLeastWornItems(items: ClothingItem[], amount = 5) {
  return [...items]
    .sort((a, b) => (a.times_worn ?? 0) - (b.times_worn ?? 0))
    .slice(0, amount);
}

export function getOutfitSuggestions(items: ClothingItem[]) {
  const tops = items.filter((item) => item.category === "Top");
  const bottoms = items.filter((item) => item.category === "Bottom");

  return {
    tops: getLeastWornItems(tops, 5),
    bottoms: getLeastWornItems(bottoms, 5),
  };
}

export function getForgetMeNots(items: ClothingItem[], amount = 3) {
  return getLeastWornItems(items, amount);
}

export function getDeclutterCandidates(
  items: ClothingItem[],
  today = new Date(),
  monthsWithoutWear = 6,
) {
  return items.filter((item) => {
    if (!item.last_worn) return true;

    const lastWorn = new Date(item.last_worn);

    const monthsSinceWear =
      (today.getFullYear() - lastWorn.getFullYear()) * 12 +
      (today.getMonth() - lastWorn.getMonth());

    return monthsSinceWear >= monthsWithoutWear;
  });
}

export function filterClothingBySearch(items: ClothingItem[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return items;

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch),
  );
}

export function filterClothingByCategory(
  items: ClothingItem[],
  category: string,
) {
  if (!category || category === "All") return items;

  return items.filter((item) => item.category === category);
}

export function filterClothingByWeather(
  items: ClothingItem[],
  weather: string,
) {
  if (!weather || weather === "All") return items;

  return items.filter(
    (item) => item.season === weather || item.season === "All",
  );
}

export function getMostWornItem(items: ClothingItem[]) {
  if (items.length === 0) return null;

  return [...items].sort(
    (a, b) => (b.times_worn ?? 0) - (a.times_worn ?? 0),
  )[0];
}

export function getNeverWornItems(items: ClothingItem[]) {
  return items.filter((item) => (item.times_worn ?? 0) === 0);
}
