import { Colors } from "@/constants/colors";
import { getDisplayName } from "@/lib/get-display-name";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email ?? "");
      setName(getDisplayName(user, ""));
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveName() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Naam ontbreekt", "Vul een naam in om op te slaan.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });

      if (error) throw error;

      Alert.alert("Opgeslagen", "Je naam is bijgewerkt.");
    } catch (error: any) {
      Alert.alert("Fout", error.message ?? "Kon naam niet opslaan.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Profiel</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Naam</Text>
          <TextInput
            style={styles.input}
            placeholder="Bijv. Klaas-Jan Huntelaar"
            placeholderTextColor={Colors.textLight}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={saveName}
            disabled={saving || loading}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Opslaan..." : "Naam opslaan"}
            </Text>
          </TouchableOpacity>
        </View>

        {email ? (
          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>Ingelogd als</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Uitloggen</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emailCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailLabel: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: "600",
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 15,
    color: Colors.text,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
