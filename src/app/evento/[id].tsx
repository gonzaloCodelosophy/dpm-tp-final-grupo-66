import { usePopup } from '../../context/popup.context';
import { useCallback, useEffect, useState } from "react";
import { useTema } from "../../context/tema.context";
import { colors as paletaColors } from "../../styles/theme";
import { fuenteTitulo } from "../../styles/inicio";
import { ImagenPersistente } from "../../components/imagen-persistente";
import { BotonVolver } from "../../components/boton-volver";
import { BackHandler, View, Text, StyleSheet, ActivityIndicator, ScrollView, Linking, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
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
import { useEventoDetalle } from "../../hooks/use-evento-detalle";
import { useAhora } from "../../hooks/use-ahora";
import { useDetallesLugares } from "../../hooks/use-detalles-lugares";
import { usePreferenciasNotificaciones } from "../../hooks/use-preferencias-notificaciones";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import BotonEventoFavorito from "../../components/boton-evento-favorito";
import { MapaEvento } from "../../components/mapa-evento";
import { leerCatalogoLocal } from "../../data/repositories/catalogo.repository";
import type { Lugar } from "../../types/Lugar";
import {
        estadoVisible,
        formatearFechaEvento,
} from "../../services/fechas-eventos";
import { sincronizarRecordatorioEvento, simularRecordatorioEvento } from "../../services/recordatorios-eventos.service";

export default function PantallaDetalleEvento() {
  const mostrarPopup = usePopup();
        const { colorsInicio: colors } = useTema();
        const styles = crearEstilos(colors);
        const { width } = useWindowDimensions();
        const altoImagen = Math.min(width * 0.72, 320);
        const { id, origen } = useLocalSearchParams<{
                id: string;
                origen?: string;
        }>();
        const router = useRouter();
        const ahora = useAhora();
        const { horasRecordatorioEvento: horasRecordatorio } =
                usePreferenciasNotificaciones();
        const { evento: eventoLocal, cargando, error, sinConexion } =
                useEventoDetalle(id);
        const guardados = useEventosGuardados();
        const eventoGuardado =
                guardados.eventos.find((item) => item.id === id) ?? null;
        const evento =
                (eventoLocal?.id === id ? eventoLocal : null) ?? eventoGuardado;
        const esperando = !evento && (cargando || guardados.cargando);
        const [catalogoLocal, setCatalogoLocal] = useState<Lugar[]>([]);

        useEffect(() => {
                let activo = true;
                void leerCatalogoLocal()
                        .then((catalogo) => {
                                if (activo)
                                        setCatalogoLocal(
                                                catalogo.datos?.lugares ?? [],
                                        );
                        })
                        .catch(() => {
                                if (activo) setCatalogoLocal([]);
                        });
                return () => {
                        activo = false;
                };
        }, []);

        // Si el evento no trae coordenadas, se obtienen del lugar asociado.
        const lugarDetalle = useDetallesLugares(
                evento?.lugarId ? [evento.lugarId] : [],
                catalogoLocal,
        );
        const lugarEvento = lugarDetalle.lugares[0] ?? null;
        const coordenadasEvento =
                evento?.coordenadas ?? lugarEvento?.coordenadas ?? null;
        const nombreLugar = lugarEvento?.nombre ?? null;
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
                if (!coordenadasEvento) return;
                const { latitud, longitud } = coordenadasEvento;
                const label = encodeURIComponent(evento?.titulo ?? "Evento");
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

        const estado = evento ? estadoVisible(evento, new Date(ahora)) : "programado";
        const programado = estado === "programado";
        const suspendido = estado === "suspendido";
        const cancelado = estado === "cancelado";
        const finalizado = estado === "finalizado";
        const puedeGuardarse = programado || suspendido;
        const estaGuardado =
                evento !== null &&
                guardados.eventos.some((item) => item.id === evento.id);
        const textoFecha = evento ? formatearFechaEvento(evento, true) : "";
        const [simulando, setSimulando] = useState(false);

        const abrirLugar = () => {
                if (!evento?.lugarId) return;
                router.push({
                        pathname: "/(tabs)/explore/lugar/[id]",
                        params: { id: evento.lugarId },
                });
        };

        const probarNotificacion = async () => {
                if (!evento || simulando) return;
                setSimulando(true);
                try {
                        await simularRecordatorioEvento(
                                evento,
                                horasRecordatorio,
                        );
                } catch (fallo) {
                        mostrarPopup(
                                "Recordatorio",
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No se pudo mostrar la notificación de prueba.",
                        );
                } finally {
                        setSimulando(false);
                }
        };

        // Mantiene el recordatorio local alineado con el estado y con si el
        // evento está guardado (la API avisa los cambios, pero el recordatorio
        // lo programa el teléfono).
        useEffect(() => {
                if (!evento) return;
                void sincronizarRecordatorioEvento(
                        evento,
                        estaGuardado,
                        horasRecordatorio,
                ).catch((fallo) => {
                        console.warn(
                                "No se pudo sincronizar el recordatorio del evento",
                                fallo,
                        );
                });
        }, [evento, estaGuardado, estado, horasRecordatorio]);

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
                        {esperando ? (
                                <View style={styles.center}>
                                        <ActivityIndicator
                                                color={colors.primary}
                                        />
                                </View>
                        ) : !evento ? (
                                <View style={styles.center}>
                                        <Text style={styles.infoText}>
                                                {error &&
                                                error.codigo !==
                                                        "EVENTO_NO_ENCONTRADO"
                                                        ? "No pudimos cargar el evento."
                                                        : "Evento no encontrado."}
                                        </Text>
                                        <EstadoCatalogo
                                                sinConexion={sinConexion}
                                                recurso="eventos"
                                        />
                                </View>
                        ) : (
                                <ScrollView
                                        contentContainerStyle={styles.scroll}
                                >
                                        <EstadoCatalogo
                                                sinConexion={sinConexion}
                                                recurso="eventos"
                                        />
                                        <View style={styles.tarjeta}>
                                                {evento.imagenUrl ? (
                                                        <ImagenPersistente
                                                                url={
                                                                        evento.imagenUrl
                                                                }
                                                                style={
                                                                        [styles.imagen, { height: altoImagen }]
                                                                }
                                                                contentFit="cover"
                                                                iconoError
                                                        />
                                                ) : (
                                                        <View
                                                                style={[
                                                                        styles.imagen,
                                                                        { height: altoImagen },
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
                                                                                  : finalizado
                                                                                    ? styles.badgeFinalizado
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
                                                                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
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
                                                        {evento.lugarId && (
                                                                <TouchableOpacity
                                                                        accessibilityRole="button"
                                                                        accessibilityLabel={
                                                                                nombreLugar
                                                                                        ? `Ver ${nombreLugar} en el catálogo`
                                                                                        : "Ver el lugar en el catálogo"
                                                                        }
                                                                        onPress={
                                                                                abrirLugar
                                                                        }
                                                                        style={
                                                                                styles.enlaceLugar
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="business-outline"
                                                                                size={18}
                                                                                color={
                                                                                        colors.blueText
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.enlaceLugarTexto
                                                                                }
                                                                        >
                                                                                {nombreLugar
                                                                                        ? `Ver ${nombreLugar} en el catálogo`
                                                                                        : "Ver el lugar en el catálogo"}
                                                                        </Text>
                                                                        <Ionicons
                                                                                name="chevron-forward"
                                                                                size={16}
                                                                                color={
                                                                                        colors.textSecondary
                                                                                }
                                                                        />
                                                                </TouchableOpacity>
                                                        )}
                                                        {(
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
                                                                {(suspendido ||
                                                                        cancelado ||
                                                                        finalizado) && (
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
                                                                                                : finalizado
                                                                                                  ? "Evento finalizado"
                                                                                                  : "Evento no disponible"}
                                                                                </Text>
                                                                        </View>
                                                                )}
                                                                {(puedeGuardarse ||
                                                                        estaGuardado) && (
                                                                        <BotonEventoFavorito
                                                                                evento={evento}
                                                                                guardado={
                                                                                        estaGuardado
                                                                                }
                                                                                compacto
                                                                        />
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
                                                        {coordenadasEvento && (
                                                                <View
                                                                        style={
                                                                                styles.mapaSeccion
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.subtitle
                                                                                }
                                                                        >
                                                                                Ubicación
                                                                        </Text>
                                                                        <MapaEvento
                                                                                coordenadas={
                                                                                        coordenadasEvento
                                                                                }
                                                                                titulo={
                                                                                        evento.titulo
                                                                                }
                                                                                onPress={
                                                                                        abrirMapaNativo
                                                                                }
                                                                        />
                                                                </View>
                                                        )}
                                                        {Platform.OS !== "web" && (
                                                                <View
                                                                        style={
                                                                                styles.simulacionContenedor
                                                                        }
                                                                >
                                                                        <TouchableOpacity
                                                                                accessibilityRole="button"
                                                                                accessibilityLabel="Probar notificación del evento"
                                                                                disabled={
                                                                                        simulando
                                                                                }
                                                                                onPress={() => {
                                                                                        void probarNotificacion();
                                                                                }}
                                                                                style={[
                                                                                        styles.botonSimulacion,
                                                                                        simulando &&
                                                                                                styles.botonSimulacionDeshabilitado,
                                                                                ]}
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.botonSimulacionTexto
                                                                                        }
                                                                                >
                                                                                        !
                                                                                </Text>
                                                                        </TouchableOpacity>
                                                                </View>
                                                        )}
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
                        marginTop: 0,
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
                        paddingBottom: 28,
                        maxWidth: 900,
                        width: "100%",
                        alignSelf: "center",
                },
                tarjeta: {
                        backgroundColor: colors.background,
                },
                imagen: { width: "100%", height: 180 },
                placeholder: {
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                },
                content: {
                        marginTop: -24,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        padding: 20,
                        backgroundColor: colors.background,
                },
                title: {
                        fontFamily: fuenteTitulo,
                        fontSize: 28,
                        fontWeight: "700",
                        color: colors.secondary,
                        marginBottom: 12,
                },
                badge: {
                        alignSelf: "flex-start",
                        flexShrink: 0,
                        alignItems: "center",
                        borderRadius: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginBottom: 12,
                },
                badgeProgramado: { backgroundColor: colors.greenLight },
                badgeSuspendido: { backgroundColor: colors.yellowLight },
                badgeCancelado: { backgroundColor: colors.primaryLight },
                badgeFinalizado: { backgroundColor: colors.secondaryLight },
                badgeText: {
                        paddingHorizontal: 3,
                        lineHeight: 16,
                        textAlign: "center",
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.secondary,
                },
                textoSuspendido: { color: colors.secondary },
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
                        fontSize: 19,
                        fontWeight: "700",
                        color: colors.secondary,
                        marginTop: 24,
                        marginBottom: 12,
                },
                description: {
                        fontSize: 15,
                        lineHeight: 24,
                        color: colors.textSecondary,
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
                enlaceLugar: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        padding: 12,
                        marginTop: 4,
                        borderRadius: 12,
                        backgroundColor: colors.secondaryLight,
                },
                enlaceLugarTexto: {
                        flex: 1,
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.blueText,
                },
                mapaSeccion: { marginTop: 4 },
                simulacionContenedor: {
                        alignItems: "flex-end",
                        marginTop: 12,
                        marginBottom: 4,
                },
                botonSimulacion: {
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                },
                botonSimulacionTexto: {
                        color: colors.primary,
                        fontSize: 18,
                        fontWeight: "700",
                        lineHeight: 20,
                },
                botonSimulacionDeshabilitado: { opacity: 0.5 },
                acciones: { gap: 10, marginTop: 18 },
                boton: {
                        minHeight: 48,
                        paddingVertical: 12,
                        borderRadius: 24,
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
