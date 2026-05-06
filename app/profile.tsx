import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { supabase } from "../lib/supabase";

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
    backgroundColor: "#F7F3EE",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2E2925",
    marginBottom: 32,
  },

  logoutButton: {
    backgroundColor: "#2E2925",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
