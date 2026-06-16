import LoadingScreen from "@/components/LoadingScreen";
import ClothingRackCarousel from "@/components/ClothingRackCarousel";
import { Colors } from "@/constants/colors";
import { logClothingWear } from "@/lib/log-clothing-wear";
import { supabase } from "@/lib/supabase";
import { CarouselClothingItem } from "@/types/clothing";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  async function chooseOutfit() {
    if (!selectedTop || !selectedBottom) {
      Alert.alert("Nog niet compleet", "Kies eerst een top en een bottom.");
      return;
    }

    try {
      setLogging(true);

      const topResult = await logClothingWear(selectedTop.id);
      if (topResult.error) throw new Error(topResult.error);

      const bottomResult = await logClothingWear(selectedBottom.id);
      if (bottomResult.error) throw new Error(bottomResult.error);

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
    return <LoadingScreen />;
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
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 64,
    paddingBottom: 120,
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
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: Colors.textSecondary,
    width: 250,
    lineHeight: 21,
  },
  chooseButton: {
    marginHorizontal: 24,
    marginTop: 8,
    height: 58,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  chooseButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyBox: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: Colors.greenLight,
    borderWidth: 1,
    borderColor: Colors.greenMuted,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
