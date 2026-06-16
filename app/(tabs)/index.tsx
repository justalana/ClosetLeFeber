import LoadingScreen from "@/components/LoadingScreen";
import MentionCard from "@/components/MentionCard";
import { HOME_CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { getDisplayName } from "@/lib/get-display-name";
import { supabase } from "@/lib/supabase";
import { ClothingItem } from "@/types/clothing";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState("jij");
  const [leastWorn, setLeastWorn] = useState<ClothingItem[]>([]);
  const [mostWornItem, setMostWornItem] = useState<ClothingItem | null>(null);
  const [leastWornItem, setLeastWornItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("Kleine stapjes geven ook overzicht.");

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, []),
  );

  async function loadHomeData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserName(getDisplayName(user));

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("quote");

      if (quoteError) throw quoteError;

      if (quoteData && quoteData.length > 0) {
        const randomQuote =
          quoteData[Math.floor(Math.random() * quoteData.length)];

        setQuote(randomQuote.quote);
      }

      const { data, error } = await supabase
        .from("clothes")
        .select("id, name, image_url, category, times_worn")
        .eq("user_id", user.id);

      if (error) throw error;

      const clothes = data || [];

      const sortedLeastWorn = [...clothes].sort(
        (a, b) => (a.times_worn || 0) - (b.times_worn || 0),
      );

      const sortedMostWorn = [...clothes].sort(
        (a, b) => (b.times_worn || 0) - (a.times_worn || 0),
      );

      setLeastWorn(sortedLeastWorn.slice(0, 3));
      setLeastWornItem(sortedLeastWorn[0] || null);
      setMostWornItem(sortedMostWorn[0] || null);
    } catch (error) {
      console.log("Error loading home:", error);
      alert("Kon homepagina niet laden.");
    } finally {
      setLoading(false);
    }
  }

  function goToCategory(category: string) {
    router.push({
      pathname: "/closet",
      params: { category },
    } as any);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Hey <Text style={styles.titleAccent}>{userName}</Text> !
        </Text>
        <Text style={styles.quote}>{quote}</Text>
      </View>

      <View style={[styles.section, styles.forgottenSection]}>
        <Text style={[styles.sectionTitle, styles.forgottenTitle]}>
          Vergeet mij niet :(
        </Text>

        <View style={styles.forgottenRow}>
          {leastWorn.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.clothingCard}
              onPress={() => router.push(`/clothing/${item.id}` as any)}
            >
              <Image
                source={{ uri: getClothingImageUrl(item.image_url) }}
                style={styles.clothingImage}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/outfit" as any)}
        >
          <Text style={styles.buttonText}>Kies outfit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorieën</Text>

          <TouchableOpacity onPress={() => router.push("/closet" as any)}>
            <Text style={styles.seeAll}>Alles zien</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesRow}>
          {HOME_CATEGORIES.map((category) => {
            return (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: Colors.cardSecondary,
                    borderColor: Colors.greenMuted,
                  },
                ]}
                onPress={() => goToCategory(category.value)}
              >
                <Image
                  source={category.image!}
                  style={styles.categoryIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Honourable mentions</Text>

        <View style={styles.mentionsRow}>
          <MentionCard
            item={mostWornItem}
            label="Favoriet"
            emoji="⭐"
            tint="calm"
            onPress={() =>
              mostWornItem && router.push(`/clothing/${mostWornItem.id}` as any)
            }
          />

          <MentionCard
            item={leastWornItem}
            label="Minst gedragen"
            emoji="☹️"
            tint="favorite"
            onPress={() =>
              leastWornItem &&
              router.push(`/clothing/${leastWornItem.id}` as any)
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 110,
  },
  header: {
    alignItems: "center",
    marginTop: 26,
    marginBottom: 26,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.text,
  },
  titleAccent: {
    color: Colors.primary,
    fontWeight: "700",
  },
  quote: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 28,
    marginBottom: 30,
  },
  forgottenSection: {
    backgroundColor: Colors.greenLight,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.greenMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 10,
  },
  forgottenTitle: {
    color: Colors.brown,
  },
  forgottenRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 14,
  },
  clothingCard: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.greenMuted,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  clothingImage: {
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  categoryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 38,
    height: 38,
  },
  mentionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});
