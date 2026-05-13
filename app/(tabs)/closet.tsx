import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadClothes();
  }, []);

  async function loadClothes() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("clothes")
        .select("id, name, image_url, last_worn")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error loading clothes:", error.message);
        return;
      }

      setClothes(data || []);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Never worn";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
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

  return (
    <View style={styles.container}>
      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: getImageUrl(item.image_url) }}
              style={styles.image}
            />

            <Text style={styles.name} numberOfLines={1}>
              {item.name || "Unnamed"}
            </Text>

            <Text style={styles.date}>{formatDate(item.last_worn)}</Text>
          </View>
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
});
