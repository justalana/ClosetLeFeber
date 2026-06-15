import { getClothingImageUrl } from "@/lib/clothing-images";
import { Colors, MentionTint, MentionTints } from "@/constants/colors";
import { ClothingItem } from "@/types/clothing";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: ClothingItem | null;
  label: string;
  emoji: string;
  tint: MentionTint;
  onPress: () => void;
};

export default function MentionCard({
  item,
  label,
  emoji,
  tint,
  onPress,
}: Props) {
  const tintColors = MentionTints[tint];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!item}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>

      <View
        style={[
          styles.imageRing,
          { borderColor: tintColors.ring, backgroundColor: tintColors.bg },
        ]}
      >
        {item ? (
          <Image
            source={{ uri: getClothingImageUrl(item.image_url) }}
            style={styles.image}
          />
        ) : (
          <View style={styles.empty} />
        )}
      </View>

      <Text style={[styles.label, { color: tintColors.label }]}>{label}</Text>
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
  imageRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: Colors.cardSecondary,
  },
  empty: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: Colors.cardSecondary,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
});
