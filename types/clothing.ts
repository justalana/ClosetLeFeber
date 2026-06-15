export type ClothingItem = {
  id: string;
  name: string | null;
  image_url: string;
  category?: string | null;
  last_worn?: string | null;
  season?: string | null;
  times_worn?: number | null;
  marked_for_declutter?: boolean | null;
};

export type CarouselClothingItem = Pick<
  ClothingItem,
  "id" | "name" | "image_url" | "times_worn"
>;

export type MonthlyWear = {
  month: string;
  count: number;
};
