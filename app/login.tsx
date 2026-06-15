import AuthScreenLayout from "@/components/AuthScreenLayout";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";

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

    router.replace("/(tabs)");
  }

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Log in to your closet"
      buttonLabel="Log in"
      onSubmit={signIn}
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      link={
        <Link href="/register" style={styles.link}>
          No account yet? Create one
        </Link>
      }
    />
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 20,
    textAlign: "center",
    color: Colors.text,
    fontWeight: "600",
  },
});
