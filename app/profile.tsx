import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
