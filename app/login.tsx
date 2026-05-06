import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    // GO TO HOME/TABS
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to your closet</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <Link href="/register" style={styles.link}>
        No account yet? Create one
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2E2925",
  },
  subtitle: {
    fontSize: 16,
    color: "#7D7268",
    marginBottom: 28,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2E2925",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#2E2925",
    fontWeight: "600",
  },
});
