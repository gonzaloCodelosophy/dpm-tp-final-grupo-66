import { useTema } from "../../context/tema.context";
import { colors as paletaColors } from "../../styles/theme";
import { ImagenPersistente } from "../../components/imagen-persistente";
import {
        View,
        Text,
        StyleSheet,
        ActivityIndicator,
        ScrollView,
        Linking,
        Platform,
        TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useEventos } from "../../hooks/use-eventos";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import BotonEventoFavorito from "../../components/boton-evento-favorito";
import * as Notifications from "expo-notifications";

export default function PantallaDetalleEvento() {
        const { colors, styles } = useEstilos();

        const { id } = useLocalSearchParams<{ id: string }>();
        const router = useRouter();
        const { datos, sinConexion, cargando } = useEventos();
        const evento = datos?.find((item) => item.id === id) ?? null;

        if (cargando)
                return (
                        <View style={styles.center}>
                                <ActivityIndicator
                                        size="large"
                                        color={colors.primary}
                                />
                        </View>
                );
        if (!evento)
                return (
                        <View style={styles.center}>
                                <Text>
                                        {datos === null
                                                ? "Agenda aún no descargada."
                                                : "Evento no encontrado."}
                                </Text>
                                <EstadoCatalogo sinConexion={sinConexion} />
                        </View>
                );

        const fechaObj = new Date(evento.inicio);
        const textoFecha = evento.inicio.includes("T00:00:00")
                ? `${fechaObj.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} · Sin horario`
                : fechaObj
                          .toLocaleDateString("es-AR", {
                                  day: "numeric",
                                  month: "long",
                                  hour: "2-digit",
                                  minute: "2-digit",
                          })
                          .replace(",", " ·");

        const estado = evento.estado || "Programado";

        const abrirMapaNativo = () => {
                if (!evento?.coordenadas) return;
                const { latitud, longitud } = evento.coordenadas;
                const label = encodeURIComponent(evento.titulo);
                const latLng = `${latitud},${longitud}`;
                const url = Platform.select({
                        ios: `maps:0,0?q=${label}@${latLng}`,
                        android: `geo:0,0?q=${latLng}(${label})`,
                });
                if (url)
                        Linking.openURL(url).catch((err) =>
                                console.error("Error al abrir los mapas", err),
                        );
        };

        // ! ACORDARSE DE SACAR ESTO ANTES DE HACER EL BUILD
        const probarNotificacion = async () => {
                await Notifications.scheduleNotificationAsync({
                        content: {
                                title: "🔔 ¡Prueba de Notificación!",
                                body: `Esta es una prueba para el evento: ${evento?.titulo}`,
                                sound: true,
                        },
                        trigger: {
                                type: Notifications.SchedulableTriggerInputTypes
                                        .TIME_INTERVAL,
                                seconds: 5,
                        },
                });
        };

        return (
                <ScrollView
                        style={styles.container}
                        contentContainerStyle={{ paddingBottom: 40 }}
                >
                        <Stack.Screen
                                options={{
                                        title: "",
                                        headerTransparent: false,
                                        headerTintColor: colors.text,
                                        headerBackTitle: "",
                                }}
                        />

                        <EstadoCatalogo sinConexion={sinConexion} />
                        {evento.imagenUrl ? (
                                <ImagenPersistente
                                        url={evento.imagenUrl}
                                        style={styles.headerImage}
                                />
                        ) : (
                                <View
                                        style={[
                                                styles.headerImage,
                                                {
                                                        backgroundColor:
                                                                colors.textSecondary,
                                                },
                                        ]}
                                />
                        )}

                        <View style={styles.content}>
                                <Text style={styles.title}>
                                        {evento.titulo}
                                </Text>

                                <View
                                        style={[
                                                styles.badge,
                                                estado === "cancelado"
                                                        ? styles.badgeCancelado
                                                        : estado ===
                                                            "suspendido"
                                                          ? styles.badgeSuspendido
                                                          : styles.badgeProgramado,
                                        ]}
                                >
                                        <Text style={styles.badgeText}>
                                                {estado.toUpperCase()}
                                        </Text>
                                </View>

                                {estado === "suspendido" && (
                                        <View
                                                style={[
                                                        styles.warningBox,
                                                        {
                                                                backgroundColor:
                                                                        colors.yellowLight,
                                                                borderColor:
                                                                        "#FFEEBA",
                                                        },
                                                ]}
                                        >
                                                <Ionicons
                                                        name="alert-circle"
                                                        size={24}
                                                        color={colors.yellow}
                                                />
                                                <View
                                                        style={
                                                                styles.warningTextContainer
                                                        }
                                                >
                                                        <Text
                                                                style={[
                                                                        styles.warningTitle,
                                                                        {
                                                                                color: colors.yellow,
                                                                        },
                                                                ]}
                                                        >
                                                                Evento
                                                                suspendido
                                                        </Text>
                                                        <Text
                                                                style={[
                                                                        styles.warningDesc,
                                                                        {
                                                                                color: colors.yellow,
                                                                        },
                                                                ]}
                                                        >
                                                                La actividad se
                                                                reprogramará.
                                                                Actualizá la
                                                                agenda para
                                                                consultar
                                                                cambios de
                                                                fecha.
                                                        </Text>
                                                </View>
                                        </View>
                                )}

                                {estado === "cancelado" && (
                                        <View
                                                style={[
                                                        styles.warningBox,
                                                        {
                                                                backgroundColor:
                                                                        colors.primaryLight,
                                                                borderColor:
                                                                        "#F5C6CB",
                                                        },
                                                ]}
                                        >
                                                <Ionicons
                                                        name="close-circle"
                                                        size={24}
                                                        color={colors.error}
                                                />
                                                <View
                                                        style={
                                                                styles.warningTextContainer
                                                        }
                                                >
                                                        <Text
                                                                style={[
                                                                        styles.warningTitle,
                                                                        {
                                                                                color: colors.error,
                                                                        },
                                                                ]}
                                                        >
                                                                Evento cancelado
                                                        </Text>
                                                        <Text
                                                                style={[
                                                                        styles.warningDesc,
                                                                        {
                                                                                color: colors.error,
                                                                        },
                                                                ]}
                                                        >
                                                                Esta actividad
                                                                no se realizará.
                                                        </Text>
                                                </View>
                                        </View>
                                )}

                                <View style={styles.infoRow}>
                                        <Ionicons
                                                name="calendar-outline"
                                                size={20}
                                                color={colors.textSecondary}
                                        />
                                        <Text style={styles.infoText}>
                                                {textoFecha}
                                        </Text>
                                </View>

                                <View style={styles.infoRow}>
                                        <Ionicons
                                                name="location-outline"
                                                size={20}
                                                color={colors.textSecondary}
                                        />
                                        <Text style={styles.infoText}>
                                                {evento.direccionLibre ||
                                                        "Colón, Entre Ríos"}
                                        </Text>
                                </View>

                                {estado === "programado" && (
                                        <>
                                                <Text style={styles.subtitle}>
                                                        Sobre el evento
                                                </Text>
                                                <Text
                                                        style={
                                                                styles.description
                                                        }
                                                >
                                                        {evento.descripcion}
                                                </Text>
                                        </>
                                )}

                                <View style={styles.actionContainer}>
                                        {estado === "programado" && (
                                                <>
                                                        <TouchableOpacity
                                                                style={[
                                                                        styles.mainButton,
                                                                        styles.buttonPrimary,
                                                                ]}
                                                                onPress={
                                                                        abrirMapaNativo
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="location-outline"
                                                                        size={
                                                                                20
                                                                        }
                                                                        color={
                                                                                colors.onPrimary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.buttonPrimaryText
                                                                        }
                                                                >
                                                                        Cómo
                                                                        llegar
                                                                </Text>
                                                        </TouchableOpacity>
                                                        <BotonEventoFavorito
                                                                evento={evento}
                                                        />
                                                </>
                                        )}

                                        {estado === "suspendido" && (
                                                <View
                                                        style={[
                                                                styles.mainButton,
                                                                styles.buttonDisabled,
                                                        ]}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.buttonDisabledText
                                                                }
                                                        >
                                                                Fecha por
                                                                confirmar
                                                        </Text>
                                                </View>
                                        )}

                                        {estado === "cancelado" && (
                                                <>
                                                        <View
                                                                style={[
                                                                        styles.mainButton,
                                                                        styles.buttonDisabled,
                                                                ]}
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.buttonDisabledText
                                                                        }
                                                                >
                                                                        Evento
                                                                        no
                                                                        disponible
                                                                </Text>
                                                        </View>
                                                        <TouchableOpacity
                                                                onPress={() =>
                                                                        router.back()
                                                                }
                                                                style={
                                                                        styles.backLink
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.backLinkText
                                                                        }
                                                                >
                                                                        Volver a
                                                                        la
                                                                        agenda
                                                                </Text>
                                                        </TouchableOpacity>
                                                </>
                                        )}

                                        {/* BOTÓN TEMPORAL PARA PRUEBAS */}
                                        <TouchableOpacity
                                                style={{
                                                        backgroundColor:
                                                                "#DC3545",
                                                        paddingVertical: 14,
                                                        borderRadius: 12,
                                                        alignItems: "center",
                                                        marginTop: 10,
                                                }}
                                                onPress={probarNotificacion}
                                                activeOpacity={0.8}
                                        >
                                                <Text
                                                        style={{
                                                                color: "white",
                                                                fontWeight: "bold",
                                                                fontSize: 16,
                                                        }}
                                                >
                                                        🧪 Probar Notificación
                                                        de {evento.titulo}
                                                </Text>
                                        </TouchableOpacity>
                                </View>

                                {evento.coordenadas &&
                                        estado === "programado" && (
                                                <View style={styles.mapSection}>
                                                        <View
                                                                style={
                                                                        styles.mapContainer
                                                                }
                                                        >
                                                                <MapView
                                                                        style={
                                                                                styles.map
                                                                        }
                                                                        scrollEnabled={
                                                                                false
                                                                        }
                                                                        zoomEnabled={
                                                                                false
                                                                        }
                                                                        pitchEnabled={
                                                                                false
                                                                        }
                                                                        rotateEnabled={
                                                                                false
                                                                        }
                                                                        region={{
                                                                                latitude: evento
                                                                                        .coordenadas
                                                                                        .latitud,
                                                                                longitude: evento
                                                                                        .coordenadas
                                                                                        .longitud,
                                                                                latitudeDelta: 0.005,
                                                                                longitudeDelta: 0.005,
                                                                        }}
                                                                >
                                                                        <Marker
                                                                                coordinate={{
                                                                                        latitude: evento
                                                                                                .coordenadas
                                                                                                .latitud,
                                                                                        longitude: evento
                                                                                                .coordenadas
                                                                                                .longitud,
                                                                                }}
                                                                        />
                                                                </MapView>
                                                        </View>
                                                </View>
                                        )}
                        </View>
                </ScrollView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.surface },
                center: {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                },
                headerImage: { width: "100%", height: 250 },
                content: {
                        padding: 20,
                        marginTop: -20,
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                },
                title: {
                        fontSize: 26,
                        fontWeight: "bold",
                        color: colors.text,
                        marginBottom: 12,
                },

                badge: {
                        alignSelf: "flex-start",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        marginBottom: 16,
                },
                badgeProgramado: { backgroundColor: "#17A2B8" },
                badgeSuspendido: { backgroundColor: "#FFC107" },
                badgeCancelado: { backgroundColor: "#DC3545" },
                badgeText: {
                        color: colors.onPrimary,
                        fontSize: 12,
                        fontWeight: "bold",
                },

                warningBox: {
                        flexDirection: "row",
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        marginBottom: 20,
                        alignItems: "flex-start",
                },
                warningTextContainer: { marginLeft: 12, flex: 1 },
                warningTitle: {
                        fontSize: 16,
                        fontWeight: "bold",
                        marginBottom: 4,
                },
                warningDesc: { fontSize: 14, lineHeight: 20 },

                infoRow: {
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                },
                infoText: { fontSize: 16, color: colors.text, marginLeft: 10 },

                subtitle: {
                        fontSize: 18,
                        fontWeight: "bold",
                        marginTop: 16,
                        marginBottom: 8,
                        color: colors.text,
                },
                description: {
                        fontSize: 16,
                        lineHeight: 24,
                        color: colors.text,
                        marginBottom: 24,
                },

                actionContainer: { gap: 12, marginVertical: 20 },
                mainButton: {
                        width: "100%",
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                },
                buttonPrimary: { backgroundColor: colors.primarySolid },
                buttonPrimaryText: {
                        color: colors.onPrimary,
                        fontSize: 16,
                        fontWeight: "bold",
                        marginLeft: 8,
                },
                buttonDisabled: { backgroundColor: colors.secondaryLight },
                buttonDisabledText: {
                        color: colors.textSecondary,
                        fontSize: 16,
                        fontWeight: "bold",
                },
                backLink: { alignItems: "center", marginTop: 8 },
                backLinkText: {
                        color: colors.primary,
                        fontSize: 16,
                        fontWeight: "bold",
                },

                mapSection: { marginTop: 10 },
                mapContainer: {
                        width: "100%",
                        height: 150,
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.border,
                },
                map: { width: "100%", height: "100%" },
        });
function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
