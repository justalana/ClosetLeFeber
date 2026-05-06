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

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    Alert.alert("Success", "Account created!");

    // GO TO LOGIN
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Start building your digital closet</Text>

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

      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        Already have an account? Log in
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
