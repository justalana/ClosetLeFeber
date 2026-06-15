import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onSubmit: () => void;
  link: ReactNode;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  emailInputProps?: TextInputProps;
  passwordInputProps?: TextInputProps;
};

export default function AuthScreenLayout({
  title,
  subtitle,
  buttonLabel,
  onSubmit,
  link,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  emailInputProps,
  passwordInputProps,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={onEmailChange}
        {...emailInputProps}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={onPasswordChange}
        {...passwordInputProps}
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>

      {link}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.white,
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
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
