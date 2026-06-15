import OptionPicker from "@/components/OptionPicker";
import { CATEGORIES_WITH_OTHER } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { DEFAULT_WEATHER, WEATHER_OPTIONS } from "@/constants/seasons";
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

export default function AddClothesScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Top");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState<string>(DEFAULT_WEATHER);

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
        <OptionPicker
          options={CATEGORIES_WITH_OTHER}
          value={category}
          onChange={setCategory}
        />

        <Text style={styles.label}>Geschikt voor</Text>
        <OptionPicker
          options={WEATHER_OPTIONS}
          value={season}
          onChange={setSeason}
          variant="pill"
        />

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
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    color: Colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.text,
  },
  imageButton: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  imageButtonText: {
    fontWeight: "600",
    color: Colors.text,
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 16,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
