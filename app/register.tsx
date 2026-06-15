import AuthScreenLayout from "@/components/AuthScreenLayout";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";

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
    router.replace("/login");
  }

  return (
    <AuthScreenLayout
      title="Create account"
      subtitle="Start building your digital closet"
      buttonLabel="Create account"
      onSubmit={signUp}
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      link={
        <Link href="/login" style={styles.link}>
          Already have an account? Log in
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
