import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

type ClothingItem = {
  id: string;
  name: string | null;
  image_url: string;
  last_worn: string | null;
};

export default function ClosetScreen() {
  const router = useRouter();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadClothes();
    }, []),
  );

  async function loadClothes() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Haal alle kledingstukken op
      const { data: clothesData, error: clothesError } = await supabase
        .from("clothes")
        .select("id, name, image_url")
        .eq("user_id", user.id);

      if (clothesError) throw clothesError;

      // Voor elk kledingstuk zoeken we de meest recente wear log
      const clothesWithLastWorn = await Promise.all(
        (clothesData || []).map(async (item) => {
          const { data: wearLog } = await supabase
            .from("clothing_wear_logs")
            .select("worn_at")
            .eq("clothing_id", item.id)
            .order("worn_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...item,
            last_worn: wearLog?.worn_at || null,
          };
        }),
      );

      setClothes(clothesWithLastWorn);
    } catch (error) {
      console.log("Error loading clothes:", error);
      alert("Kon kledingstukken niet laden.");
    } finally {
      setLoading(false);
    }
  }

  // Gebruik deze helper om de datum netjes te tonen
  function formatDate(dateString: string | null) {
    if (!dateString) return "Nog nooit gedragen";

    const date = new Date(dateString);

    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function getImageUrl(imageUrl: string) {
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return supabase.storage.from("clothing-images").getPublicUrl(imageUrl).data
      .publicUrl;
  }

  async function logClothingWear(clothingId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("clothing_wear_logs").insert({
        clothing_id: clothingId,
        user_id: user.id,
        worn_at: new Date().toISOString(),
      });

      if (error) {
        console.log("Error logging clothing:", error.message);
        alert("Kon kledingstuk niet loggen.");
        return;
      }

      alert("Kledingstuk gelogd!");
      loadClothes();
    } catch (err) {
      console.log(err);
      alert("Er ging iets mis.");
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/clothing/${item.id}` as any)}
          >
            <Image
              source={{ uri: getImageUrl(item.image_url) }}
              style={styles.image}
            />

            <Text style={styles.name} numberOfLines={1}>
              {item.name || "Unnamed"}
            </Text>

            <Text style={styles.date}>
              Laatst gedragen: {formatDate(item.last_worn)}
            </Text>

            <TouchableOpacity
              style={styles.logButton}
              onPress={(event) => {
                event.stopPropagation();
                logClothingWear(item.id);
              }}
            >
              <Text style={styles.logButtonText}>Log</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-clothes")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },
  grid: {
    padding: 16,
    paddingBottom: 120,
  },
  row: {
    gap: 10,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    maxWidth: "31.8%",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 8,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#E8E1D8",
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  date: {
    marginTop: 2,
    fontSize: 11,
    color: "#777",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#6B4F3F",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logButton: {
    backgroundColor: "#2f2f2f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  logButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
