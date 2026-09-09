import { Image, StyleSheet, Text, View } from "react-native";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../src/styles/theme";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  time: string;
  category: string;
  imageUrl: string;
};

export function EventCard({
  title,
  date,
  location,
  time,
  category,
  imageUrl,
}: EventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.information}>📍 {location}</Text>
        <Text style={styles.information}>◷ {time}</Text>

        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{category}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 180,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  imageContainer: {
    width: "38%",
    position: "relative",
    alignSelf: "stretch",
  },

  image: {
    ...StyleSheet.absoluteFillObject,
  },

  dateContainer: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    minWidth: 58,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },

  date: {
    color: colors.surface,
    fontSize: fontSize.caption,
    fontWeight: "700",
    textAlign: "center",
  },

  content: {
    flex: 1,
    padding: spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },

  information: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    marginBottom: spacing.xs,
  },

  categoryContainer: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
  },

  category: {
    color: colors.primary,
    fontSize: fontSize.caption,
    fontWeight: "600",
  },
});
