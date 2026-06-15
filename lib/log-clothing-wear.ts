import { supabase } from "@/lib/supabase";

export async function logClothingWear(
  clothingId: string,
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Geen gebruiker gevonden" };

  const wornAt = new Date().toISOString();

  const { error: insertError } = await supabase
    .from("clothing_wear_logs")
    .insert({
      clothing_id: clothingId,
      user_id: user.id,
      worn_at: wornAt,
    });

  if (insertError) return { error: insertError.message };

  const { data: clothingData, error: fetchError } = await supabase
    .from("clothes")
    .select("times_worn")
    .eq("id", clothingId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const { error: updateError } = await supabase
    .from("clothes")
    .update({
      times_worn: (clothingData?.times_worn || 0) + 1,
      last_worn: wornAt,
    })
    .eq("id", clothingId);

  if (updateError) return { error: updateError.message };

  return { error: null };
}
