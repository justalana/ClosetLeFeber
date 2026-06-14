import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  category: string | null;
  last_worn: string | null;
  season: string | null;
  times_worn: number | null;
  marked_for_declutter: boolean | null;
};

type DeclutterChoice = "keep" | "maybe" | "remove";

type SelectedItem = ClothingItem & {
  choice: DeclutterChoice;
};

const weatherOptions = [
  { label: "Alles", value: "Alles", icon: "shirt-outline" },
  { label: "Warm weer", value: "Warm weer", icon: "sunny-outline" },
  { label: "Koud weer", value: "Koud weer", icon: "snow-outline" },
  { label: "Hele jaar", value: "Hele jaar", icon: "partly-sunny-outline" },
];

function getWeatherLabel(value: string | null) {
  return value || "Hele jaar";
}

function getDaysSince(dateString: string | null) {
  if (!dateString) return 9999;

  const date = new Date(dateString);
  const now = new Date();

  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getLastWornText(dateString: string | null) {
  if (!dateString) return "Nog nooit gedragen";

  const days = getDaysSince(dateString);

  if (days === 0) return "Vandaag gedragen";
  if (days === 1) return "Gisteren gedragen";

  return `${days} dagen geleden`;
}

export default function DeclutterScreen() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [finished, setFinished] = useState(false);

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

      const { data, error } = await supabase
        .from("clothes")
        .select(
          "id, name, image_url, category, last_worn, season, times_worn, marked_for_declutter",
        )
        .eq("user_id", user.id);

      if (error) throw error;

      setClothes(data || []);
    } catch (error) {
      console.log("Kon kleding niet laden:", error);
    } finally {
      setLoading(false);
    }
  }

  const declutterItems = useMemo(() => {
    if (!selectedWeather) return [];

    return clothes
      .filter((item) => {
        const itemWeather = item.season;

        if (selectedWeather === "Alles") return true;

        return itemWeather === selectedWeather;
      })
      .sort((a, b) => {
        const aTimes = a.times_worn ?? 0;
        const bTimes = b.times_worn ?? 0;

        const aDays = getDaysSince(a.last_worn);
        const bDays = getDaysSince(b.last_worn);

        const aScore = aDays - aTimes * 20;
        const bScore = bDays - bTimes * 20;

        return bScore - aScore;
      })
      .slice(0, 10);
  }, [clothes, selectedWeather]);

  const currentItem = declutterItems[currentIndex];

  async function handleChoice(choice: DeclutterChoice) {
    if (!currentItem) return;

    if (choice === "remove") {
      const { error } = await supabase
        .from("clothes")
        .update({ marked_for_declutter: true })
        .eq("id", currentItem.id);

      if (error) {
        console.log("Kon item niet markeren:", error);
        alert("Kon kledingstuk niet in de decluttermand zetten.");
        return;
      }
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        ...currentItem,
        marked_for_declutter:
          choice === "remove" ? true : currentItem.marked_for_declutter,
        choice,
      },
    ]);

    if (currentIndex + 1 >= declutterItems.length) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function resetDeclutterSession() {
    setSelectedWeather(null);
    setCurrentIndex(0);
    setSelectedItems([]);
    setFinished(false);
  }

  function startWeatherSession(weather: string) {
    setSelectedWeather(weather);
    setCurrentIndex(0);
    setSelectedItems([]);
    setFinished(false);
  }

  const removeItems = selectedItems.filter((item) => item.choice === "remove");
  const maybeItems = selectedItems.filter((item) => item.choice === "maybe");
  const keepItems = selectedItems.filter((item) => item.choice === "keep");

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#46342c" />
      </View>
    );
  }

  if (!selectedWeather) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.smallTitle}>Declutter Mode</Text>
        <Text style={styles.title}>Welke kleding wil je opruimen?</Text>
        <Text style={styles.description}>
          Kies een weersoort. De app toont daarna vooral kleding die je weinig
          of lang niet hebt gedragen.
        </Text>

        <View style={styles.seasonGrid}>
          {weatherOptions.map((weather) => (
            <TouchableOpacity
              key={weather.value}
              style={styles.seasonCard}
              onPress={() => startWeatherSession(weather.value)}
            >
              <Ionicons name={weather.icon as any} size={28} color="#46342c" />
              <Text style={styles.seasonText}>{weather.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (finished || !currentItem) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.smallTitle}>Sessie klaar</Text>
        <Text style={styles.title}>Dit is je declutter lijst</Text>

        <SummarySection
          title="Wegdoen"
          icon="trash-outline"
          items={removeItems}
          emptyText="Geen items gekozen om weg te doen."
        />

        <SummarySection
          title="Twijfel"
          icon="help-circle-outline"
          items={maybeItems}
          emptyText="Geen twijfel-items."
        />

        <SummarySection
          title="Houden"
          icon="heart-outline"
          items={keepItems}
          emptyText="Geen items gekozen om te houden."
        />

        {removeItems.length > 0 && (
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>Volgende stap</Text>
            <Text style={styles.adviceText}>
              Deze kledingstukken staan nu in je decluttermand. Je hoeft ze nog
              niet meteen te verwijderen: verzamel ze eerst in een tas en rond
              ze later af vanuit de mand.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={resetDeclutterSession}
        >
          <Text style={styles.primaryButtonText}>Nieuwe sessie starten</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sessionHeader}>
        <TouchableOpacity onPress={resetDeclutterSession}>
          <Ionicons name="chevron-back" size={26} color="#46342c" />
        </TouchableOpacity>

        <Text style={styles.progressText}>
          {currentIndex + 1} / {declutterItems.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.declutterCard}>
          <Image source={{ uri: currentItem.image_url }} style={styles.image} />

          <View style={styles.cardContent}>
            <Text style={styles.itemName}>
              {currentItem.name || "Naamloos kledingstuk"}
            </Text>

            <View style={styles.infoList}>
              <InfoRow
                label="Gedragen"
                value={`${currentItem.times_worn ?? 0}x`}
              />
              <InfoRow
                label="Laatst"
                value={getLastWornText(currentItem.last_worn)}
              />
              <InfoRow
                label="Categorie"
                value={currentItem.category || "Onbekend"}
              />
              <InfoRow
                label="Geschikt voor"
                value={getWeatherLabel(currentItem.season)}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleChoice("remove")}
        >
          <Ionicons name="close" size={26} color="#fff" />
          <Text style={styles.actionText}>Weg</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.maybeButton]}
          onPress={() => handleChoice("maybe")}
        >
          <Ionicons name="help" size={26} color="#fff" />
          <Text style={styles.actionText}>Twijfel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.keepButton]}
          onPress={() => handleChoice("keep")}
        >
          <Ionicons name="heart" size={26} color="#fff" />
          <Text style={styles.actionText}>Houden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SummarySection({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: string;
  items: SelectedItem[];
  emptyText: string;
}) {
  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryHeader}>
        <Ionicons name={icon as any} size={22} color="#46342c" />
        <Text style={styles.summaryTitle}>
          {title} ({items.length})
        </Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        items.map((item) => (
          <View key={`${item.id}-${item.choice}`} style={styles.summaryItem}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.summaryImage}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.summaryItemName}>
                {item.name || "Naamloos kledingstuk"}
              </Text>
              <Text style={styles.summaryItemInfo}>
                {item.category || "Onbekend"} · {item.times_worn ?? 0}x gedragen
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
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
  center: {
    flex: 1,
    backgroundColor: "#f8f1e8",
    justifyContent: "center",
    alignItems: "center",
  },
  smallTitle: {
    fontSize: 14,
    color: "#8d6e63",
    fontWeight: "700",
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#46342c",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#6f5a50",
    lineHeight: 22,
    marginBottom: 24,
  },
  seasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  seasonCard: {
    width: "47%",
    backgroundColor: "#fffaf4",
    borderRadius: 22,
    padding: 20,
    minHeight: 120,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ead8c8",
  },
  seasonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#46342c",
    marginTop: 18,
  },
  sessionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6f5a50",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  declutterCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ead8c8",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 210,
    backgroundColor: "#ead8c8",
  },
  cardContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#46342c",
    marginBottom: 12,
  },
  infoList: {
    backgroundColor: "#f4e7da",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#8d6e63",
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: "#46342c",
    fontWeight: "800",
  },
  callout: {
    marginTop: 12,
    backgroundColor: "#46342c",
    color: "#fffaf4",
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 66,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#b85c5c",
  },
  maybeButton: {
    backgroundColor: "#c99142",
  },
  keepButton: {
    backgroundColor: "#5f8d6a",
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
    marginTop: 2,
  },
  summarySection: {
    backgroundColor: "#fffaf4",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ead8c8",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#46342c",
  },
  emptyText: {
    color: "#8d6e63",
    fontWeight: "600",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ead8c8",
  },
  summaryImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#ead8c8",
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#46342c",
  },
  summaryItemInfo: {
    color: "#8d6e63",
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: "#46342c",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  adviceTitle: {
    color: "#fffaf4",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  adviceText: {
    color: "#fffaf4",
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#46342c",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fffaf4",
    fontSize: 16,
    fontWeight: "900",
  },
});
