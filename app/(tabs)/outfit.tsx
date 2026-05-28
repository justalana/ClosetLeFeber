import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ClothingRackCarousel, {
  CarouselClothingItem,
} from "../../components/ClothingRackCarousel";
import { supabase } from "../../lib/supabase";

export default function OutfitScreen() {
  const [tops, setTops] = useState<CarouselClothingItem[]>([]);
  const [bottoms, setBottoms] = useState<CarouselClothingItem[]>([]);

  const [selectedTop, setSelectedTop] = useState<CarouselClothingItem | null>(
    null,
  );
  const [selectedBottom, setSelectedBottom] =
    useState<CarouselClothingItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOutfitItems();
    }, []),
  );

  async function loadOutfitItems() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: topData, error: topError } = await supabase
        .from("clothes")
        .select("id, name, image_url, times_worn")
        .eq("user_id", user.id)
        .eq("category", "Top")
        .order("times_worn", { ascending: true })
        .limit(3);

      if (topError) throw topError;

      const { data: bottomData, error: bottomError } = await supabase
        .from("clothes")
        .select("id, name, image_url, times_worn")
        .eq("user_id", user.id)
        .eq("category", "Bottom")
        .order("times_worn", { ascending: true })
        .limit(3);

      if (bottomError) throw bottomError;

      setTops(topData || []);
      setBottoms(bottomData || []);

      setSelectedTop(topData?.[0] || null);
      setSelectedBottom(bottomData?.[0] || null);
    } catch (error) {
      console.log(error);
      Alert.alert("Oeps", "De outfit items konden niet geladen worden.");
    } finally {
      setLoading(false);
    }
  }

  async function logItem(item: CarouselClothingItem) {
    const newTimesWorn = (item.times_worn ?? 0) + 1;
    const wornAt = new Date().toISOString();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Geen gebruiker gevonden");

    const { error: logError } = await supabase
      .from("clothing_wear_logs")
      .insert({
        clothing_id: item.id,
        user_id: user.id,
        worn_at: wornAt,
      });

    if (logError) throw logError;

    const { error: updateError } = await supabase
      .from("clothes")
      .update({
        times_worn: newTimesWorn,
        last_worn: wornAt,
      })
      .eq("id", item.id);

    if (updateError) throw updateError;
  }

  async function chooseOutfit() {
    if (!selectedTop || !selectedBottom) {
      Alert.alert("Nog niet compleet", "Kies eerst een top en een bottom.");
      return;
    }

    try {
      setLogging(true);

      await logItem(selectedTop);
      await logItem(selectedBottom);

      Alert.alert(
        "Outfit gelogd",
        "Deze kledingstukken zijn eindelijk weer uit de kast gehaald.",
      );

      loadOutfitItems();
    } catch (error) {
      console.log(error);
      Alert.alert("Oeps", "De outfit kon niet gelogd worden.");
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A66A4C" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Outfit Generator</Text>
          <Text style={styles.subtitle}>
            Deze kledingstukken verdienen vandaag wat aandacht.
          </Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="sparkles-outline" size={24} color="#A66A4C" />
        </View>
      </View>

      {tops.length === 0 || bottoms.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nog niet genoeg kleding</Text>
          <Text style={styles.emptyText}>
            Voeg minimaal één top en één bottom toe om outfit suggesties te
            krijgen.
          </Text>
        </View>
      ) : (
        <>
          <ClothingRackCarousel
            items={tops}
            onSelectedChange={setSelectedTop}
          />

          <ClothingRackCarousel
            items={bottoms}
            onSelectedChange={setSelectedBottom}
          />

          <TouchableOpacity
            style={[styles.chooseButton, logging && styles.disabledButton]}
            onPress={chooseOutfit}
            disabled={logging}
          >
            <Text style={styles.chooseButtonText}>
              {logging ? "Bezig met loggen..." : "Kies deze outfit"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F2",
  },

  content: {
    paddingTop: 64,
    paddingBottom: 120,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9F2",
  },

  header: {
    paddingHorizontal: 24,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#2F2A26",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#7B6F66",
    width: 250,
    lineHeight: 21,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F2E3D4",
    justifyContent: "center",
    alignItems: "center",
  },

  chooseButton: {
    marginHorizontal: 24,
    marginTop: 8,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#A66A4C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  chooseButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
  },

  emptyBox: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#F6EFE7",
    borderWidth: 2,
    borderColor: "#E2D3C4",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2F2A26",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7B6F66",
  },
});
