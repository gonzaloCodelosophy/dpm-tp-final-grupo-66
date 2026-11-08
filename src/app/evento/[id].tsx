import { useCallback } from "react";
import { useTema } from "../../context/tema.context";
import { colors as paletaColors } from "../../styles/theme";
import { fuenteTitulo } from "../../styles/inicio";
import { ImagenPersistente } from "../../components/imagen-persistente";
import { BotonVolver } from "../../components/boton-volver";
import {
        BackHandler,
        View,
        Text,
        StyleSheet,
        ActivityIndicator,
        ScrollView,
        Linking,
        Platform,
        TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
        useLocalSearchParams,
        Stack,
        useRouter,
        useFocusEffect,
        type Href,
} from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useEventosGuardados } from "../../hooks/use-eventos-guardados";
import { useEventos } from "../../hooks/use-eventos";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import BotonEventoFavorito from "../../components/boton-evento-favorito";

export default function PantallaDetalleEvento() {
        const { colorsInicio: colors } = useTema();
        const styles = crearEstilos(colors);
        const { id, origen } = useLocalSearchParams<{
                id: string;
                origen?: string;
        }>();
        const router = useRouter();
        const { datos, sinConexion, cargando } = useEventos();
        const guardados = useEventosGuardados();
        const evento =
                datos?.find((item) => item.id === id) ??
                guardados.eventos.find((item) => item.id === id) ??
                null;
        const volver = useCallback(
                () =>
                        router.navigate(
                                origen === "eventos-guardados"
                                        ? ("/eventos-guardados" as Href)
                                        : "/(tabs)/agenda",
                        ),
                [origen, router],
        );
        useFocusEffect(
                useCallback(() => {
                        const suscripcion = BackHandler.addEventListener(
                                "hardwareBackPress",
                                () => {
                                        volver();
                                        return true;
                                },
                        );
                        return () => suscripcion.remove();
                }, [volver]),
        );

        const abrirMapaNativo = () => {
                if (!evento?.coordenadas) return;
                const { latitud, longitud } = evento.coordenadas;
                const label = encodeURIComponent(evento.titulo);
                const latLng = `${latitud},${longitud}`;
                const url = Platform.select({
                        ios: `maps:0,0?q=${label}@${latLng}`,
                        android: `geo:0,0?q=${latLng}(${label})`,
                        default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
                });
                Linking.openURL(url).catch((err) =>
                        console.error("Error al abrir los mapas", err),
                );
        };

        const estado = evento?.estado || "programado";
        const programado = estado === "programado";
        const suspendido = estado === "suspendido";
        const cancelado = estado === "cancelado";
        const textoFecha = evento
                ? new Date(evento.inicio)
                          .toLocaleDateString("es-AR", {
                                  day: "numeric",
                                  month: "long",
                                  ...(evento.inicio.includes("T00:00:00")
                                          ? {}
                                          : {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                            }),
                          })
                          .replace(",", " ·") +
                  (evento.inicio.includes("T00:00:00") ? " · Sin horario" : "")
                : "";

        return (
                <SafeAreaView
                        style={styles.container}
                        edges={["top", "left", "right"]}
                >
                        <Stack.Screen options={{ headerShown: false }} />
                        <View style={styles.header}>
                                <BotonVolver
                                        onPress={volver}
                                        style={styles.volver}
                                />
                                <Image
                                        source={require("../../../assets/images/logo-colon.png")}
                                        style={styles.logo}
                                        contentFit="contain"
                                        accessibilityLabel="Colón, Entre Ríos"
                                />
                        </View>
                        {cargando && !evento ? (
                                <View style={styles.center}>
                                        <ActivityIndicator
                                                color={colors.primary}
                                        />
                                </View>
                        ) : !evento ? (
                                <View style={styles.center}>
                                        <Text style={styles.infoText}>
                                                {datos === null
                                                        ? "Agenda aún no descargada."
                                                        : "Evento no encontrado."}
                                        </Text>
                                        <EstadoCatalogo
                                                sinConexion={sinConexion}
                                        />
                                </View>
                        ) : (
                                <ScrollView
                                        contentContainerStyle={styles.scroll}
                                >
                                        <EstadoCatalogo
                                                sinConexion={sinConexion}
                                        />
                                        <View style={styles.tarjeta}>
                                                {evento.imagenUrl ? (
                                                        <ImagenPersistente
                                                                url={
                                                                        evento.imagenUrl
                                                                }
                                                                style={
                                                                        styles.imagen
                                                                }
                                                        />
                                                ) : (
                                                        <View
                                                                style={[
                                                                        styles.imagen,
                                                                        styles.placeholder,
                                                                ]}
                                                        >
                                                                <Ionicons
                                                                        name="image-outline"
                                                                        size={
                                                                                32
                                                                        }
                                                                        color={
                                                                                colors.textSecondary
                                                                        }
                                                                />
                                                        </View>
                                                )}
                                                <View style={styles.content}>
                                                        <Text
                                                                style={
                                                                        styles.title
                                                                }
                                                        >
                                                                {evento.titulo}
                                                        </Text>
                                                        <View
                                                                style={[
                                                                        styles.badge,
                                                                        suspendido
                                                                                ? styles.badgeSuspendido
                                                                                : cancelado
                                                                                  ? styles.badgeCancelado
                                                                                  : styles.badgeProgramado,
                                                                ]}
                                                        >
                                                                <Text
                                                                        style={[
                                                                                styles.badgeText,
                                                                                suspendido &&
                                                                                        styles.textoSuspendido,
                                                                        ]}
                                                                >
                                                                        {estado.toUpperCase()}
                                                                </Text>
                                                        </View>
                                                        {(suspendido ||
                                                                cancelado) && (
                                                                <View
                                                                        style={[
                                                                                styles.aviso,
                                                                                {
                                                                                        backgroundColor:
                                                                                                suspendido
                                                                                                        ? colors.yellowLight
                                                                                                        : colors.primaryLight,
                                                                                },
                                                                        ]}
                                                                >
                                                                        <Ionicons
                                                                                name={
                                                                                        suspendido
                                                                                                ? "alert-circle"
                                                                                                : "close-circle"
                                                                                }
                                                                                size={
                                                                                        28
                                                                                }
                                                                                color={
                                                                                        suspendido
                                                                                                ? colors.yellow
                                                                                                : colors.error
                                                                                }
                                                                        />
                                                                        <View
                                                                                style={
                                                                                        styles.avisoContenido
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={[
                                                                                                styles.avisoTitulo,
                                                                                                {
                                                                                                        color: suspendido
                                                                                                                ? colors.blueText
                                                                                                                : colors.error,
                                                                                                },
                                                                                        ]}
                                                                                >
                                                                                        Evento{" "}
                                                                                        {suspendido
                                                                                                ? "suspendido"
                                                                                                : "cancelado"}
                                                                                </Text>
                                                                                <Text
                                                                                        style={
                                                                                                styles.avisoTexto
                                                                                        }
                                                                                >
                                                                                        {suspendido
                                                                                                ? "La actividad se reprogramará. Actualizá la agenda para consultar la nueva fecha."
                                                                                                : "Esta actividad no se realizará."}
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                        )}
                                                        <View
                                                                style={
                                                                        styles.infoRow
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="calendar-outline"
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.blueText
                                                                        }
                                                                />
                                                                <Text
                                                                        style={[
                                                                                styles.infoText,
                                                                                suspendido &&
                                                                                        styles.fechaSuspendida,
                                                                        ]}
                                                                >
                                                                        {
                                                                                textoFecha
                                                                        }
                                                                </Text>
                                                        </View>
                                                        <View
                                                                style={
                                                                        styles.infoRow
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="location-outline"
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.blueText
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.infoText
                                                                        }
                                                                >
                                                                        {evento.direccionLibre ||
                                                                                "Colón, Entre Ríos"}
                                                                </Text>
                                                        </View>
                                                        {programado && (
                                                                <>
                                                                        <Text
                                                                                style={
                                                                                        styles.subtitle
                                                                                }
                                                                        >
                                                                                Sobre
                                                                                el
                                                                                evento
                                                                        </Text>
                                                                        <Text
                                                                                style={
                                                                                        styles.description
                                                                                }
                                                                        >
                                                                                {
                                                                                        evento.descripcion
                                                                                }
                                                                        </Text>
                                                                        {evento.precio !==
                                                                                null && (
                                                                                <View
                                                                                        style={
                                                                                                styles.precio
                                                                                        }
                                                                                >
                                                                                        <Ionicons
                                                                                                name="ticket-outline"
                                                                                                size={
                                                                                                        17
                                                                                                }
                                                                                                color={
                                                                                                        colors.blueText
                                                                                                }
                                                                                        />
                                                                                        <Text
                                                                                                style={
                                                                                                        styles.precioTexto
                                                                                                }
                                                                                        >
                                                                                                {evento.precio ===
                                                                                                0
                                                                                                        ? "Entrada gratuita"
                                                                                                        : `Entrada: ${evento.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}`}
                                                                                        </Text>
                                                                                </View>
                                                                        )}
                                                                </>
                                                        )}
                                                        <View
                                                                style={
                                                                        styles.acciones
                                                                }
                                                        >
                                                                {programado ? (
                                                                        <>
                                                                                {evento.coordenadas && (
                                                                                        <TouchableOpacity
                                                                                                style={
                                                                                                        styles.boton
                                                                                                }
                                                                                                onPress={
                                                                                                        abrirMapaNativo
                                                                                                }
                                                                                        >
                                                                                                <Ionicons
                                                                                                        name="location-outline"
                                                                                                        size={
                                                                                                                19
                                                                                                        }
                                                                                                        color={
                                                                                                                colors.onPrimary
                                                                                                        }
                                                                                                />
                                                                                                <Text
                                                                                                        style={
                                                                                                                styles.botonTexto
                                                                                                        }
                                                                                                >
                                                                                                        Cómo
                                                                                                        llegar
                                                                                                </Text>
                                                                                        </TouchableOpacity>
                                                                                )}
                                                                                <BotonEventoFavorito
                                                                                        evento={
                                                                                                evento
                                                                                        }
                                                                                        compacto
                                                                                />
                                                                        </>
                                                                ) : (
                                                                        <View
                                                                                style={[
                                                                                        styles.boton,
                                                                                        styles.deshabilitado,
                                                                                ]}
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.deshabilitadoTexto
                                                                                        }
                                                                                >
                                                                                        {suspendido
                                                                                                ? "Fecha por confirmar"
                                                                                                : "Evento no disponible"}
                                                                                </Text>
                                                                        </View>
                                                                )}
                                                                {cancelado && (
                                                                        <TouchableOpacity
                                                                                onPress={
                                                                                        volver
                                                                                }
                                                                                style={
                                                                                        styles.enlace
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.enlaceTexto
                                                                                        }
                                                                                >
                                                                                        Volver
                                                                                        a
                                                                                        la
                                                                                        agenda
                                                                                </Text>
                                                                        </TouchableOpacity>
                                                                )}
                                                        </View>
                                                </View>
                                        </View>
                                </ScrollView>
                        )}
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.background },
                header: {
                        minHeight: 64,
                        marginHorizontal: 18,
                        marginTop: 8,
                        alignItems: "center",
                        justifyContent: "center",
                },
                volver: { position: "absolute", left: 0 },
                logo: { width: 90, height: 48 },
                center: {
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 18,
                },
                scroll: {
                        paddingHorizontal: 18,
                        paddingTop: 8,
                        paddingBottom: 28,
                        maxWidth: 600,
                        width: "100%",
                        alignSelf: "center",
                },
                tarjeta: {
                        backgroundColor: colors.surface,
                        borderRadius: 16,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.border,
                },
                imagen: { width: "100%", height: 180 },
                placeholder: {
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                },
                content: { padding: 14 },
                title: {
                        fontFamily: fuenteTitulo,
                        fontSize: 22,
                        fontWeight: "700",
                        color: colors.blueText,
                        marginBottom: 8,
                },
                badge: {
                        alignSelf: "flex-start",
                        minWidth: 104,
                        flexShrink: 0,
                        alignItems: "center",
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginBottom: 12,
                },
                badgeProgramado: { backgroundColor: "#17B3A7" },
                badgeSuspendido: { backgroundColor: "#FFC137" },
                badgeCancelado: { backgroundColor: "#F34D4D" },
                badgeText: {
                        paddingHorizontal: 3,
                        lineHeight: 16,
                        textAlign: "center",
                        flexShrink: 0,
                        fontSize: 11,
                        fontWeight: "700",
                        color: colors.onPrimary,
                },
                textoSuspendido: { color: "#473400" },
                aviso: {
                        flexDirection: "row",
                        gap: 10,
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 14,
                },
                avisoContenido: { flex: 1 },
                avisoTitulo: {
                        fontSize: 15,
                        fontWeight: "700",
                        marginBottom: 3,
                },
                avisoTexto: {
                        fontSize: 13,
                        lineHeight: 18,
                        color: colors.blueText,
                },
                infoRow: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                },
                infoText: {
                        flexShrink: 1,
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.blueText,
                },
                fechaSuspendida: { textDecorationLine: "line-through" },
                subtitle: {
                        fontFamily: fuenteTitulo,
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.greenText,
                        marginTop: 8,
                        marginBottom: 6,
                },
                description: {
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.blueText,
                },
                precio: {
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        gap: 6,
                        padding: 8,
                        backgroundColor: colors.secondaryLight,
                        borderRadius: 8,
                        marginTop: 12,
                },
                precioTexto: { fontSize: 12, color: colors.blueText },
                acciones: { gap: 10, marginTop: 18 },
                boton: {
                        minHeight: 44,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: colors.primarySolid,
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                        justifyContent: "center",
                },
                botonTexto: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.onPrimary,
                },
                deshabilitado: { backgroundColor: colors.secondaryLight },
                deshabilitadoTexto: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textSecondary,
                },
                enlace: { alignItems: "center", paddingVertical: 8 },
                enlaceTexto: {
                        fontSize: 14,
                        color: colors.primary,
                        textDecorationLine: "underline",
                },
        });
