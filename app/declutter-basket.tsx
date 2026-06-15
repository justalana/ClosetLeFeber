import LoadingScreen from "@/components/LoadingScreen";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { supabase } from "@/lib/supabase";
import { ClothingItem } from "@/types/clothing";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DeclutterBasketScreen() {
  const router = useRouter();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadBasketItems();
    }, []),
  );

  async function loadBasketItems() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("clothes")
        .select("id, name, image_url, category, times_worn, last_worn")
        .eq("user_id", user.id)
        .eq("marked_for_declutter", true)
        .order("name", { ascending: true });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.log("Kon decluttermand niet laden:", error);
      Alert.alert("Fout", "Kon decluttermand niet laden.");
    } finally {
      setLoading(false);
    }
  }

  async function keepItem(itemId: string) {
    const { error } = await supabase
      .from("clothes")
      .update({ marked_for_declutter: false })
      .eq("id", itemId);

    if (error) {
      Alert.alert("Fout", "Kon kledingstuk niet terugzetten.");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function deleteItem(itemId: string) {
    Alert.alert(
      "Definitief verwijderen",
      "Heb je dit kledingstuk echt weggebracht of weggedaan? Dan halen we het uit je digitale kast.",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Ja, verwijderen",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("clothes")
              .delete()
              .eq("id", itemId);

            if (error) {
              Alert.alert("Fout", "Kon kledingstuk niet verwijderen.");
              return;
            }

            setItems((prev) => prev.filter((item) => item.id !== itemId));
          },
        },
      ],
    );
  }

  if (loading) {
    return <LoadingScreen color="#46342c" backgroundColor="#f8f1e8" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.smallTitle}>Decluttermand</Text>
      <Text style={styles.title}>{items.length} items apart gezet</Text>

      <Text style={styles.description}>
        Dit zijn kledingstukken die je hebt gemarkeerd voor decluttering. Je
        kunt ze eerst in een tas stoppen en later definitief uit je kast halen.
      </Text>

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="basket-outline" size={42} color="#8d6e63" />
          <Text style={styles.emptyTitle}>Je mand is leeg</Text>
          <Text style={styles.emptyText}>
            Items die je met “Weg” markeert komen hier terecht.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/clothing/${item.id}` as any)}
            >
              <Image
                source={{ uri: getClothingImageUrl(item.image_url) }}
                style={styles.image}
              />

              <View style={styles.cardInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name || "Naamloos kledingstuk"}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.category || "Onbekend"} · {item.times_worn ?? 0}x
                  gedragen
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.keepButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      keepItem(item.id);
                    }}
                  >
                    <Text style={styles.keepButtonText}>Toch houden</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      deleteItem(item.id);
                    }}
                  >
                    <Text style={styles.doneButtonText}>Weggebracht</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f1e8",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  smallTitle: {
    fontSize: 14,
    color: "#8d6e63",
    fontWeight: "800",
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#46342c",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#6f5a50",
    lineHeight: 22,
    marginBottom: 22,
  },
  emptyCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ead8c8",
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#46342c",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#8d6e63",
    marginTop: 6,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fffaf4",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C45A4D",
    gap: 12,
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: "#ead8c8",
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#46342c",
  },
  itemMeta: {
    color: "#8d6e63",
    marginTop: 3,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  keepButton: {
    flex: 1,
    backgroundColor: "#F3EFE8",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  keepButtonText: {
    color: "#46342c",
    fontWeight: "800",
    fontSize: 12,
  },
  doneButton: {
    flex: 1,
    backgroundColor: "#8A2F24",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fffaf4",
    fontWeight: "800",
    fontSize: 12,
  },
});
