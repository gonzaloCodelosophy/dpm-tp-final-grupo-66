import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { categorias } from "../../mocks/categorias";
import { obtenerLugarPorId } from "../../services/lugares.service";
import type { Lugar } from "../../types/Lugar";
import { borderRadius, colors, fontSize, spacing } from "../../styles/theme";

export default function DetalleLugarScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarLugar() {
      if (!id) {
        setCargando(false);
        return;
      }

      const datos = await obtenerLugarPorId(id);

      setLugar(datos);
      setCargando(false);
    }

    cargarLugar();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.textoCargando}>Cargando lugar...</Text>
      </View>
    );
  }

  if (!lugar) {
    return (
      <View style={styles.error}>
        <Ionicons
          name="location-outline"
          size={48}
          color={colors.textSecondary}
        />

        <Text style={styles.errorTitulo}>Lugar no encontrado</Text>

        <Pressable style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const categoria = categorias.find((item) => item.id === lugar.categoriaId);

  return (
    <>
      <Stack.Screen
        options={{
          title: lugar.nombre,
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + spacing.sm,
            },
          ]}
        >
          <Pressable
            style={styles.botonHeader}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.tituloHeader} numberOfLines={1}>
            {lugar.nombre}
          </Text>

          {/*Usuario Provicional*/}
          <View style={styles.headerAvatar}>
            <Ionicons name="person" size={20} color={colors.textSecondary} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.contenidoScroll}
          showsVerticalScrollIndicator={false}
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
                  size={52}
                  color={colors.textSecondary}
                />

                <Text style={styles.imagenVaciaTexto}>Imagen próximamente</Text>
              </View>
            )}
          </View>

          <View style={styles.contenido}>
            {categoria && (
              <View style={styles.categoria}>
                <Text style={styles.categoriaTexto}>{categoria.nombre}</Text>
              </View>
            )}

            <Text style={styles.nombre}>{lugar.nombre}</Text>

            <View style={styles.ubicacion}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.secondary}
              />

              <Text style={styles.ubicacionTexto}>{lugar.direccion}</Text>
            </View>

            <View style={styles.separador} />

            <Text style={styles.seccionTitulo}>Sobre el lugar</Text>

            <Text style={styles.descripcion}>{lugar.descripcion}</Text>

            <View style={styles.info}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcono}>
                  <Ionicons
                    name="time-outline"
                    size={21}
                    color={colors.secondary}
                  />
                </View>

                <View style={styles.infoTextoContainer}>
                  <Text style={styles.infoTitulo}>Horarios</Text>

                  <Text style={styles.infoTexto}>
                    {lugar.horarios.length > 0
                      ? "Consultar horarios"
                      : "Horarios no disponibles"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcono}>
                  <Ionicons
                    name="accessibility-outline"
                    size={21}
                    color={colors.secondary}
                  />
                </View>

                <View style={styles.infoTextoContainer}>
                  <Text style={styles.infoTitulo}>Accesibilidad</Text>

                  <Text style={styles.infoTexto}>
                    {lugar.accesible ? "Accesible" : "No especificada"}
                  </Text>
                </View>
              </View>

              {lugar.telefono && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcono}>
                    <Ionicons
                      name="call-outline"
                      size={21}
                      color={colors.secondary}
                    />
                  </View>

                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoTitulo}>Teléfono</Text>

                    <Text style={styles.infoTexto}>{lugar.telefono}</Text>
                  </View>
                </View>
              )}

              {lugar.precioEntrada !== null && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcono}>
                    <Ionicons
                      name="ticket-outline"
                      size={21}
                      color={colors.secondary}
                    />
                  </View>

                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoTitulo}>Entrada</Text>

                    <Text style={styles.infoTexto}>
                      {lugar.precioEntrada === 0
                        ? "Gratis"
                        : `$${lugar.precioEntrada}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },

  tituloHeader: {
    flex: 1,
    marginHorizontal: spacing.sm,
    textAlign: "center",
    fontSize: fontSize.body,
    fontWeight: "700",
    color: colors.text,
  },

  botonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  contenidoScroll: {
    paddingBottom: spacing.xl,
  },

  imagenContainer: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },

  imagen: {
    width: "100%",
    height: 230,
  },

  imagenVacia: {
    width: "100%",
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondaryLight,
    gap: spacing.sm,
  },

  imagenVaciaTexto: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },

  contenido: {
    padding: spacing.md,
  },

  categoria: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.greenLight,
  },

  categoriaTexto: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    color: colors.green,
  },

  nombre: {
    marginTop: spacing.sm,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: colors.text,
  },

  ubicacion: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  ubicacionTexto: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },

  separador: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  seccionTitulo: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: spacing.sm,
  },

  descripcion: {
    fontSize: fontSize.body,
    lineHeight: 24,
    color: colors.text,
  },

  info: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoIcono: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  infoTextoContainer: {
    flex: 1,
  },

  infoTitulo: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    color: colors.text,
  },

  infoTexto: {
    marginTop: 2,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },

  textoCargando: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },

  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },

  errorTitulo: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.text,
  },

  botonVolver: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
  },

  botonVolverTexto: {
    color: colors.surface,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
});
