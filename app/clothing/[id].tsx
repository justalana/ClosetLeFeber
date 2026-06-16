import LoadingScreen from "@/components/LoadingScreen";
import WearChart from "@/components/WearChart";
import { Colors } from "@/constants/colors";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { logClothingWear } from "@/lib/log-clothing-wear";
import { supabase } from "@/lib/supabase";
import { ClothingItem, MonthlyWear } from "@/types/clothing";
import { formatLastWornDate } from "@/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MONTHS = [
  "Jan",
  "Feb",
  "Mrt",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export default function ClothingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [monthlyWear, setMonthlyWear] = useState<MonthlyWear[]>([]);
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
        .select("id, name, image_url, season, marked_for_declutter")
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
        .maybeSingle();

      const currentYear = new Date().getFullYear();

      const { data: yearLogs, error: yearLogsError } = await supabase
        .from("clothing_wear_logs")
        .select("worn_at")
        .eq("clothing_id", id)
        .eq("user_id", user.id)
        .gte("worn_at", `${currentYear}-01-01`)
        .lt("worn_at", `${currentYear + 1}-01-01`);

      if (yearLogsError) throw yearLogsError;

      const monthlyCounts = MONTHS.map((month, index) => {
        const count =
          yearLogs?.filter((log) => {
            const date = new Date(log.worn_at);
            return date.getMonth() === index;
          }).length || 0;

        return { month, count };
      });

      setMonthlyWear(monthlyCounts);

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

  async function handleLogWear() {
    if (!item) return;

    const { error } = await logClothingWear(item.id);

    if (error) {
      Alert.alert("Fout", "Kon kledingstuk niet loggen.");
      return;
    }

    Alert.alert("Gelukt", "Kledingstuk is gelogd.");
    loadItem();
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

  async function unmarkForDeclutter() {
    if (!item) return;

    const { error } = await supabase
      .from("clothes")
      .update({
        marked_for_declutter: false,
      })
      .eq("id", item.id);

    if (error) {
      Alert.alert("Fout", "Kon status niet aanpassen.");
      return;
    }

    loadItem();
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Kledingstuk niet gevonden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/clothing/edit/${item.id}` as any)}
        >
          <Ionicons name="create-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: getClothingImageUrl(item.image_url) }}
        style={styles.image}
      />

      <Text style={styles.name}>{item.name || "Naamloos kledingstuk"}</Text>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Laatst gedragen</Text>
        <Text style={styles.statValue}>
          {formatLastWornDate(item.last_worn ?? null)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Geschikt voor</Text>
        <Text style={styles.statValue}>
          {item.season || "Geen weersoort ingesteld"}
        </Text>
      </View>

      <WearChart data={monthlyWear} />

      {item.marked_for_declutter && (
        <View style={styles.declutterCard}>
          <Text style={styles.declutterTitle}>
            🧺 Gemarkeerd voor decluttering
          </Text>

          <Text style={styles.declutterText}>
            Dit kledingstuk staat in je decluttermand.
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={unmarkForDeclutter}
          >
            <Text style={styles.restoreButtonText}>Toch houden</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logButton} onPress={handleLogWear}>
          <Text style={styles.buttonText}>Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={deleteClothingItem}
        >
          <Text style={styles.buttonText}>Verwijderen</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  backButton: {
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 350,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 24,
    color: Colors.text,
  },
  statCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.cardSecondary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  logButton: {
    backgroundColor: Colors.green,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  declutterCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  declutterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  declutterText: {
    marginTop: 8,
    color: Colors.textSecondary,
  },
  restoreButton: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  restoreButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },
});
