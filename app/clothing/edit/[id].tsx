import LoadingScreen from "@/components/LoadingScreen";
import OptionPicker from "@/components/OptionPicker";
import { CATEGORIES_WITH_OTHER } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { WEATHER_OPTIONS } from "@/constants/seasons";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditClothingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("clothes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.log("Fetch item error:", error);
      Alert.alert("Fout", "Kon kledingstuk niet laden.");
      setLoading(false);
      return;
    }

    if (!data) {
      Alert.alert("Niet gevonden", "Dit kledingstuk kon niet worden gevonden.");
      setLoading(false);
      return;
    }

    setName(data.name ?? "");
    setImageUrl(data.image_url ?? "");
    setCategory(data.category ?? null);
    setSeason(data.season ?? null);

    setLoading(false);
  }

  async function saveChanges() {
    if (!id) return;

    setSaving(true);

    const { error } = await supabase
      .from("clothes")
      .update({
        name,
        category,
        season,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      Alert.alert("Fout", "Kon wijzigingen niet opslaan.");
      console.log(error);
      return;
    }

    router.back();
  }

  if (loading) {
    return <LoadingScreen backgroundColor={Colors.background} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Bewerken</Text>

        <View style={styles.iconButton} />
      </View>

      {imageUrl ? (
        <Image
          source={{ uri: getClothingImageUrl(imageUrl) }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="shirt-outline" size={48} color={Colors.textLight} />
        </View>
      )}

      <Text style={styles.label}>Naam</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Naam kledingstuk"
        style={styles.input}
      />

      <Text style={styles.label}>Soort</Text>
      <OptionPicker
        options={CATEGORIES_WITH_OTHER}
        value={category}
        onChange={setCategory}
        variant="pill"
      />

      <Text style={styles.label}>Geschikt voor</Text>
      <OptionPicker
        options={WEATHER_OPTIONS}
        value={season}
        onChange={setSeason}
        variant="pill"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveChanges}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Opslaan..." : "Wijzigingen opslaan"}
        </Text>
      </TouchableOpacity>
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
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: Colors.cardSecondary,
  },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: Colors.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
