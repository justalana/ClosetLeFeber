import { getClothingImageUrl } from "@/lib/clothing-images";
import { Colors } from "@/constants/colors";
import { CarouselClothingItem } from "@/types/clothing";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.48;
const ITEM_SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

export type { CarouselClothingItem };

type Props = {
  items: CarouselClothingItem[];
  onSelectedChange: (item: CarouselClothingItem) => void;
};

export default function ClothingRackCarousel({
  items,
  onSelectedChange,
}: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(0);

  function handleMomentumEnd(event: any) {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setSelectedIndex(index);

    if (items[index]) {
      onSelectedChange(items[index]);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.rackWrapper}>
        <View style={styles.rackBar} />

        <Animated.FlatList
          data={items}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          bounces={false}
          contentContainerStyle={styles.listContent}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
              (index + 1) * SNAP_INTERVAL,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.82, 1, 0.82],
              extrapolate: "clamp",
            });

            const rotateY = scrollX.interpolate({
              inputRange,
              outputRange: ["35deg", "0deg", "-35deg"],
              extrapolate: "clamp",
            });

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [18, 0, 18],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.55, 1, 0.55],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                style={[
                  styles.itemContainer,
                  {
                    transform: [
                      { perspective: 900 },
                      { rotateY },
                      { scale },
                      { translateY },
                    ],
                    opacity,
                  },
                ]}
              >
                <View
                  style={[
                    styles.card,
                    selectedIndex === index && styles.selectedCard,
                  ]}
                >
                  <Image
                    source={{ uri: getClothingImageUrl(item.image_url) }}
                    style={styles.image}
                  />

                  <View style={styles.infoBox}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name || "Naamloos kledingstuk"}
                    </Text>

                    <Text style={styles.wornText}>
                      {item.times_worn ?? 0}x gedragen
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 24,
  },

  rackWrapper: {
    height: 260,
    justifyContent: "center",
  },

  rackBar: {
    position: "absolute",
    top: 24,
    alignSelf: "center",
    width: width * 0.76,
    height: 58,
    borderTopWidth: 5,
    borderColor: Colors.text,
    borderRadius: 100,
  },

  listContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
    gap: ITEM_SPACING,
    alignItems: "center",
  },

  itemContainer: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
    alignItems: "center",
  },

  card: {
    width: ITEM_WIDTH,
    height: 210,
    backgroundColor: Colors.accent.peachLight,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 3,
    backgroundColor: Colors.accent.peachLight,
  },

  image: {
    width: "100%",
    height: 145,
    resizeMode: "cover",
    backgroundColor: Colors.cardSecondary,
  },

  infoBox: {
    padding: 12,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  wornText: {
    marginTop: 3,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
