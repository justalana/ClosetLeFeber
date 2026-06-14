import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
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
};

const categories = ["Top", "Bottom", "Dress", "Jacket", "Shoes", "Accessory"];
const weatherOptions = ["Warm weer", "Koud weer", "Hele jaar"];

function normalizeWeatherTag(value: string | null) {
  if (!value) return "Hele jaar";

  const normalized = value.toLowerCase();

  if (
    normalized.includes("warm") ||
    normalized.includes("zomer") ||
    normalized.includes("summer") ||
    normalized.includes("lente") ||
    normalized.includes("spring")
  ) {
    return "Warm weer";
  }

  if (
    normalized.includes("koud") ||
    normalized.includes("winter") ||
    normalized.includes("herfst") ||
    normalized.includes("autumn")
  ) {
    return "Koud weer";
  }

  if (
    normalized.includes("hele") ||
    normalized.includes("all") ||
    normalized.includes("alle")
  ) {
    return "Hele jaar";
  }

  return value;
}

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
        .select("id, name, image_url, category, season")
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
      selectedSeasons.includes(normalizeWeatherTag(item.season));

    return matchesSearch && matchesCategory && matchesSeason;
  });

  function formatDate(dateString: string | null) {
    if (!dateString) return "Nog nooit gedragen";

    const date = new Date(dateString);

    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

      const { error: insertError } = await supabase
        .from("clothing_wear_logs")
        .insert({
          clothing_id: clothingId,
          user_id: user.id,
          worn_at: new Date().toISOString(),
        });

      if (insertError) {
        console.log("Error logging clothing:", insertError.message);
        alert("Kon kledingstuk niet loggen.");
        return;
      }

      const { data: clothingData, error: fetchError } = await supabase
        .from("clothes")
        .select("times_worn")
        .eq("id", clothingId)
        .single();

      if (fetchError) {
        console.log("Error fetching times_worn:", fetchError.message);
        return;
      }

      const currentTimesWorn = clothingData?.times_worn || 0;

      const { error: updateError } = await supabase
        .from("clothes")
        .update({
          times_worn: currentTimesWorn + 1,
          last_worn: new Date().toISOString(),
        })
        .eq("id", clothingId);

      if (updateError) {
        console.log("Error updating times_worn:", updateError.message);
        return;
      }

      loadClothes();
      alert("Kledingstuk gelogd!");
    } catch (err) {
      console.log(err);
      alert("Er ging iets mis.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterOpen(true)}
        >
          <Ionicons name="filter-outline" size={28} color="#2F2F2F" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Zoeken..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#777"
          />

          <Ionicons name="search-outline" size={22} color="#2F2F2F" />
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

      {filterOpen && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <Ionicons name="filter-outline" size={20} color="#2F2F2F" />
              <Text style={styles.filterTitle}>Filters</Text>
            </View>

            <TouchableOpacity onPress={() => setFilterOpen(false)}>
              <Ionicons name="chevron-back" size={28} color="#2F2F2F" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Soort</Text>

            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.checkboxRow}
                onPress={() => toggleCategory(category)}
              >
                <Ionicons
                  name={
                    selectedCategories.includes(category)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color="#3F6473"
                />

                <Text style={styles.checkboxLabel}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Geschikt voor</Text>

            {weatherOptions.map((season) => (
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
                  color="#3F6473"
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
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 22,
    backgroundColor: "#E7E2DC",
    borderWidth: 1,
    borderColor: "#2F2F2F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2F2F2F",
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
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 15,
  },
  filterPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "58%",
    backgroundColor: "#F1EEE9",
    borderRightWidth: 1,
    borderColor: "#2F2F2F",
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
    color: "#2F2F2F",
  },
  filterSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2F2F2F",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#2F2F2F",
  },
  clearFiltersButton: {
    marginTop: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#D8CEC3",
    alignItems: "center",
  },
  clearFiltersText: {
    fontWeight: "600",
    color: "#2F2F2F",
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
