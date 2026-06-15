import { supabase } from "@/lib/supabase";

export function getClothingImageUrl(imageUrl: string) {
  if (imageUrl.startsWith("http")) return imageUrl;

  return supabase.storage.from("clothing-images").getPublicUrl(imageUrl).data
    .publicUrl;
}
