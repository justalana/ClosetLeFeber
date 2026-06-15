import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getClothingImageUrl } from "@/lib/clothing-images";
import { ClothingItem } from "@/types/clothing";

type Props = {
  item: ClothingItem | null;
  label: string;
  emoji: string;
  onPress: () => void;
};

export default function MentionCard({ item, label, emoji, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!item}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>

      {item ? (
        <Image
          source={{ uri: getClothingImageUrl(item.image_url) }}
          style={styles.image}
        />
      ) : (
        <View style={styles.empty} />
      )}

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {item?.name || "Naamloos kledingstuk"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    alignItems: "center",
  },
  emoji: {
    fontSize: 28,
    marginBottom: -8,
    zIndex: 2,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#D9D9D9",
  },
  empty: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#D9D9D9",
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  name: {
    fontSize: 12,
    color: "#777",
    maxWidth: 120,
  },
});
