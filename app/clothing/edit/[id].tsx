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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

const categories = ["Top", "Bottom", "Dress", "Jacket", "Shoes", "Accessory"];
const seasons = ["Lente", "Zomer", "Herfst", "Winter", "Alle seizoenen"];

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
      Alert.alert("Error", "Could not load clothing item.");
      setLoading(false);
      return;
    }

    if (!data) {
      Alert.alert("Not found", "This clothing item could not be found.");
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
      Alert.alert("Error", "Could not save changes.");
      console.log(error);
      return;
    }

    router.back();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Edit item</Text>

        <View style={styles.iconButton} />
      </View>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="shirt-outline" size={48} color="#aaa" />
        </View>
      )}

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Item name"
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.options}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.option, category === item && styles.optionSelected]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.optionText,
                category === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Season</Text>
      <View style={styles.options}>
        {seasons.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.option, season === item && styles.optionSelected]}
            onPress={() => setSeason(item)}
          >
            <Text
              style={[
                styles.optionText,
                season === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveChanges}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF7F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3EFE8",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D2A26",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: "#F3EFE8",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D2A26",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: "#2D2A26",
    borderWidth: 1,
    borderColor: "#E8DFD3",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8DFD3",
  },
  optionSelected: {
    backgroundColor: "#2D2A26",
    borderColor: "#2D2A26",
  },
  optionText: {
    color: "#2D2A26",
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#2D2A26",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
