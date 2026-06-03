import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
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
  season: string | null;
};

type MonthlyWear = {
  month: string;
  count: number;
};

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
        .select("id, name, image_url, season")
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

  function WearChart({ data }: { data: MonthlyWear[] }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Gedragen dit jaar</Text>
          <Text style={styles.chartSubtitle}>Aantal logs per maand</Text>
        </View>

        <View style={styles.chart}>
          {data.map((item) => (
            <View key={item.month} style={styles.chartItem}>
              <Text style={styles.chartCount}>{item.count}</Text>

              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(item.count / maxCount) * 100}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.chartLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2f2f2f" />
      </TouchableOpacity>

      <Image source={{ uri: item.image_url }} style={styles.image} />

      <Text style={styles.name}>{item.name || "Naamloos kledingstuk"}</Text>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Laatst gedragen</Text>
        <Text style={styles.statValue}>{formatDate(item.last_worn)}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Seizoen</Text>
        <Text style={styles.statValue}>
          {item.season || "Geen seizoen ingesteld"}
        </Text>
      </View>

      <WearChart data={monthlyWear} />

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
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

  statCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f3f0ea",
  },

  statLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2f2f2f",
  },

  chartCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f3f0ea",
  },

  chartHeader: {
    marginBottom: 16,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2f2f2f",
  },

  chartSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  chart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  chartItem: {
    alignItems: "center",
    flex: 1,
  },

  chartCount: {
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
  },

  barBackground: {
    height: 110,
    width: 12,
    borderRadius: 999,
    backgroundColor: "#ddd6cc",
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  bar: {
    width: "100%",
    minHeight: 2,
    borderRadius: 999,
    backgroundColor: "#2f2f2f",
  },

  chartLabel: {
    fontSize: 10,
    color: "#777",
    marginTop: 8,
  },

  buttonContainer: {
    marginTop: 24,
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
