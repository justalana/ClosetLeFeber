import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function ClothingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadItem();
  }, [id]);

  async function loadItem() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: clothingData, error: clothingError } = await supabase
        .from("clothes")
        .select("id, name, image_url")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (clothingError) throw clothingError;

      const { data: wearLog } = await supabase
        .from("clothing_wear_logs")
        .select("worn_at")
        .eq("clothing_id", id)
        .order("worn_at", { ascending: false })
        .limit(1)
        .single();

      setItem({
        ...clothingData,
        last_worn: wearLog?.worn_at || null,
      });
    } catch (error) {
      console.log("Error loading clothing item:", error);
      Alert.alert("Fout", "Kon kledingstuk niet laden.");
    } finally {
      setLoading(false);
    }
  }

  async function logClothingWear() {
    if (!item) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("clothing_wear_logs").insert({
        clothing_id: item.id,
        user_id: user.id,
        worn_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Gelukt", "Kledingstuk is gelogd.");
      loadItem();
    } catch (error) {
      console.log("Error logging clothing:", error);
      Alert.alert("Fout", "Kon kledingstuk niet loggen.");
    }
  }

  async function deleteClothingItem() {
    if (!item) return;

    Alert.alert(
      "Kledingstuk verwijderen",
      "Weet je zeker dat je dit kledingstuk wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("clothes")
              .delete()
              .eq("id", item.id);

            if (error) {
              Alert.alert("Fout", "Kon kledingstuk niet verwijderen.");
              return;
            }

            router.back();
          },
        },
      ],
    );
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Nog nooit gedragen";

    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Kledingstuk niet gevonden.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2f2f2f" />
      </TouchableOpacity>

      <Image source={{ uri: item.image_url }} style={styles.image} />

      <Text style={styles.name}>{item.name || "Naamloos kledingstuk"}</Text>

      <Text style={styles.date}>
        Laatst gedragen: {formatDate(item.last_worn)}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logButton} onPress={logClothingWear}>
          <Text style={styles.buttonText}>Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={deleteClothingItem}
        >
          <Text style={styles.buttonText}>Verwijderen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  backButton: {
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: 350,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  name: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 24,
    color: "#2f2f2f",
  },

  date: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },

  buttonContainer: {
    marginTop: "auto",
    gap: 12,
  },

  logButton: {
    backgroundColor: "#2f2f2f",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#b3261e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
