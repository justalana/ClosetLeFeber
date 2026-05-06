import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.smallText}>Welcome back</Text>
        <Text style={styles.title}>Your Closet</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Items" value="24" />
        <StatCard label="Worn this week" value="6" />
        <StatCard label="Forgotten" value="3" />
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>Need outfit inspiration?</Text>
        <Text style={styles.cardText}>
          Let’s help you pick something you haven’t worn in a while.
        </Text>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Suggest an outfit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    padding: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 24,
  },
  smallText: {
    fontSize: 14,
    color: "#7D7268",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2E2925",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2925",
  },
  statLabel: {
    fontSize: 12,
    color: "#7D7268",
    marginTop: 4,
  },
  mainCard: {
    backgroundColor: "#D8C7B8",
    padding: 22,
    borderRadius: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E2925",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: "#4F4740",
    marginBottom: 18,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#2E2925",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2E2925",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
