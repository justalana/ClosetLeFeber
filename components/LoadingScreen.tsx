import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  color?: string;
  backgroundColor?: string;
};

export default function LoadingScreen({
  color = Colors.primary,
  backgroundColor,
}: Props) {
  return (
    <View style={[styles.center, backgroundColor && { backgroundColor }]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
