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
import { BotonLugarFavorito } from "../../components/boton-lugar-favorito";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import { EstadoPantalla } from "../../components/estado-pantalla";
import { colorsInicio as colors, fuenteTitulo } from "../../styles/inicio";
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
        const { usuario, status } = useAuth();
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
        const guardados = useFavoritos(lugares.map((lugar) => lugar.id));
        const detalles = useDetallesLugares(guardados.todosFavoritos, lugares);
        const ubicacion = useUbicacion();
        const [busqueda, setBusqueda] = useState("");
        const [categoria, setCategoria] = useState<string | null>(null);
        const [cercania, setCercania] = useState(false);
        const [filtros, setFiltros] = useState(false);
        const [accesible, setAccesible] = useState(false);
        const [gratis, setGratis] = useState(false);
        const favoritos = detalles.lugares.filter((lugar) => lugar.activo);
        const distancia = (lugar: Lugar) =>
                ubicacion.coordenadas
                        ? distanciaMetros(
                                  ubicacion.coordenadas,
                                  lugar.coordenadas,
                          )
                        : null;
        const visibles = favoritos
                .filter(
                        (lugar) =>
                                (!categoria ||
                                        lugar.categoriaId === categoria) &&
                                normalizar(lugar.nombre).includes(
                                        normalizar(busqueda.trim()),
                                ) &&
                                (!accesible || lugar.accesible) &&
                                (!gratis || lugar.precioEntrada === 0),
                )
                .sort((a, b) => {
                        const diferencia =
                                cercania && ubicacion.coordenadas
                                        ? distancia(a)! - distancia(b)!
                                        : 0;
                        return (
                                diferencia ||
                                a.nombre.localeCompare(b.nombre, "es") ||
                                a.id.localeCompare(b.id)
                        );
                });
        const chip = (titulo: string, activo: boolean, onPress: () => void) => (
                <Pressable
                        key={titulo}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        onPress={onPress}
                        style={[styles.chip, activo && styles.chipActivo]}
                >
                        <Text
                                style={[
                                        styles.chipTexto,
                                        activo && styles.chipTextoActivo,
                                ]}
                        >
                                {titulo}
                        </Text>
                </Pressable>
        );

        return (
                <SafeAreaView
                        style={styles.container}
                        edges={["top", "left", "right"]}
                >
                        <FlatList
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
                                                <View style={styles.cabecera}>
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                accessibilityLabel="Volver atrás"
                                                                style={
                                                                        styles.volver
                                                                }
                                                                onPress={() =>
                                                                        router.canGoBack()
                                                                                ? router.back()
                                                                                : router.replace(
                                                                                          "/(tabs)/perfil",
                                                                                  )
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="chevron-back"
                                                                        size={
                                                                                24
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                        </Pressable>
                                                        <Image
                                                                source={require("../../../assets/images/logo-colon.png")}
                                                                style={
                                                                        styles.logo
                                                                }
                                                                contentFit="contain"
                                                                accessibilityLabel="Colón, Entre Ríos"
                                                        />
                                                </View>
                                                <Text style={styles.titulo}>
                                                        Mis favoritos
                                                </Text>
                                                <Text
                                                        style={
                                                                styles.descripcion
                                                        }
                                                >
                                                        Los lugares que
                                                        guardaste para tu
                                                        próxima visita
                                                </Text>
                                                <View style={styles.buscador}>
                                                        <Ionicons
                                                                name="search-outline"
                                                                size={21}
                                                                color={
                                                                        colors.secondary
                                                                }
                                                        />
                                                        <TextInput
                                                                accessibilityLabel="Buscar en favoritos"
                                                                placeholder="Buscar en tus favoritos"
                                                                placeholderTextColor={
                                                                        colors.textSecondary
                                                                }
                                                                value={busqueda}
                                                                onChangeText={
                                                                        setBusqueda
                                                                }
                                                                style={
                                                                        styles.input
                                                                }
                                                        />
                                                        {busqueda ? (
                                                                <Pressable
                                                                        accessibilityLabel="Limpiar búsqueda"
                                                                        accessibilityRole="button"
                                                                        onPress={() =>
                                                                                setBusqueda(
                                                                                        "",
                                                                                )
                                                                        }
                                                                        style={
                                                                                styles.limpiar
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="close"
                                                                                size={
                                                                                        20
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                </Pressable>
                                                        ) : null}
                                                </View>
                                                <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={
                                                                false
                                                        }
                                                        contentContainerStyle={
                                                                styles.categorias
                                                        }
                                                >
                                                        {chip(
                                                                "Todas",
                                                                categoria ===
                                                                        null,
                                                                () =>
                                                                        setCategoria(
                                                                                null,
                                                                        ),
                                                        )}
                                                        {datos?.categorias
                                                                .filter(
                                                                        (
                                                                                item,
                                                                        ) =>
                                                                                favoritos.some(
                                                                                        (
                                                                                                lugar,
                                                                                        ) =>
                                                                                                lugar.categoriaId ===
                                                                                                item.id,
                                                                                ),
                                                                )
                                                                .map((item) =>
                                                                        chip(
                                                                                item.nombre,
                                                                                categoria ===
                                                                                        item.id,
                                                                                () =>
                                                                                        setCategoria(
                                                                                                categoria ===
                                                                                                        item.id
                                                                                                        ? null
                                                                                                        : item.id,
                                                                                        ),
                                                                        ),
                                                                )}
                                                </ScrollView>
                                                <View style={styles.controles}>
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                style={
                                                                        styles.orden
                                                                }
                                                                onPress={() => {
                                                                        setCercania(
                                                                                !cercania,
                                                                        );
                                                                        if (
                                                                                !cercania &&
                                                                                !ubicacion.coordenadas
                                                                        )
                                                                                void ubicacion.solicitar();
                                                                }}
                                                        >
                                                                <Ionicons
                                                                        name={
                                                                                cercania
                                                                                        ? "location-outline"
                                                                                        : "text-outline"
                                                                        }
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.controlTexto
                                                                        }
                                                                >
                                                                        Ordenar:{" "}
                                                                        {cercania
                                                                                ? "Más cerca"
                                                                                : "Nombre"}
                                                                </Text>
                                                                <Ionicons
                                                                        name="swap-vertical"
                                                                        size={
                                                                                16
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                        </Pressable>
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                accessibilityState={{
                                                                        expanded: filtros,
                                                                }}
                                                                style={[
                                                                        styles.orden,
                                                                        filtros &&
                                                                                styles.chipActivo,
                                                                ]}
                                                                onPress={() =>
                                                                        setFiltros(
                                                                                !filtros,
                                                                        )
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="options-outline"
                                                                        size={
                                                                                19
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.controlTexto
                                                                        }
                                                                >
                                                                        Filtros
                                                                        {accesible ||
                                                                        gratis
                                                                                ? ` (${Number(accesible) + Number(gratis)})`
                                                                                : ""}
                                                                </Text>
                                                        </Pressable>
                                                </View>
                                                {filtros && (
                                                        <View
                                                                style={
                                                                        styles.controles
                                                                }
                                                        >
                                                                {chip(
                                                                        "Accesibles",
                                                                        accesible,
                                                                        () =>
                                                                                setAccesible(
                                                                                        !accesible,
                                                                                ),
                                                                )}
                                                                {chip(
                                                                        "Entrada gratuita",
                                                                        gratis,
                                                                        () =>
                                                                                setGratis(
                                                                                        !gratis,
                                                                                ),
                                                                )}
                                                        </View>
                                                )}
                                                {cercania &&
                                                        !ubicacion.coordenadas && (
                                                                <Text
                                                                        accessibilityLiveRegion="polite"
                                                                        style={
                                                                                styles.aviso
                                                                        }
                                                                >
                                                                        {ubicacion.cargando
                                                                                ? "Buscando tu ubicación…"
                                                                                : "Sin ubicación disponible: ordenamos por nombre."}
                                                                </Text>
                                                        )}
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
                                                                favoritos.length
                                                                        ? "No encontramos coincidencias"
                                                                        : "Todavía no tenés favoritos"
                                                        }
                                                        mensaje={
                                                                favoritos.length
                                                                        ? "Probá otra búsqueda o cambiá los filtros."
                                                                        : "Tocá el corazón de un lugar para guardarlo acá."
                                                        }
                                                        accion={
                                                                favoritos.length
                                                                        ? "Limpiar filtros"
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
                                                                        setAccesible(
                                                                                false,
                                                                        );
                                                                        setGratis(
                                                                                false,
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

const styles = StyleSheet.create({
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
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
        },
        logo: { width: 90, height: 48 },
        titulo: {
                fontFamily: fuenteTitulo,
                fontSize: 24,
                fontWeight: "700",
                color: colors.secondary,
        },
        descripcion: {
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 4,
                marginBottom: 18,
                lineHeight: 20,
        },
        buscador: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 24,
                paddingHorizontal: 14,
                minHeight: 46,
        },
        input: {
                flex: 1,
                fontSize: 14,
                color: colors.secondary,
                paddingVertical: 12,
                minWidth: 0,
        },
        limpiar: {
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
        },
        categorias: { gap: 8, paddingVertical: 14 },
        chip: {
                minHeight: 44,
                paddingHorizontal: 14,
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 22,
                backgroundColor: colors.surface,
        },
        chipActivo: {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
        },
        chipTexto: { fontSize: 13, color: colors.secondary },
        chipTextoActivo: { color: colors.secondary, fontWeight: "600" },
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
        aviso: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
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
        contenido: { flex: 1, paddingVertical: 6, paddingRight: 32, gap: 5 },
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
