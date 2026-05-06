import { StyleSheet, Text, View } from "react-native";

export default function AddClothesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add clothing item</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F5EF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
