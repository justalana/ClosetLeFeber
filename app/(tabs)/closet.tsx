import { StyleSheet, Text, View } from "react-native";

export default function ClosetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Closet</Text>
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
});
