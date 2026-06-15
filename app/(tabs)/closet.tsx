import LoadingScreen from "@/components/LoadingScreen";
import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { WEATHER_OPTIONS } from "@/constants/seasons";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { logClothingWear } from "@/lib/log-clothing-wear";
import { supabase } from "@/lib/supabase";
import { ClothingItem } from "@/types/clothing";
import { formatLastWornDate } from "@/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ClosetScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (category) {
        setSelectedCategories([category]);
      } else {
        setSelectedCategories([]);
      }

      loadClothes();
    }, [category]),
  );

  async function loadClothes() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: clothesData, error: clothesError } = await supabase
        .from("clothes")
        .select("id, name, image_url, category, season, marked_for_declutter")
        .eq("user_id", user.id);

      if (clothesError) throw clothesError;

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

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  }

  function toggleSeason(season: string) {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((item) => item !== season)
        : [...prev, season],
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedSeasons([]);
  }

  const filteredClothes = clothes.filter((item) => {
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category || "");

    const matchesSeason =
      selectedSeasons.length === 0 ||
      selectedSeasons.includes(item.season || "");

    return matchesSearch && matchesCategory && matchesSeason;
  });

  async function handleLogWear(clothingId: string) {
    const { error } = await logClothingWear(clothingId);

    if (error) {
      alert("Kon kledingstuk niet loggen.");
      return;
    }

    loadClothes();
    alert("Kledingstuk gelogd!");
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterOpen(true)}
        >
          <Ionicons name="filter-outline" size={28} color={Colors.accent.lavender} />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Zoeken..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={Colors.textLight}
          />

          <Ionicons name="search-outline" size={22} color={Colors.text} />
        </View>
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Geen kledingstukken gevonden.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.marked_for_declutter && styles.declutterCard,
            ]}
            onPress={() => router.push(`/clothing/${item.id}` as any)}
          >
            <Image
              source={{ uri: getClothingImageUrl(item.image_url) }}
              style={styles.image}
            />

            <Text style={styles.name} numberOfLines={1}>
              {item.name || "Naamloos kledingstuk"}
            </Text>

            {item.marked_for_declutter && (
              <View style={styles.declutterBadge}>
                <Ionicons name="basket-outline" size={12} color={Colors.danger} />
                <Text style={styles.declutterBadgeText}>Declutter</Text>
              </View>
            )}

            <Text style={styles.date}>
              Laatst gedragen: {formatLastWornDate(item.last_worn ?? null)}
            </Text>

            <TouchableOpacity
              style={styles.logButton}
              onPress={(event) => {
                event.stopPropagation();
                handleLogWear(item.id);
              }}
            >
              <Text style={styles.logButtonText}>Loggen</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {filterOpen && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <Ionicons name="filter-outline" size={20} color={Colors.text} />
              <Text style={styles.filterTitle}>Filters</Text>
            </View>

            <TouchableOpacity onPress={() => setFilterOpen(false)}>
              <Ionicons name="chevron-back" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Soort</Text>

            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={styles.checkboxRow}
                onPress={() => toggleCategory(category.value)}
              >
                <Ionicons
                  name={
                    selectedCategories.includes(category.value)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={Colors.primary}
                />

                <Text style={styles.checkboxLabel}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Geschikt voor</Text>

            {WEATHER_OPTIONS.map((season) => (
              <TouchableOpacity
                key={season}
                style={styles.checkboxRow}
                onPress={() => toggleSeason(season)}
              >
                <Ionicons
                  name={
                    selectedSeasons.includes(season)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={Colors.primary}
                />

                <Text style={styles.checkboxLabel}>{season}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Filters wissen</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-clothes")}
      >
        <Ionicons name="add" size={32} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accent.lavenderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 22,
    backgroundColor: Colors.accent.skyLight,
    borderWidth: 1.5,
    borderColor: Colors.accent.sky,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 0,
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
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  declutterCard: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  declutterBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.warningLight,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  declutterBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.danger,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: Colors.cardSecondary,
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  date: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  filterPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "58%",
    backgroundColor: Colors.cardSecondary,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingTop: 18,
    paddingHorizontal: 14,
    zIndex: 10,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  filterSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.text,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  clearFiltersButton: {
    marginTop: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: "center",
  },
  clearFiltersText: {
    fontWeight: "600",
    color: Colors.text,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logButton: {
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  logButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
