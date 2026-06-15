import { StyleSheet, Text, View } from "react-native";
import { MonthlyWear } from "@/types/clothing";

type Props = {
  data: MonthlyWear[];
};

export default function WearChart({ data }: Props) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Gedragen dit jaar</Text>
        <Text style={styles.subtitle}>Aantal logs per maand</Text>
      </View>

      <View style={styles.chart}>
        {data.map((item) => (
          <View key={item.month} style={styles.item}>
            <Text style={styles.count}>{item.count}</Text>

            <View style={styles.barBackground}>
              <View
                style={[
                  styles.bar,
                  { height: `${(item.count / maxCount) * 100}%` },
                ]}
              />
            </View>

            <Text style={styles.label}>{item.month}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f3f0ea",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2f2f2f",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  chart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  count: {
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
  },
  barBackground: {
    height: 110,
    width: 12,
    borderRadius: 999,
    backgroundColor: "#ddd6cc",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    minHeight: 2,
    borderRadius: 999,
    backgroundColor: "#2f2f2f",
  },
  label: {
    fontSize: 10,
    color: "#777",
    marginTop: 8,
  },
});
