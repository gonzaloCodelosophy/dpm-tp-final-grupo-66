import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import type { Lugar } from "../types/Lugar";
import { colors, spacing, borderRadius, fontSize } from "../styles/theme";

interface TarjetaLugarProps {
  lugar: Lugar;
  nombreCategoria: string;
  onPress: () => void;
}

export function TarjetaLugar({
  lugar,
  nombreCategoria,
  onPress,
}: TarjetaLugarProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tarjeta,
        pressed && styles.tarjetaPresionada,
      ]}
      onPress={onPress}
    >
      <View style={styles.imagenContainer}>
        {lugar.imagenes.length > 0 ? (
          <Image
            source={{ uri: lugar.imagenes[0] }}
            style={styles.imagen}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagenVacia}>
            <Ionicons
              name="image-outline"
              size={40}
              color={colors.textSecondary}
            />
          </View>
        )}

        <Pressable
          style={styles.favorito}
          onPress={() => {
            // La funcionalidad de favoritos se integrará más adelante.
          }}
          hitSlop={8}
        >
          <Ionicons name="heart-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.contenido}>
        <View style={styles.encabezado}>
          <View style={styles.textos}>
            <Text style={styles.nombre} numberOfLines={2}>
              {lugar.nombre}
            </Text>

            <Text style={styles.categoria}>{nombreCategoria}</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.ubicacion}>
          <Ionicons
            name="location-outline"
            size={17}
            color={colors.secondary}
          />

          <Text style={styles.direccion} numberOfLines={1}>
            {lugar.direccion}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },

  tarjetaPresionada: {
    opacity: 0.85,
  },

  imagenContainer: {
    position: "relative",
  },

  imagen: {
    width: "100%",
    height: 190,
  },

  imagenVacia: {
    width: "100%",
    height: 190,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  favorito: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  contenido: {
    padding: spacing.md,
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  textos: {
    flex: 1,
  },

  nombre: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.text,
  },

  categoria: {
    marginTop: spacing.xs,
    fontSize: fontSize.caption,
    fontWeight: "600",
    color: colors.primary,
  },

  ubicacion: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  direccion: {
    flex: 1,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
});
