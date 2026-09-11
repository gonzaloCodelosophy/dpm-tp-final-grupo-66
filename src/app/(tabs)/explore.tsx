import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";

import { TarjetaLugar } from "../../components/tarjeta-lugar";
import { categorias } from "../../mocks/categorias";
import { obtenerLugares } from "../../services/lugares.service";
import type { Categoria } from "../../types/Categoria";
import type { Lugar } from "../../types/Lugar";
import { borderRadius, colors, fontSize, spacing } from "../../styles/theme";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarLugares() {
      const datos = await obtenerLugares();

      setLugares(datos);
      setCargando(false);
    }

    cargarLugares();
  }, []);

  const lugaresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return lugares.filter((lugar) => {
      const coincideCategoria =
        categoriaSeleccionada === null ||
        lugar.categoriaId === categoriaSeleccionada;

      const coincideBusqueda =
        texto.length === 0 || lugar.nombre.toLowerCase().includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [lugares, categoriaSeleccionada, busqueda]);

  const obtenerNombreCategoria = (categoriaId: string) => {
    const categoria = categorias.find(
      (item: Categoria) => item.id === categoriaId,
    );

    return categoria?.nombre ?? "Sin categoría";
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.textoCargando}>Cargando lugares...</Text>
      </View>
    );
  }

  return (
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
          style={styles.headerBoton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.headerLogo}>Colón</Text>

        {/*Usuario Provicional*/}
        <View style={styles.headerAvatar}>
          <Ionicons name="person" size={20} color={colors.textSecondary} />
        </View>
      </View>

      <FlatList
        data={lugaresFiltrados}
        keyExtractor={(lugar) => lugar.id}
        renderItem={({ item }) => (
          <TarjetaLugar
            lugar={item}
            nombreCategoria={obtenerNombreCategoria(item.categoriaId)}
            onPress={() =>
              router.push({
                pathname: "/lugar/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>Lugares</Text>

            <Text style={styles.subtitulo}>
              Descubrí todo lo que Colón tiene para vos
            </Text>

            <View style={styles.buscador}>
              <Ionicons
                name="search-outline"
                size={21}
                color={colors.textSecondary}
              />

              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar lugares..."
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                returnKeyType="search"
              />

              {busqueda.length > 0 && (
                <Pressable onPress={() => setBusqueda("")} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={21}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            <FlatList
              horizontal
              data={categorias}
              keyExtractor={(categoria) => categoria.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorias}
              renderItem={({ item }) => {
                const seleccionada = categoriaSeleccionada === item.id;

                return (
                  <Pressable
                    onPress={() =>
                      setCategoriaSeleccionada(seleccionada ? null : item.id)
                    }
                    style={[
                      styles.filtro,
                      seleccionada && styles.filtroSeleccionado,
                    ]}
                  >
                    <Ionicons
                      name={
                        item.icono as React.ComponentProps<
                          typeof Ionicons
                        >["name"]
                      }
                      size={18}
                      color={seleccionada ? colors.surface : colors.secondary}
                    />

                    <Text
                      style={[
                        styles.filtroTexto,
                        seleccionada && styles.filtroTextoSeleccionado,
                      ]}
                    >
                      {item.nombre}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.encabezadoResultados}>
              <Text style={styles.tituloResultados}>
                Lugares para descubrir
              </Text>

              <Text style={styles.contador}>{lugaresFiltrados.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons
              name="search-outline"
              size={42}
              color={colors.textSecondary}
            />

            <Text style={styles.vacioTitulo}>No encontramos lugares</Text>

            <Text style={styles.vacioTexto}>
              Probá con otra búsqueda o categoría.
            </Text>
          </View>
        }
      />
    </View>
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

  headerBoton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerLogo: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.secondary,
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  lista: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  titulo: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.text,
  },

  subtitulo: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },

  buscador: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },

  categorias: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  filtro: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.secondaryLight,
  },

  filtroSeleccionado: {
    backgroundColor: colors.secondary,
  },

  filtroTexto: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    color: colors.secondary,
  },

  filtroTextoSeleccionado: {
    color: colors.surface,
  },

  encabezadoResultados: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  tituloResultados: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.text,
  },

  contador: {
    minWidth: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontSize: fontSize.caption,
    fontWeight: "700",
    textAlign: "center",
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

  vacio: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },

  vacioTitulo: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.text,
  },

  vacioTexto: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
