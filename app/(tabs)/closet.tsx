import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ClosetScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Closet</Text>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-clothes")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#6B8F71",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  addButtonText: {
    color: "white",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "600",
  },
});
