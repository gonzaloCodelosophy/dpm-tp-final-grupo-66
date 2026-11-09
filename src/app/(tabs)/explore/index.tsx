import { useUbicacion } from "../../../hooks/use-ubicacion";
import { distanciaMetros } from "../../../services/distancias";
import { tipografia } from "../../../styles/tipografia";
import { BotonCategoria } from "../../../components/boton-categoria";
import { categoriasIntereses } from "../../../../constants/categorias-intereses";
import { fuenteTitulo } from "../../../styles/inicio";
import { Image } from "expo-image";
import { useTema } from "../../../context/tema.context";
import { EstadoPantalla } from "../../../components/estado-pantalla";
import { useMemo, useState } from "react";
import {
        Alert,
        Modal,
        FlatList,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        TextInput,
        View,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { MapaLugares } from "../../../components/mapa-lugares";
import { TarjetaLugar } from "../../../components/tarjeta-lugar";
import { useCatalogo } from "../../../hooks/use-catalogo";
import { EstadoCatalogo } from "../../../components/estado-catalogo";
import type { Categoria } from "../../../types/Categoria";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../../../styles/theme";

export default function ExploreScreen() {
        const { colors, styles } = useEstilos();

        const insets = useSafeAreaInsets();
        const { vista } = useLocalSearchParams<{ vista?: string }>();
        const mostrarMapa = vista === "mapa";
        const {
                datos,
                sinConexion,
                cargando,
                error,
                reintentar,
                hayMasLugares,
                hayMasCategorias,
                cargarMasLugares,
                cargarMasCategorias,
                actualizando,
        } = useCatalogo();
        const lugares = datos?.lugares;
        const categorias = datos?.categorias ?? [];
        const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
                string | null
        >(null);
        const [busqueda, setBusqueda] = useState("");
        const ubicacion = useUbicacion();
        const [ordenCercania, setOrdenCercania] = useState(false);
        const [radioDistancia, setRadioDistancia] = useState<number | null>(null);
        const [selectorFiltro, setSelectorFiltro] = useState<"orden" | "distancia" | null>(null);
        const [aplicandoFiltro, setAplicandoFiltro] = useState(false);

        async function elegirFiltro(valor: number | null) {
                if (aplicandoFiltro) return;
                const selector = selectorFiltro;
                setAplicandoFiltro(true);
                try {
                        if (valor !== null && !ubicacion.coordenadas) {
                                const posicion = await ubicacion.solicitar();
                                if (!posicion) {
                                        Alert.alert("Ubicación necesaria", "Permití la ubicación y activá el GPS para ordenar o filtrar por distancia.");
                                        return;
                                }
                        }
                        if (selector === "orden") setOrdenCercania(valor !== null);
                        else if (selector === "distancia") setRadioDistancia(valor);
                        setSelectorFiltro(null);
                } catch {
                        Alert.alert("Ubicación no disponible", "No pudimos obtener tu ubicación. Intentá de nuevo.");
                } finally { setAplicandoFiltro(false); }
        }
        const lugaresFiltrados = useMemo(() => {
                const normalizar = (valor: string) =>
                        valor
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .toLowerCase();
                const texto = normalizar(busqueda.trim());

                const filtrados = (lugares ?? []).filter((lugar) => {
                        const coincideCategoria =
                                categoriaSeleccionada === null ||
                                lugar.categoriaId === categoriaSeleccionada;

                        const coincideBusqueda =
                                mostrarMapa || texto.length === 0 ||
                                normalizar(lugar.nombre).includes(texto);

                        return (
                                lugar.activo &&
                                coincideCategoria &&
                                coincideBusqueda &&
                                (mostrarMapa || radioDistancia === null || !ubicacion.coordenadas || distanciaMetros(ubicacion.coordenadas, lugar.coordenadas) <= radioDistancia)
                        );
                });
                if (!mostrarMapa && ordenCercania && ubicacion.coordenadas) {
                        const posicion = ubicacion.coordenadas;
                        filtrados.sort((a, b) => distanciaMetros(posicion, a.coordenadas) - distanciaMetros(posicion, b.coordenadas) || a.nombre.localeCompare(b.nombre));
                }
                return filtrados;
        }, [lugares, categoriaSeleccionada, busqueda, radioDistancia, ordenCercania, ubicacion.coordenadas, mostrarMapa]);

        const obtenerNombreCategoria = (categoriaId: string) => {
                const categoria = categorias.find(
                        (item: Categoria) => item.id === categoriaId,
                );

                return categoria?.nombre ?? "Sin categoría";
        };

        if (cargando)
                return (
                        <EstadoPantalla
                                tipo="cargando"
                                titulo="Cargando lugares..."
                        />
                );
        if (datos === null)
                return (
                        <EstadoPantalla
                                tipo={sinConexion ? "sinConexion" : "error"}
                                onPress={() => {
                                        void reintentar();
                                }}
                        />
                );

        return (
                <View style={styles.container}>
                        <View style={{ paddingTop: insets.top }}>
                                <View style={styles.header}>
                                        <Image source={require("../../../../assets/images/logo-colon.png")} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
                                        <Image source={require("../../../../assets/images/ilustracion-colon-puente.png")} style={styles.puente} contentFit="contain" />
                                        <Text style={styles.tituloCabecera}>Explorar</Text>
                                        <Text style={styles.descripcionCabecera}>Descubrí todo lo que Colón tiene para vos</Text>
                                </View>
                        </View>
                        <EstadoCatalogo
                                sinConexion={sinConexion}
                                error={error !== null}
                        />

                        <View style={styles.selectorVista}>
                                {(["lista", "mapa"] as const).map((opcion) => {
                                        const isSelected =
                                                mostrarMapa ===
                                                (opcion === "mapa");

                                        return (
                                                <Pressable
                                                        key={opcion}
                                                        accessibilityRole="button"
                                                        accessibilityState={{
                                                                selected: isSelected,
                                                        }}
                                                        onPress={() =>
                                                                router.setParams(
                                                                        {
                                                                                vista: opcion,
                                                                        },
                                                                )
                                                        }
                                                        style={[
                                                                styles.opcionVista,
                                                                isSelected &&
                                                                        styles.opcionVistaActiva,
                                                        ]}
                                                >
                                                        <Ionicons
                                                                name={
                                                                        opcion ===
                                                                        "mapa"
                                                                                ? "map-outline"
                                                                                : "list-outline"
                                                                }
                                                                size={20}
                                                                color={
                                                                        isSelected
                                                                                ? colors.onPrimary
                                                                                : colors.secondary
                                                                }
                                                        />
                                                        <Text
                                                                style={[
                                                                        styles.filtroTexto,
                                                                        isSelected &&
                                                                                styles.filtroTextoSeleccionado,
                                                                ]}
                                                        >
                                                                {opcion ===
                                                                "mapa"
                                                                        ? "Mapa"
                                                                        : "Lugares"}
                                                        </Text>
                                                </Pressable>
                                        );
                                })}
                        </View>

                        {mostrarMapa ? (
                                <View style={styles.contenedorMapa}>
                                        <View style={styles.controlesMapa}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosMapa}>
                                                        <BotonCategoria nombre="Todas" icono="view-grid-outline" color={colors.secondary} fondo={colors.secondaryLight} seleccionado={categoriaSeleccionada === null} onPress={() => setCategoriaSeleccionada(null)} />
                                                        {categorias.map(item => {
                                                                const estilo = categoriasIntereses.find(categoria => categoria.id === item.id);
                                                                return <BotonCategoria key={item.id} nombre={item.nombre} icono={estilo?.icono ?? "shape-outline"} color={estilo?.color ?? colors.secondary} fondo={estilo?.fondo ?? colors.secondaryLight} colorOscuro={estilo?.colorOscuro} fondoOscuro={estilo?.fondoOscuro} seleccionado={categoriaSeleccionada === item.id} onPress={() => setCategoriaSeleccionada(actual => actual === item.id ? null : item.id)} />;
                                                        })}
                                                        {hayMasCategorias && <Pressable accessibilityRole="button" disabled={actualizando || sinConexion} onPress={() => void cargarMasCategorias()} style={styles.filtro}><Text style={styles.filtroTexto}>Más categorías</Text></Pressable>}
                                                </ScrollView>
                                        </View>
                                        <MapaLugares
                                                lugares={lugaresFiltrados}
                                                categorias={categorias}
                                        />
                                        {hayMasLugares && (
                                                <Pressable
                                                        accessibilityRole="button"
                                                        disabled={
                                                                actualizando ||
                                                                sinConexion
                                                        }
                                                        onPress={() => {
                                                                void cargarMasLugares();
                                                        }}
                                                        style={
                                                                styles.cargarMapa
                                                        }
                                                >
                                                        <Text
                                                                style={
                                                                        styles.filtroTexto
                                                                }
                                                        >
                                                                {actualizando
                                                                        ? "Cargando…"
                                                                        : "Cargar más lugares"}
                                                        </Text>
                                                </Pressable>
                                        )}
                                </View>
                        ) : (
                                <View style={styles.vistaLista}>
                                                <View style={styles.controlesLista}>
                                                        <View
                                                                style={
                                                                        styles.buscador
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="search-outline"
                                                                        size={
                                                                                21
                                                                        }
                                                                        color={
                                                                                colors.textSecondary
                                                                        }
                                                                />

                                                                <TextInput
                                                                        value={
                                                                                busqueda
                                                                        }
                                                                        onChangeText={
                                                                                setBusqueda
                                                                        }
                                                                        accessibilityLabel="Buscar lugares"
                                                                        placeholder="Buscar lugares en Colón"
                                                                        placeholderTextColor={
                                                                                colors.textSecondary
                                                                        }
                                                                        style={
                                                                                styles.input
                                                                        }
                                                                        returnKeyType="search"
                                                                />

                                                                {busqueda.length >
                                                                        0 && (
                                                                        <Pressable
                                                                                accessibilityLabel="Borrar búsqueda"
                                                                                accessibilityRole="button"
                                                                                onPress={() =>
                                                                                        setBusqueda(
                                                                                                "",
                                                                                        )
                                                                                }
                                                                                hitSlop={
                                                                                        8
                                                                                }
                                                                        >
                                                                                <Ionicons
                                                                                        name="close-circle"
                                                                                        size={
                                                                                                21
                                                                                        }
                                                                                        color={
                                                                                                colors.textSecondary
                                                                                        }
                                                                                />
                                                                        </Pressable>
                                                                )}
                                                        </View>

                                                </View>
                                <FlatList
                                        style={styles.listaDesplazable}
                                        keyboardShouldPersistTaps="handled"
                                        keyboardDismissMode="on-drag"
                                        ListHeaderComponent={<>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
                                                                <BotonCategoria nombre="Todas" icono="view-grid-outline" color={colors.secondary} fondo={colors.secondaryLight} seleccionado={categoriaSeleccionada === null} onPress={() => setCategoriaSeleccionada(null)} />
                                                                {categorias.map(item => {
                                                                        const estilo = categoriasIntereses.find(categoria => categoria.id === item.id);
                                                                        return <BotonCategoria key={item.id} nombre={item.nombre} icono={estilo?.icono ?? "shape-outline"} color={estilo?.color ?? colors.secondary} fondo={estilo?.fondo ?? colors.secondaryLight} colorOscuro={estilo?.colorOscuro} fondoOscuro={estilo?.fondoOscuro} seleccionado={categoriaSeleccionada === item.id} onPress={() => setCategoriaSeleccionada(actual => actual === item.id ? null : item.id)} />;
                                                                })}
                                                                {hayMasCategorias && <Pressable accessibilityRole="button" disabled={actualizando || sinConexion} onPress={() => void cargarMasCategorias()} style={styles.filtro}><Text style={styles.filtroTexto}>Más categorías</Text></Pressable>}
                                                        </ScrollView>

                                                        <View style={styles.controlesDistancia}>
                                                                <Pressable accessibilityRole="button" accessibilityLabel="Ordenar lugares" onPress={() => setSelectorFiltro("orden")} style={styles.controlDistancia}>
                                                                        <Ionicons name="location-outline" size={17} color={colors.secondary} />
                                                                        <Text style={styles.controlDistanciaTexto}>{ordenCercania ? 'Ordenar: Más cerca' : 'Ordenar'}</Text>
                                                                        <Ionicons name="chevron-down" size={16} color={colors.secondary} />
                                                                </Pressable>
                                                                <Pressable accessibilityRole="button" accessibilityLabel="Filtrar por distancia" onPress={() => setSelectorFiltro("distancia")} style={styles.controlDistancia}>
                                                                        <Ionicons name="options-outline" size={17} color={colors.secondary} />
                                                                        <Text style={styles.controlDistanciaTexto}>{radioDistancia === null ? 'Distancia' : `Hasta ${radioDistancia} m`}</Text>
                                                                        <Ionicons name="chevron-down" size={16} color={colors.secondary} />
                                                                </Pressable>
                                                        </View>
                                                        {(ordenCercania || radioDistancia !== null) && !ubicacion.coordenadas && <Text style={styles.avisoDistancia}>Se necesita ubicación para aplicar estos filtros.</Text>}
                                                        <View
                                                                style={
                                                                        styles.encabezadoResultados
                                                                }
                                                        >
                                                                <Text style={styles.tituloResultados}>{lugaresFiltrados.length} {lugaresFiltrados.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}</Text>
                                                        </View>
                                        </>}
                                        data={lugaresFiltrados}
                                        keyExtractor={(lugar) => lugar.id}
                                        renderItem={({ item }) => (
                                                <TarjetaLugar
                                                        lugar={item}
                                                        nombreCategoria={obtenerNombreCategoria(
                                                                item.categoriaId,
                                                        )}
                                                        onPress={() =>
                                                                router.push({
                                                                        pathname: "/(tabs)/explore/lugar/[id]" as any,
                                                                        params: {
                                                                                id: item.id,
                                                                        },
                                                                })
                                                        }
                                                />
                                        )}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.lista}
                                        //@Itati revisa si queda bien el diseño de "Cargar más lugares"
                                        ListFooterComponent={
                                                hayMasLugares ? (
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                disabled={
                                                                        actualizando ||
                                                                        sinConexion
                                                                }
                                                                onPress={() => {
                                                                        void cargarMasLugares();
                                                                }}
                                                                style={
                                                                        styles.filtro
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.filtroTexto
                                                                        }
                                                                >
                                                                        {actualizando
                                                                                ? "Cargando…"
                                                                                : "Cargar más lugares"}
                                                                </Text>
                                                        </Pressable>
                                                ) : null
                                        }
                                        ListEmptyComponent={
                                                <EstadoPantalla
                                                        tipo="vacio"
                                                        titulo={
                                                                busqueda.trim() || radioDistancia !== null ||
                                                                categoriaSeleccionada
                                                                        ? "No encontramos lugares"
                                                                        : "Todavía no hay lugares disponibles"
                                                        }
                                                        mensaje={
                                                                busqueda.trim() || radioDistancia !== null ||
                                                                categoriaSeleccionada
                                                                        ? "Probá con otra búsqueda, categoría o distancia."
                                                                        : "Volvé a consultar más tarde."
                                                        }
                                                />
                                        }
                                />
                                </View>
                        )}
                        <Modal visible={selectorFiltro !== null} transparent animationType="fade" onRequestClose={() => { if (!aplicandoFiltro) setSelectorFiltro(null); }}>
                                <View style={styles.fondoSelector}>
                                        <Pressable style={StyleSheet.absoluteFillObject} accessibilityRole="button" accessibilityLabel="Cerrar opciones" disabled={aplicandoFiltro} onPress={() => setSelectorFiltro(null)} />
                                        <View style={styles.popupSelector} accessibilityViewIsModal>
                                                <Text accessibilityRole="header" style={styles.tituloSelector}>{selectorFiltro === "orden" ? 'Ordenar lugares' : 'Distancia máxima'}</Text>
                                                {(selectorFiltro === "orden" ? [{ valor: null, texto: 'Orden original' }, { valor: 1, texto: 'Más cerca' }] : [{ valor: null, texto: 'Sin límite' }, ...[100, 250, 500, 1000].map(valor => ({ valor, texto: `Hasta ${valor} metros` }))]).map(opcion => {
                                                        const seleccionada = selectorFiltro === "orden" ? ordenCercania === (opcion.valor !== null) : radioDistancia === opcion.valor;
                                                        return <Pressable key={opcion.texto} accessibilityRole="radio" accessibilityState={{ selected: seleccionada, disabled: aplicandoFiltro }} disabled={aplicandoFiltro} style={styles.opcionDistancia} onPress={() => void elegirFiltro(opcion.valor)}>
                                                                <Text style={styles.controlDistanciaTexto}>{opcion.texto}</Text>
                                                                <Ionicons name={seleccionada ? 'radio-button-on' : 'radio-button-off'} size={21} color={colors.primary} />
                                                        </Pressable>;
                                                })}
                                                {aplicandoFiltro && <Text style={styles.avisoDistancia}>Obteniendo ubicación…</Text>}
                                        </View>
                                </View>
                        </Modal>
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                controlesDistancia: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
                controlDistancia: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingHorizontal: 12, backgroundColor: colors.surface },
                controlDistanciaTexto: { fontSize: 13, color: colors.secondary },
                avisoDistancia: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
                fondoSelector: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#00000066" },
                popupSelector: { backgroundColor: colors.background, padding: 20, borderRadius: 24, width: "100%", maxWidth: 440, alignSelf: "center" },
                tituloSelector: { fontSize: 19, fontWeight: "700", color: colors.secondary, marginBottom: 14 },
                opcionDistancia: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48, gap: 12 },
                selectorVista: {
                        flexDirection: "row",
                        marginHorizontal: spacing.md,
                        padding: 3,
                        borderRadius: 28,
                        backgroundColor: colors.yellowLight,
                },
                opcionVistaActiva: { backgroundColor: colors.primarySolid },

                opcionVista: {
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: spacing.sm,
                        minHeight: 48,
                        borderRadius: borderRadius.pill,
                },

                contenedorMapa: { flex: 1 },

                controlesMapa: { paddingHorizontal: spacing.md },
                filtrosMapa: { gap: spacing.sm, paddingVertical: spacing.sm },
                borrarMapa: {
                        minWidth: 44,
                        minHeight: 44,
                        justifyContent: "center",
                        alignItems: "center",
                },

                tituloMapa: {
                        fontSize: fontSize.title,
                        fontWeight: "700",
                        color: colors.text,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                },

                avisoMapa: {
                        padding: spacing.sm,
                        textAlign: "center",
                        color: colors.textSecondary,
                },

                cargarMapa: {
                        minHeight: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.secondaryLight,
                },

                container: {
                        flex: 1,
                        backgroundColor: colors.background,
                },

                header: { minHeight: 130, justifyContent: "flex-end", paddingTop: 72, marginHorizontal: 18, marginTop: 8, marginBottom: 24, backgroundColor: colors.background },
                logo: { width: 95, height: 62, position: "absolute", left: 0, top: 0 },
                puente: { width: 205, height: 115, position: "absolute", right: -24, top: 0, opacity: 0.85 },
                tituloCabecera: { fontFamily: fuenteTitulo, fontSize: 24, lineHeight: 30, fontWeight: "700", color: colors.blueText },
                descripcionCabecera: { fontSize: 14, lineHeight: 20, color: colors.greenText, marginTop: 2 },

                vistaLista: { flex: 1 },
                controlesLista: { paddingHorizontal: spacing.md, paddingTop: spacing.lg / 2, paddingBottom: spacing.sm },
                listaDesplazable: { flex: 1 },
                lista: {
                        paddingHorizontal: spacing.md,
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
                        minHeight: 48,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.pill,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingVertical: spacing.sm,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 5,
                        elevation: 2,
                },

                input: {
                        flex: 1,
                        minWidth: 0,
                        fontSize: 14,
                        lineHeight: 20,
                        paddingVertical: spacing.xs,
                        color: colors.text,
                },

                categorias: { gap: 8, paddingVertical: 7 },

                filtro: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.xs,
                        minHeight: 44,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.pill,
                        backgroundColor: colors.secondaryLight,
                },

                filtroSeleccionado: {
                        backgroundColor: colors.secondarySolid,
                },

                filtroTexto: {
                        flexShrink: 1,
                        maxWidth: 220,
                        fontSize: fontSize.caption,
                        fontWeight: "600",
                        color: colors.secondary,
                },

                filtroTextoSeleccionado: {
                        color: colors.onPrimary,
                },

                encabezadoResultados: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: spacing.md,
                },

                tituloResultados: {
                        ...tipografia.seccion,
                        fontFamily: fuenteTitulo,
                        flex: 1,
                        marginRight: spacing.sm,
                        color: colors.greenText,
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
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
