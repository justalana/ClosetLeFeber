import {
  filterClothingByCategory,
  filterClothingBySearch,
  filterClothingByWeather,
  getDeclutterCandidates,
  getForgetMeNots,
  getLeastWornItems,
  getMostWornItem,
  getNeverWornItems,
  getOutfitSuggestions,
  type ClothingItem,
} from "../utils/clothingLogic";

const mockClothing: ClothingItem[] = [
  {
    id: "1",
    name: "Blauwe trui",
    category: "Top",
    season: "Cold",
    times_worn: 8,
    last_worn: "2026-05-20",
  },
  {
    id: "2",
    name: "Wit shirt",
    category: "Top",
    season: "Warm",
    times_worn: 0,
    last_worn: null,
  },
  {
    id: "3",
    name: "Groene blouse",
    category: "Top",
    season: "All",
    times_worn: 2,
    last_worn: "2025-10-10",
  },
  {
    id: "4",
    name: "Zwarte rok",
    category: "Bottom",
    season: "Warm",
    times_worn: 1,
    last_worn: "2025-09-01",
  },
  {
    id: "5",
    name: "Jeans",
    category: "Bottom",
    season: "All",
    times_worn: 5,
    last_worn: "2026-06-01",
  },
  {
    id: "6",
    name: "Sneakers",
    category: "Shoes",
    season: "Warm",
    times_worn: 12,
    last_worn: "2026-06-10",
  },
];

describe("Clothing Logic Tests", () => {
  describe("Outfit Suggestions", () => {
    test("should return the least worn clothing items", () => {
      const result = getLeastWornItems(mockClothing, 3);

      expect(result.map((item) => item.name)).toEqual([
        "Wit shirt",
        "Zwarte rok",
        "Groene blouse",
      ]);
    });

    test("should suggest the least worn tops and bottoms", () => {
      const result = getOutfitSuggestions(mockClothing);

      expect(result.tops.map((item) => item.name)).toEqual([
        "Wit shirt",
        "Groene blouse",
        "Blauwe trui",
      ]);

      expect(result.bottoms.map((item) => item.name)).toEqual([
        "Zwarte rok",
        "Jeans",
      ]);
    });

    test("should return forget-me-not items based on least worn clothing", () => {
      const result = getForgetMeNots(mockClothing, 3);

      expect(result.map((item) => item.name)).toEqual([
        "Wit shirt",
        "Zwarte rok",
        "Groene blouse",
      ]);
    });
  });

  describe("Search and Filters", () => {
    test("should filter clothing by search term", () => {
      const result = filterClothingBySearch(mockClothing, "trui");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Blauwe trui");
    });

    test("should filter clothing by category", () => {
      const result = filterClothingByCategory(mockClothing, "Top");

      expect(result).toHaveLength(3);
      expect(result.every((item) => item.category === "Top")).toBe(true);
    });

    test("should filter clothing by weather and include all-season items", () => {
      const result = filterClothingByWeather(mockClothing, "Warm");

      expect(result.map((item) => item.name)).toContain("Wit shirt");
      expect(result.map((item) => item.name)).toContain("Groene blouse");
      expect(result.map((item) => item.name)).toContain("Zwarte rok");
      expect(result.map((item) => item.name)).toContain("Jeans");
      expect(result.map((item) => item.name)).toContain("Sneakers");
      expect(result.map((item) => item.name)).not.toContain("Blauwe trui");
    });
  });

  describe("Declutter System", () => {
    test("should find clothing that has not been worn for 6 months or longer", () => {
      const today = new Date("2026-06-30");

      const result = getDeclutterCandidates(mockClothing, today, 6);

      expect(result.map((item) => item.name)).toContain("Wit shirt");
      expect(result.map((item) => item.name)).toContain("Groene blouse");
      expect(result.map((item) => item.name)).toContain("Zwarte rok");

      expect(result.map((item) => item.name)).not.toContain("Blauwe trui");
      expect(result.map((item) => item.name)).not.toContain("Jeans");
      expect(result.map((item) => item.name)).not.toContain("Sneakers");
    });
  });

  describe("Statistics", () => {
    test("should return the most worn clothing item", () => {
      const result = getMostWornItem(mockClothing);

      expect(result?.name).toBe("Sneakers");
    });

    test("should return clothing items that have never been worn", () => {
      const result = getNeverWornItems(mockClothing);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Wit shirt");
    });
  });
});
