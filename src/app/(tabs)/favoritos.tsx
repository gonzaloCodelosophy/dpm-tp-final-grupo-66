import { BotonVolver } from "../../components/boton-volver";
import { useTema } from "../../context/tema.context";
import { useCallback, useState } from "react";
import {
        FlatList,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        TextInput,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useVolverPerfil } from "../../hooks/use-volver-perfil";
import { useAuth } from "../../context/auth.context";
import { sincronizarFavoritos } from "../../services/favoritos.service";
import { Image } from "expo-image";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useCatalogo } from "../../hooks/use-catalogo";
import { useFavoritos } from "../../hooks/use-favoritos";
import { useDetallesLugares } from "../../hooks/use-detalles-lugares";
import { useUbicacion } from "../../hooks/use-ubicacion";
import { distanciaMetros, textoDistancia } from "../../services/distancias";
import { ImagenPersistente } from "../../components/imagen-persistente";
import { BotonCategoria } from "../../components/boton-categoria";
import { categoriasIntereses } from "../../../constants/categorias-intereses";
import { BotonLugarFavorito } from "../../components/boton-lugar-favorito";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import { EstadoPantalla } from "../../components/estado-pantalla";
import {
        colorsInicio as paletaColors,
        fuenteTitulo,
} from "../../styles/inicio";
import { borderRadius, spacing } from "../../styles/theme";
import { tipografia } from "../../styles/tipografia";
import type { Lugar } from "../../types/Lugar";

const normalizar = (texto: string) =>
        texto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

function horarioHoy(lugar: Lugar) {
        const nombreDia = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Argentina/Buenos_Aires",
                weekday: "short",
        }).format(new Date());
        const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
                nombreDia,
        );
        if (!lugar.horarios.length) return "Consultar horarios";
        const tramos = lugar.horarios.filter((horario) => horario.dia === dia);
        return tramos.length
                ? tramos
                          .map(
                                  (horario) =>
                                          `${horario.abre} a ${horario.cierra}`,
                          )
                          .join(" · ")
                : "Hoy cerrado";
}

export default function FavoritosScreen() {
        const { colors, styles } = useEstilos();

        const volver = useVolverPerfil();
        const { usuario, status } = useAuth();
        const autenticado = status === "autenticado" && usuario !== null;
        const usuarioId =
                status === "autenticado" ? (usuario?.id ?? null) : null;
        useFocusEffect(
                useCallback(() => {
                        if (usuarioId)
                                void sincronizarFavoritos(usuarioId).catch(
                                        () => {
                                                // @gonzalo: si no responde la API sigo mostrando la copia local, está bien?
                                        },
                                );
                }, [usuarioId]),
        );
        const { datos, cargando, sinConexion, error, reintentar } =
                useCatalogo();
        const lugares = datos?.lugares ?? [];
        const guardados = useFavoritos(
                autenticado ? lugares.map((lugar) => lugar.id) : [],
        );
        const detalles = useDetallesLugares(
                autenticado ? guardados.todosFavoritos : [],
                lugares,
        );
        const ubicacion = useUbicacion();
        const [busqueda, setBusqueda] = useState("");
        const [categoria, setCategoria] = useState<string | null>(null);
        const favoritos = detalles.lugares.filter((lugar) => lugar.activo);
        const categoriaSinFavoritos =
                categoria !== null &&
                !favoritos.some((lugar) => lugar.categoriaId === categoria);
        const nombreCategoria = datos?.categorias.find(
                (item) => item.id === categoria,
        )?.nombre;
        const distancia = (lugar: Lugar) =>
                ubicacion.coordenadas
                        ? distanciaMetros(
                                  ubicacion.coordenadas,
                                  lugar.coordenadas,
                          )
                        : null;
        const visibles = favoritos.filter(
                (lugar) =>
                        (!categoria || lugar.categoriaId === categoria) &&
                        normalizar(lugar.nombre).includes(
                                normalizar(busqueda.trim()),
                        ),
        );

        if (!autenticado) {
                return (
                        <SafeAreaView
                                style={styles.container}
                                edges={["top", "left", "right"]}
                        >
                                <View style={styles.lista}>
                                        <View style={styles.cabecera}>
                                                <BotonVolver
                                                        style={styles.volver}
                                                        onPress={volver}
                                                />
                                                <Image
                                                        source={require("../../../assets/images/logo-colon.png")}
                                                        style={styles.logo}
                                                        contentFit="contain"
                                                        accessibilityLabel="Colón, Entre Ríos"
                                                />
                                        </View>
                                        <Text style={styles.titulo}>
                                                Mis favoritos
                                        </Text>
                                </View>
                                {status === "cargando" ? (
                                        <EstadoPantalla tipo="cargando" />
                                ) : (
                                        <EstadoPantalla
                                                tipo="vacio"
                                                titulo={
                                                        status ===
                                                        "biometria_requerida"
                                                                ? "Desbloqueá tu sesión"
                                                                : "Iniciá sesión para ver tus favoritos"
                                                }
                                                mensaje={
                                                        status ===
                                                        "biometria_requerida"
                                                                ? "Autenticá tu sesión para consultar tus lugares guardados."
                                                                : "Necesitás iniciar sesión para guardar y ver lugares favoritos."
                                                }
                                                accion={
                                                        status ===
                                                        "biometria_requerida"
                                                                ? undefined
                                                                : "Iniciar sesión"
                                                }
                                                onPress={
                                                        status ===
                                                        "biometria_requerida"
                                                                ? undefined
                                                                : () =>
                                                                          router.push(
                                                                                  "/(auth)/login",
                                                                          )
                                                }
                                        />
                                )}
                        </SafeAreaView>
                );
        }

        return (
                <SafeAreaView
                        style={styles.container}
                        edges={["top", "left", "right"]}
                >
                        <View style={styles.encabezadoFijo}>
                                <View style={styles.cabecera}>
                                        <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel="Volver atrás"
                                                style={styles.volver}
                                                onPress={volver}
                                        >
                                                <Ionicons
                                                        name="chevron-back"
                                                        size={24}
                                                        color={colors.secondary}
                                                />
                                        </Pressable>
                                        <Image
                                                source={require("../../../assets/images/logo-colon.png")}
                                                style={styles.logo}
                                                contentFit="contain"
                                                accessibilityLabel="Colón, Entre Ríos"
                                        />
                                </View>
                                <Text style={styles.titulo}>Mis favoritos</Text>
                                <Text style={styles.descripcion}>
                                        Los lugares que guardaste para tu
                                        próxima visita
                                </Text>
                                <View style={styles.buscador}>
                                        <Ionicons
                                                name="search-outline"
                                                size={23}
                                                color={colors.primary}
                                        />
                                        <TextInput
                                                accessibilityLabel="Buscar en favoritos"
                                                placeholder="Buscar en tus favoritos"
                                                placeholderTextColor={
                                                        colors.textSecondary
                                                }
                                                value={busqueda}
                                                onChangeText={setBusqueda}
                                                style={styles.input}
                                                returnKeyType="search"
                                        />
                                        {busqueda ? (
                                                <Pressable
                                                        accessibilityLabel="Limpiar búsqueda"
                                                        accessibilityRole="button"
                                                        onPress={() =>
                                                                setBusqueda("")
                                                        }
                                                        hitSlop={8}
                                                >
                                                        <Ionicons
                                                                name="close-circle-outline"
                                                                size={22}
                                                                color={
                                                                        colors.textSecondary
                                                                }
                                                        />
                                                </Pressable>
                                        ) : null}
                                </View>
                                <ScrollView
                                        style={styles.filtrosCategorias}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={
                                                styles.categorias
                                        }
                                >
                                        <BotonCategoria
                                                nombre="Todas"
                                                icono="view-grid-outline"
                                                color={colors.secondary}
                                                fondo={colors.secondaryLight}
                                                seleccionado={
                                                        categoria === null
                                                }
                                                onPress={() =>
                                                        setCategoria(null)
                                                }
                                        />
                                        {datos?.categorias.map((item) => {
                                                const estilo =
                                                        categoriasIntereses.find(
                                                                (
                                                                        categoriaItem,
                                                                ) =>
                                                                        categoriaItem.id ===
                                                                        item.id,
                                                        );
                                                return (
                                                        <BotonCategoria
                                                                key={item.id}
                                                                nombre={
                                                                        item.nombre
                                                                }
                                                                icono={
                                                                        estilo?.icono ??
                                                                        "shape-outline"
                                                                }
                                                                color={
                                                                        estilo?.color ??
                                                                        colors.secondary
                                                                }
                                                                fondo={
                                                                        estilo?.fondo ??
                                                                        colors.secondaryLight
                                                                }
                                                                seleccionado={
                                                                        categoria ===
                                                                        item.id
                                                                }
                                                                onPress={() =>
                                                                        setCategoria(
                                                                                categoria ===
                                                                                        item.id
                                                                                        ? null
                                                                                        : item.id,
                                                                        )
                                                                }
                                                        />
                                                );
                                        })}
                                </ScrollView>
                        </View>
                        <FlatList
                                style={styles.scroll}
                                data={
                                        cargando ||
                                        guardados.cargando ||
                                        guardados.error
                                                ? []
                                                : visibles
                                }
                                keyExtractor={(lugar) => lugar.id}
                                contentContainerStyle={styles.lista}
                                keyboardShouldPersistTaps="handled"
                                ListHeaderComponent={
                                        <>
                                                {(guardados.pendientes > 0 ||
                                                        guardados.errorSincronizacion) && (
                                                        <View
                                                                style={
                                                                        styles.controles
                                                                }
                                                        >
                                                                <Text
                                                                        accessibilityLiveRegion="polite"
                                                                        style={
                                                                                styles.aviso
                                                                        }
                                                                >
                                                                        {guardados.pendientes >
                                                                        0
                                                                                ? `${guardados.pendientes} cambio(s) guardado(s) en este dispositivo. Se sincronizarán al recuperar la conexión.`
                                                                                : "No pudimos actualizar tus favoritos desde la API. Mostramos la copia local."}
                                                                </Text>
                                                                <Pressable
                                                                        accessibilityRole="button"
                                                                        style={
                                                                                styles.orden
                                                                        }
                                                                        onPress={
                                                                                guardados.reintentar
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.controlTexto
                                                                                }
                                                                        >
                                                                                Reintentar
                                                                                sincronización
                                                                        </Text>
                                                                </Pressable>
                                                        </View>
                                                )}
                                                {(detalles.cargando ||
                                                        detalles.error) && (
                                                        <View
                                                                style={
                                                                        styles.controles
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.aviso
                                                                        }
                                                                >
                                                                        {detalles.cargando
                                                                                ? "Cargando los detalles de tus favoritos…"
                                                                                : detalles.faltan
                                                                                  ? `Faltan los detalles de ${detalles.faltan} favorito(s). Conectate para descargarlos.`
                                                                                  : "Mostramos los detalles guardados en este dispositivo."}
                                                                </Text>
                                                                {!detalles.cargando && (
                                                                        <Pressable
                                                                                accessibilityRole="button"
                                                                                style={
                                                                                        styles.orden
                                                                                }
                                                                                onPress={
                                                                                        detalles.reintentar
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.controlTexto
                                                                                        }
                                                                                >
                                                                                        Reintentar
                                                                                        detalles
                                                                                </Text>
                                                                        </Pressable>
                                                                )}
                                                        </View>
                                                )}
                                                <EstadoCatalogo
                                                        sinConexion={
                                                                sinConexion
                                                        }
                                                        error={error !== null}
                                                />
                                                {!cargando &&
                                                        !guardados.cargando &&
                                                        datos &&
                                                        !guardados.error && (
                                                                <Text
                                                                        style={
                                                                                styles.contador
                                                                        }
                                                                >
                                                                        {
                                                                                visibles.length
                                                                        }{" "}
                                                                        {visibles.length ===
                                                                        1
                                                                                ? "lugar guardado"
                                                                                : "lugares guardados"}
                                                                </Text>
                                                        )}
                                        </>
                                }
                                renderItem={({ item }) => (
                                        <View style={styles.tarjeta}>
                                                <Pressable
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Ver ${item.nombre}`}
                                                        style={styles.detalle}
                                                        onPress={() =>
                                                                router.push({
                                                                        pathname: "/lugar/[id]",
                                                                        params: {
                                                                                id: item.id,
                                                                        },
                                                                })
                                                        }
                                                >
                                                        {item.imagenes[0] ? (
                                                                <ImagenPersistente
                                                                        url={
                                                                                item
                                                                                        .imagenes[0]
                                                                        }
                                                                        style={
                                                                                styles.thumbnail
                                                                        }
                                                                        contentFit="cover"
                                                                />
                                                        ) : (
                                                                <View
                                                                        style={[
                                                                                styles.thumbnail,
                                                                                styles.sinImagen,
                                                                        ]}
                                                                >
                                                                        <Ionicons
                                                                                name="image-outline"
                                                                                size={
                                                                                        28
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                </View>
                                                        )}
                                                        <View
                                                                style={
                                                                        styles.contenido
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.nombre
                                                                        }
                                                                        numberOfLines={
                                                                                2
                                                                        }
                                                                >
                                                                        {
                                                                                item.nombre
                                                                        }
                                                                </Text>
                                                                <View
                                                                        style={
                                                                                styles.dato
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="location"
                                                                                size={
                                                                                        14
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.datoTexto
                                                                                }
                                                                        >
                                                                                {distancia(
                                                                                        item,
                                                                                ) ===
                                                                                null
                                                                                        ? "Distancia no disponible"
                                                                                        : `a ${textoDistancia(distancia(item)!)}`}
                                                                        </Text>
                                                                </View>
                                                                <View
                                                                        style={
                                                                                styles.dato
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="time-outline"
                                                                                size={
                                                                                        14
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.datoTexto
                                                                                }
                                                                        >
                                                                                {horarioHoy(
                                                                                        item,
                                                                                )}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                        <Ionicons
                                                                name="chevron-forward"
                                                                size={18}
                                                                color={
                                                                        colors.secondary
                                                                }
                                                                style={
                                                                        styles.flecha
                                                                }
                                                        />
                                                </Pressable>
                                                <View style={styles.corazon}>
                                                        <BotonLugarFavorito
                                                                id={item.id}
                                                        />
                                                </View>
                                        </View>
                                )}
                                ListEmptyComponent={
                                        cargando ||
                                        guardados.cargando ||
                                        detalles.cargando ? (
                                                <EstadoPantalla tipo="cargando" />
                                        ) : !datos && favoritos.length === 0 ? (
                                                <EstadoPantalla
                                                        tipo={
                                                                sinConexion
                                                                        ? "sinConexion"
                                                                        : "error"
                                                        }
                                                        onPress={() => {
                                                                void reintentar();
                                                        }}
                                                />
                                        ) : guardados.error ? (
                                                <EstadoPantalla
                                                        tipo="error"
                                                        titulo="No pudimos leer tus favoritos"
                                                        onPress={
                                                                guardados.reintentar
                                                        }
                                                />
                                        ) : (
                                                <EstadoPantalla
                                                        tipo="vacio"
                                                        titulo={
                                                                categoriaSinFavoritos
                                                                        ? "No tenés favoritos de esta categoría"
                                                                        : favoritos.length
                                                                          ? "No encontramos coincidencias"
                                                                          : "Todavía no tenés favoritos"
                                                        }
                                                        mensaje={
                                                                categoriaSinFavoritos
                                                                        ? `Todavía no guardaste lugares de ${nombreCategoria ?? "esta categoría"}. Tocá el corazón de un lugar para agregarlo.`
                                                                        : favoritos.length
                                                                          ? "Probá otra búsqueda o elegí otra categoría."
                                                                          : "Tocá el corazón de un lugar para guardarlo acá."
                                                        }
                                                        accion={
                                                                favoritos.length
                                                                        ? "Ver todos los favoritos"
                                                                        : "Explorar lugares"
                                                        }
                                                        onPress={() => {
                                                                if (
                                                                        favoritos.length
                                                                ) {
                                                                        setBusqueda(
                                                                                "",
                                                                        );
                                                                        setCategoria(
                                                                                null,
                                                                        );
                                                                } else
                                                                        router.push(
                                                                                "/(tabs)/explore",
                                                                        );
                                                        }}
                                                />
                                        )
                                }
                        />
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                scroll: { flex: 1 },
                encabezadoFijo: {
                        flexShrink: 0,
                        backgroundColor: colors.background,
                        paddingHorizontal: 18,
                        paddingTop: 8,
                },
                container: { flex: 1, backgroundColor: colors.background },
                lista: {
                        paddingHorizontal: 18,
                        paddingTop: 16,
                        paddingBottom: 32,
                        flexGrow: 1,
                },
                cabecera: {
                        minHeight: 64,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        paddingHorizontal: 52,
                },
                volver: {
                        position: "absolute",
                        left: 0,
                },
                logo: { width: 90, height: 48 },
                titulo: {
                        ...tipografia.titulo,
                        fontFamily: fuenteTitulo,
                        color: colors.blueText,
                },
                descripcion: {
                        ...tipografia.texto,
                        color: colors.greenText,
                        marginTop: 4,
                        marginBottom: 18,
                },
                buscador: {
                        minHeight: 48,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.pill,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 5,
                        elevation: 2,
                },
                input: {
                        ...tipografia.texto,
                        flex: 1,
                        minWidth: 0,
                        color: colors.text,
                        paddingVertical: spacing.xs,
                },
                filtrosCategorias: { flexGrow: 0 },
                categorias: { gap: 8, paddingVertical: 14 },
                controles: {
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 12,
                },
                orden: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        minHeight: 44,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 12,
                        borderRadius: 22,
                },
                controlTexto: { fontSize: 13, color: colors.secondary },
                aviso: {
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginBottom: 12,
                },
                contador: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.secondary,
                        marginBottom: 12,
                },
                tarjeta: {
                        position: "relative",
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 16,
                        marginBottom: 10,
                        overflow: "hidden",
                },
                detalle: {
                        flexDirection: "row",
                        padding: 5,
                        gap: 12,
                        alignItems: "center",
                        minHeight: 106,
                },
                thumbnail: { width: 100, height: 96, borderRadius: 12 },
                sinImagen: {
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                },
                contenido: {
                        flex: 1,
                        paddingVertical: 6,
                        paddingRight: 32,
                        gap: 5,
                },
                nombre: {
                        fontFamily: fuenteTitulo,
                        fontWeight: "700",
                        fontSize: 16,
                        color: colors.secondary,
                },
                dato: { flexDirection: "row", alignItems: "center", gap: 4 },
                datoTexto: {
                        flex: 1,
                        fontSize: 12,
                        lineHeight: 17,
                        color: colors.secondary,
                },
                corazon: { position: "absolute", right: 3, top: 3 },
                flecha: { position: "absolute", bottom: 15, right: 15 },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
