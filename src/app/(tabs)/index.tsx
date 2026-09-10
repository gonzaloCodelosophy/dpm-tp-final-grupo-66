import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  fontSize,
  spacing,
} from "../../styles/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Mi Ciudad Colón</Text>
        </View>
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
  }
})
