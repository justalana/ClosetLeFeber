import LoadingScreen from "@/components/LoadingScreen";
import { Colors, WeatherCardColors } from "@/constants/colors";
import { WEATHER_FILTER_OPTIONS } from "@/constants/seasons";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { supabase } from "@/lib/supabase";
import { ClothingItem } from "@/types/clothing";
import { getDaysSince, getLastWornRelative } from "@/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DeclutterChoice = "keep" | "maybe" | "remove";

type SelectedItem = ClothingItem & {
  choice: DeclutterChoice;
};

function getWeatherLabel(value: string | null) {
  return value || "Hele jaar";
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

        const aDays = getDaysSince(a.last_worn ?? null);
        const bDays = getDaysSince(b.last_worn ?? null);

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
    return <LoadingScreen />;
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
          {WEATHER_FILTER_OPTIONS.map((weather) => {
            const cardColor = WeatherCardColors[weather.value];

            return (
              <TouchableOpacity
                key={weather.value}
                style={[
                  styles.seasonCard,
                  cardColor && {
                    backgroundColor: cardColor.bg,
                    borderColor: cardColor.border,
                  },
                ]}
                onPress={() => startWeatherSession(weather.value)}
              >
                <Ionicons
                  name={weather.icon as any}
                  size={28}
                  color={cardColor?.icon ?? Colors.text}
                />
                <Text style={styles.seasonText}>{weather.label}</Text>
              </TouchableOpacity>
            );
          })}
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
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.progressText}>
          {currentIndex + 1} / {declutterItems.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.declutterCard}>
          <Image
            source={{ uri: getClothingImageUrl(currentItem.image_url) }}
            style={styles.image}
          />

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
                value={getLastWornRelative(currentItem.last_worn ?? null)}
              />
              <InfoRow
                label="Categorie"
                value={currentItem.category || "Onbekend"}
              />
              <InfoRow
                label="Geschikt voor"
                value={getWeatherLabel(currentItem.season ?? null)}
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
          <Ionicons name="close" size={26} color={Colors.white} />
          <Text style={styles.actionText}>Weg</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.maybeButton]}
          onPress={() => handleChoice("maybe")}
        >
          <Ionicons name="help" size={26} color={Colors.white} />
          <Text style={styles.actionText}>Twijfel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.keepButton]}
          onPress={() => handleChoice("keep")}
        >
          <Ionicons name="heart" size={26} color={Colors.white} />
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
        <Ionicons name={icon as any} size={22} color={Colors.text} />
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
              source={{ uri: getClothingImageUrl(item.image_url) }}
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
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  smallTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    minHeight: 120,
    justifyContent: "space-between",
    borderWidth: 2,
  },
  seasonText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
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
    color: Colors.textSecondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  declutterCard: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 210,
    backgroundColor: Colors.cardSecondary,
  },
  cardContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    backgroundColor: Colors.warningLight,
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
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: Colors.text,
    fontWeight: "800",
  },
  callout: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
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
    backgroundColor: Colors.danger,
  },
  maybeButton: {
    backgroundColor: Colors.warning,
  },
  keepButton: {
    backgroundColor: Colors.success,
  },
  actionText: {
    color: Colors.white,
    fontWeight: "800",
    marginTop: 2,
  },
  summarySection: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: Colors.cardSecondary,
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  summaryItemInfo: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  adviceTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  adviceText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
});
