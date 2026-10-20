import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";

import { ImagenPersistente } from "../imagen-persistente";
import { BotonLugarFavorito } from "../boton-lugar-favorito";
import type { Lugar } from "../../types/Lugar";
import type { Evento } from "../../types/evento";
import { colorsInicio as colors } from "../../styles/inicio";
import { borderRadius, fontSize, spacing } from "../../styles/theme";

interface LugarInicioProps {
  lugar: Lugar;
  categoria: string;
  distancia: string | null;
}

export function TarjetaLugarInicio({
  lugar,
  categoria,
  distancia,
}: LugarInicioProps) {
  return (
    <View style={styles.tarjeta}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${lugar.nombre}`}
        onPress={() =>
          router.push({ pathname: "/lugar/[id]", params: { id: lugar.id } })
        }
      >
        {lugar.imagenes.length > 0 ? (
          <ImagenPersistente
            url={lugar.imagenes[0]}
            style={styles.imagenLugar}
          />
        ) : (
          <View style={[styles.imagenLugar, styles.sinImagen]}>
            <Ionicons
              name="image-outline"
              size={32}
              color={colors.textSecondary}
            />
            <Text style={styles.secundario}>Imagen no disponible</Text>
          </View>
        )}
        <View style={styles.infoLugar}>
          <View style={styles.textos}>
            <Text style={styles.nombre} numberOfLines={2}>
              {lugar.nombre}
            </Text>
            <View style={styles.fila}>
              <Ionicons
                name="location-outline"
                size={17}
                color={colors.textSecondary}
              />
              <Text style={styles.secundario} numberOfLines={2}>
                {distancia ?? lugar.direccion}
              </Text>
            </View>
          </View>
          <View style={styles.categoria}>
            <Text style={styles.categoriaTexto} numberOfLines={2}>
              {categoria}
            </Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.corazon}>
        <BotonLugarFavorito id={lugar.id} />
      </View>
    </View>
  );
}

export function TarjetaEventoInicio({
  evento,
  direccion,
}: {
  evento: Evento;
  direccion: string;
}) {
  const fecha = new Date(evento.inicio);
  const mes = fecha
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${evento.titulo}`}
      style={[styles.tarjeta, styles.evento]}
      onPress={() =>
        router.push({ pathname: "/evento/[id]", params: { id: evento.id } })
      }
    >
      <View>
        {evento.imagenUrl ? (
          <ImagenPersistente
            url={evento.imagenUrl}
            style={styles.imagenEvento}
          />
        ) : (
          <View style={[styles.imagenEvento, styles.sinImagen]}>
            <Ionicons
              name="image-outline"
              size={32}
              color={colors.textSecondary}
            />
          </View>
        )}
        <View style={styles.fecha}>
          <Text style={styles.dia}>{fecha.getDate()}</Text>
          <Text style={styles.mes}>{mes}</Text>
        </View>
      </View>
      <View style={styles.infoEvento}>
        <Text style={styles.nombre} numberOfLines={2}>
          {evento.titulo}
        </Text>
        <View style={styles.fila}>
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.secundario} numberOfLines={2}>
            {direccion}
          </Text>
        </View>
        <View
          style={[
            styles.estado,
            evento.estado === "suspendido" && styles.suspendido,
            evento.estado === "cancelado" && styles.cancelado,
          ]}
        >
          <Text
            style={[
              styles.estadoTexto,
              evento.estado === "suspendido" && styles.suspendidoTexto,
              evento.estado === "cancelado" && styles.canceladoTexto,
            ]}
          >
            {evento.estado.toUpperCase()}
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
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imagenLugar: { width: "100%", height: 120 },
  sinImagen: {
    backgroundColor: colors.blueLight,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  corazon: { position: "absolute", top: spacing.sm, right: spacing.sm },
  infoLugar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
  },
  textos: { flex: 1, minWidth: 0 },
  nombre: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  fila: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  secundario: {
    flexShrink: 1,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  categoria: {
    maxWidth: "35%",
    backgroundColor: colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  categoriaTexto: { color: colors.green, fontSize: 12 },
  evento: { flex: 1, minWidth: 0 },
  imagenEvento: { height: 140, width: "100%" },
  fecha: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  dia: { fontSize: 22, color: colors.surface, fontWeight: "500" },
  mes: { fontSize: fontSize.caption, color: colors.surface },
  infoEvento: { padding: 12, gap: spacing.xs },
  estado: {
    alignSelf: "flex-start",
    backgroundColor: colors.blueLight,
    paddingHorizontal: 10,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginTop: spacing.xs,
    maxWidth: "100%",
  },
  estadoTexto: { color: colors.secondary, fontSize: 10 },
  suspendido: { backgroundColor: colors.yellowLight },
  suspendidoTexto: { color: "#91600B" },
  cancelado: { backgroundColor: colors.primaryLight },
  canceladoTexto: { color: colors.error },
});
