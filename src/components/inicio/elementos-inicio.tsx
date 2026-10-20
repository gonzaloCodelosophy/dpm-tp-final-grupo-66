import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colorsInicio as colors, fuenteTitulo } from "../../styles/inicio";
import { borderRadius, fontSize, spacing } from "../../styles/theme";

type Icono = ComponentProps<typeof Ionicons>["name"];

export function TituloInicio({
  titulo,
  enlace,
  onPress,
  subrayado = false,
}: {
  titulo: string;
  enlace?: string;
  onPress?: () => void;
  subrayado?: boolean;
}) {
  return (
    <View style={styles.encabezado}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subrayado && <View style={styles.subrayado} />}
      </View>
      {enlace && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={styles.enlace}
        >
          <Text style={styles.enlaceTexto}>{enlace}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function BotonInicio({
  texto,
  onPress,
  secundario = false,
  disabled = false,
}: {
  texto: string;
  onPress: () => void;
  secundario?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        secundario && styles.botonSecundario,
        (pressed || disabled) && styles.presionado,
      ]}
    >
      <Text style={styles.botonTexto}>{texto}</Text>
    </Pressable>
  );
}

export function AccesoInicio({
  titulo,
  icono,
  fondo,
  color,
  onPress,
  compacto = false,
}: {
  titulo: string;
  icono: Icono;
  fondo: string;
  color: string;
  onPress: () => void;
  compacto?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.acceso,
        { backgroundColor: fondo },
        compacto && styles.compacto,
        pressed && styles.presionado,
      ]}
    >
      <Ionicons name={icono} size={compacto ? 24 : 28} color={color} />
      <Text style={styles.accesoTexto}>{titulo}</Text>
    </Pressable>
  );
}

export function EstadoInicio({
  titulo,
  mensaje,
  cargando = false,
  onPress,
}: {
  titulo: string;
  mensaje?: string;
  cargando?: boolean;
  onPress?: () => void;
}) {
  return (
    <View style={styles.estado} accessibilityLiveRegion="polite">
      {cargando && <ActivityIndicator color={colors.primary} />}
      <Text style={styles.estadoTitulo}>{titulo}</Text>
      {mensaje && <Text style={styles.estadoTexto}>{mensaje}</Text>}
      {onPress && <BotonInicio texto="Reintentar" onPress={onPress} />}
    </View>
  );
}

export function IlustracionRecorrido() {
  return (
    <View
      style={styles.mapa}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Ionicons name="map-outline" size={72} color={colors.green} />
      <Ionicons
        name="location"
        size={21}
        color={colors.primary}
        style={styles.pinUno}
      />
      <Ionicons
        name="location"
        size={21}
        color={colors.primary}
        style={styles.pinDos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: 12,
  },
  textos: { flex: 1 },
  titulo: {
    fontFamily: fuenteTitulo,
    fontSize: 21,
    fontWeight: "700",
    color: colors.secondary,
    letterSpacing: -0.8,
  },
  subrayado: {
    width: 23,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  enlace: { minHeight: 44, justifyContent: "center" },
  enlaceTexto: { fontSize: 14, color: colors.primary },
  boton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  botonSecundario: { backgroundColor: colors.secondary },
  botonTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
    textAlign: "center",
  },
  presionado: { opacity: 0.7 },
  acceso: {
    flex: 1,
    minWidth: 0,
    minHeight: 78,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 10,
  },
  compacto: {
    flexDirection: "row",
    minHeight: 60,
    gap: 12,
    paddingHorizontal: 12,
  },
  accesoTexto: {
    flexShrink: 1,
    fontSize: fontSize.caption,
    fontWeight: "500",
    color: colors.secondary,
    textAlign: "center",
  },
  estado: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: 12,
  },
  estadoTitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  estadoTexto: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mapa: {
    width: 80,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  pinUno: { position: "absolute", top: 18, right: 14 },
  pinDos: { position: "absolute", bottom: 15, left: 15 },
});
