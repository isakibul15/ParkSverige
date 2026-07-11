import { View, Text, StyleSheet } from "react-native";
import { brandPalette } from "@parksverige/design-system";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Version 0 Foundation</Text>
      <Text style={styles.title}>A calm, map-first parking experience for Sweden.</Text>
      <Text style={styles.body}>
        Mobile will share contracts, analytics, and domain logic with web while keeping a
        native navigation and map experience.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F4F5F1"
  },
  eyebrow: {
    marginBottom: 12,
    color: brandPalette.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    marginBottom: 16,
    color: brandPalette.ink,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40
  },
  body: {
    color: "#42535A",
    fontSize: 17,
    lineHeight: 28
  }
});

