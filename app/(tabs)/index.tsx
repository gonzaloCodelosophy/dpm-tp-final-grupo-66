import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventCard } from "../../components/EventCard";
import {
  colors,
  fontSize,
  spacing,
} from "../../src/styles/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>Mi Ciudad Colón</Text>
        <Text style={styles.title}>Eventos</Text>
        <Text style={styles.subtitle} />

      </View>

      <EventCard
        title="Feria de emprendedores"
        date={"05\nSEP"}
        location="Parque Quirós"
        time="16:00 h"
        category="Cultura"
        imageUrl="https://images.unsplash.com/photo-1488459716781-31db52582fe9"
      />

      <EventCard
        title="Música en la costanera"
        date={"12\nSEP"}
        location="Costanera Norte"
        time="20:30 h"
        category="Música"
        imageUrl="https://images.unsplash.com/photo-1501386761578-eac5c94b800a"
      />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  scroll: {
    flex: 1,
  },

  header: {
    marginBottom: spacing.lg,
  },

  brand: {
    color: colors.secondary,
    fontSize: fontSize.body,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.secondary,
    fontSize: fontSize.title,
    fontWeight: "700",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    marginTop: spacing.xs,
  },
})
