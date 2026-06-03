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
  "Top",
  "Bottom",
  "Dress",
  "Jacket",
  "Shoes",
  "Accessory",
  "Other",
];

export default function AddClothesScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Top");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState("Alle seizoenen");

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
        Alert.alert("Error", "You need to be logged in.");
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

      Alert.alert("Saved", "Clothing item added!");
      router.push("/closet");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Add clothing item</Text>

        <Text style={styles.label}>Name optional</Text>
        <TextInput
          style={styles.input}
          placeholder="Black hoodie"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Season</Text>

        <View style={styles.optionsRow}>
          {["Lente", "Zomer", "Herfst", "Winter", "Alle seizoenen"].map(
            (item) => (
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
            ),
          )}
        </View>

        <Text style={styles.label}>Image</Text>
        <Pressable style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {image ? "Change image" : "Choose image"}
          </Text>
        </Pressable>

        {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={addClothingItem}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save clothing item"}
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
