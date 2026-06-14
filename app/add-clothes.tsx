import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  { label: "Top", value: "Top" },
  { label: "Broek/rok", value: "Bottom" },
  { label: "Jurk", value: "Dress" },
  { label: "Jas", value: "Jacket" },
  { label: "Schoenen", value: "Shoes" },
  { label: "Accessoire", value: "Accessory" },
  { label: "Anders", value: "Other" },
];

export default function AddClothesScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Top");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const weatherOptions = ["Warm weer", "Koud weer", "Hele jaar"];

  const [season, setSeason] = useState("Hele jaar");

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function addClothingItem() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Fout", "Je moet ingelogd zijn.");
        return;
      }

      let imageUrl = null;

      if (image?.base64) {
        const fileExt = image.uri.split(".").pop() || "jpg";
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("clothing-images")
          .upload(fileName, decode(image.base64), {
            contentType: image.mimeType ?? "image/jpeg",
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("clothing-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }
      console.log("Current user:", user?.id);

      console.log("Insert data:", {
        user_id: user.id,
        name: name.trim() || null,
        category,
        image_url: imageUrl,
      });

      const { error } = await supabase.from("clothes").insert({
        user_id: user.id,
        name,
        category,
        season,
        image_url: imageUrl,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Opgeslagen", "Kledingstuk toegevoegd!");
      router.push("/closet");
    } catch (error: any) {
      Alert.alert("Fout", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Kledingstuk toevoegen</Text>

        <Text style={styles.label}>Naam optioneel</Text>
        <TextInput
          style={styles.input}
          placeholder="Zwarte hoodie"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Soort</Text>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.categoryButton,
                category === item.value && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(item.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item.value && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Geschikt voor</Text>

        <View style={styles.optionsRow}>
          {weatherOptions.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.optionButton,
                season === item && styles.optionButtonActive,
              ]}
              onPress={() => setSeason(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  season === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Afbeelding</Text>
        <Pressable style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {image ? "Afbeelding wijzigen" : "Afbeelding kiezen"}
          </Text>
        </Pressable>

        {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={addClothingItem}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Opslaan..." : "Kledingstuk opslaan"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F5EF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "white",
  },
  categoryButtonActive: {
    backgroundColor: "#6B8F71",
  },
  categoryText: {
    color: "#333",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "white",
  },
  imageButton: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  imageButtonText: {
    fontWeight: "600",
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 16,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#6B8F71",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F1EDE8",
  },

  optionButtonActive: {
    backgroundColor: "#2F2A26",
  },

  optionText: {
    color: "#2F2A26",
    fontWeight: "500",
  },

  optionTextActive: {
    color: "#FFFFFF",
  },
});
