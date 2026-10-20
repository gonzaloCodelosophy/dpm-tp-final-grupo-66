import { BotonLugarFavorito } from "../../components/boton-lugar-favorito";
import { EstadoPantalla } from "../../components/estado-pantalla";
import { Audioguia } from "../../components/audioguia";
import { ImagenPersistente } from "../../components/imagen-persistente";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { useCatalogo } from "../../hooks/use-catalogo";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import { borderRadius, colors, fontSize, spacing } from "../../styles/theme";

export default function DetalleLugarScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { datos, sinConexion, cargando, error, reintentar } = useCatalogo();
  const lugar = datos?.lugares.find(item => item.id === id) ?? null;
  const categorias = datos?.categorias ?? [];

  if (cargando) return <EstadoPantalla tipo="cargando" titulo="Cargando lugar..." />;
  if (datos === null) return <EstadoPantalla tipo={sinConexion ? "sinConexion" : "error"} onPress={() => { void reintentar(); }} />;
  if (!lugar || !lugar.activo) return <EstadoPantalla tipo="vacio" titulo="Lugar no disponible" mensaje="Este lugar ya no está disponible en el catálogo." accion="Explorar lugares" onPress={() => router.replace('/(tabs)/explore')} />;

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

          <BotonLugarFavorito id={lugar.id} />
        </View>

        <EstadoCatalogo sinConexion={sinConexion} error={error !== null} />
        <ScrollView
          contentContainerStyle={styles.contenidoScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imagenContainer}>
            {lugar.imagenes.length > 0 ? (
              <ImagenPersistente
                url={lugar.imagenes[0]}
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

                <Text style={styles.imagenVaciaTexto}>Imagen no disponible</Text>
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

            {lugar.audioguia ? <Audioguia key={lugar.audioguia.url} url={lugar.audioguia.url} /> : <Text style={styles.infoTexto}>Este lugar no tiene audioguía disponible.</Text>}

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
                      ? lugar.horarios.map(horario => `${["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][horario.dia]}: ${horario.abre} a ${horario.cierra}`).join("\n")
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

              {(
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

                    <Text style={styles.infoTexto}>{lugar.telefono || "Teléfono no disponible"}</Text>
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






});
