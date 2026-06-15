import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

type Option = { label: string; value: string };

type Props = {
  options: readonly string[] | Option[];
  value: string | null;
  onChange: (value: string) => void;
  variant?: "chip" | "pill";
};

function normalizeOptions(options: readonly string[] | Option[]): Option[] {
  return options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
}

export default function OptionPicker({
  options,
  value,
  onChange,
  variant = "chip",
}: Props) {
  const normalized = normalizeOptions(options);
  const isPill = variant === "pill";

  return (
    <View style={styles.container}>
      {normalized.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            style={[
              isPill ? styles.pill : styles.chip,
              selected && (isPill ? styles.pillActive : styles.chipActive),
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                isPill ? styles.pillText : styles.chipText,
                selected &&
                  (isPill ? styles.pillTextActive : styles.chipTextActive),
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.white,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  pillTextActive: {
    color: Colors.white,
  },
});
