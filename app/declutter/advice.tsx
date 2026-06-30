import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const adviceCards = [
  {
    title: "Nog netjes? Doneer het",
    icon: "heart-outline",
    text: "Is het kledingstuk nog schoon en heel? Dan kun je het doneren aan een goed doel, kledingbank of kringloopwinkel.",
  },
  {
    title: "Waardevol item? Verkoop het",
    icon: "pricetag-outline",
    text: "Merkkleding, bijzondere items of kleding die je weinig hebt gedragen kun je verkopen via bijvoorbeeld Vinted, Marktplaats of een lokale verkoopgroep.",
  },
  {
    title: "Versleten? Recycle het",
    icon: "refresh-outline",
    text: "Kleding met gaten, vlekken of veel slijtage hoeft niet bij het gewone afval. Lever het in bij een textielcontainer of recyclepunt.",
  },
  {
    title: "Nog twijfel? Zet het apart",
    icon: "cube-outline",
    text: "Weet je het nog niet zeker? Stop het kledingstuk tijdelijk in een tas of doos. Mis je het na een tijdje niet, dan mag het weg.",
  },
  {
    title: "Maak het makkelijk",
    icon: "sparkles-outline",
    text: "Kies één simpele volgende stap: doneren, verkopen, recyclen of apart leggen. Zo blijft declutteren overzichtelijk en minder overweldigend.",
  },
];

export default function DeclutterAdviceScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.smallTitle}>Declutter advies</Text>
      <Text style={styles.title}>Wat kun je doen met kleding die weg mag?</Text>

      <Text style={styles.description}>
        Je hoeft niet meteen alles definitief weg te gooien. Kies per
        kledingstuk een volgende stap die past bij de staat van het item.
      </Text>

      <View style={styles.cardList}>
        {adviceCards.map((card) => (
          <View key={card.title} style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={card.icon as any}
                size={24}
                color={Colors.primary}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Tip</Text>
        <Text style={styles.tipText}>
          Begin met maximaal 5 items tegelijk. Dat houdt de keuze klein en maakt
          de declutter-taak beter haalbaar.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "800",
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 22,
  },
  cardList: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.cardSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipBox: {
    marginTop: 22,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
  },
  tipTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },
  tipText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 21,
  },
});
