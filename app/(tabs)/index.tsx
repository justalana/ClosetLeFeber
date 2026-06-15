import LoadingScreen from "@/components/LoadingScreen";
import MentionCard from "@/components/MentionCard";
import { HOME_CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { getClothingImageUrl } from "@/lib/clothing-images";
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

  const [userName, setUserName] = useState("daar");
  const [leastWorn, setLeastWorn] = useState<ClothingItem[]>([]);
  const [mostWornItem, setMostWornItem] = useState<ClothingItem | null>(null);
  const [leastWornItem, setLeastWornItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

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

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "daar";

      setUserName(name);

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
        <Text style={styles.title}>Hey {userName} !</Text>
        <Text style={styles.quote}>Kleine stapjes geven ook overzicht.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vergeet mij niet :(</Text>

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
          {HOME_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={styles.categoryButton}
              onPress={() => goToCategory(category.value)}
            >
              <Image
                source={category.image!}
                style={styles.categoryIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Honourable mentions</Text>

        <View style={styles.mentionsRow}>
          <MentionCard
            item={mostWornItem}
            label="Favoriet"
            emoji="⭐"
            onPress={() =>
              mostWornItem && router.push(`/clothing/${mostWornItem.id}` as any)
            }
          />

          <MentionCard
            item={leastWornItem}
            label="Minst gedragen"
            emoji="☹️"
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
    color: "#111",
  },
  quote: {
    fontSize: 14,
    color: "#111",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 28,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111",
    marginBottom: 10,
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
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#D9D9D9",
    overflow: "hidden",
  },
  clothingImage: {
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 38,
  },
  buttonText: {
    color: "#111",
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 12,
    color: "#111",
  },
  categoryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D9D9D9",
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
