import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";
import { ImagenPersistente } from "./imagen-persistente";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Evento } from "../types/evento";

interface TarjetaEventoProps {
        evento: Evento;
        onPress: () => void;
}

export default function TarjetaEvento({ evento, onPress }: TarjetaEventoProps) {
        const { colors, styles } = useEstilos();

        if (!evento || !evento.inicio) return null;

        const fechaObj = new Date(evento.inicio);
        const textoFecha = evento.inicio.includes("T00:00:00")
                ? `${fechaObj.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} - Sin horario`
                : fechaObj
                          .toLocaleDateString("es-AR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                          })
                          .replace(",", " ·");

        // Asumimos 'Programado' por defecto si el backend no lo envía
        const estado = evento.estado || "programado";

        const getBadgeStyle = () => {
                if (estado === "cancelado")
                        return [styles.badge, styles.badgeCancelado];
                if (estado === "suspendido")
                        return [styles.badge, styles.badgeSuspendido];
                return [styles.badge, styles.badgeProgramado];
        };

        return (
                <TouchableOpacity
                        style={styles.tarjeta}
                        onPress={onPress}
                        activeOpacity={0.8}
                >
                        <View style={styles.imageContainer}>
                                {evento.imagenUrl ? (
                                        <ImagenPersistente
                                                url={evento.imagenUrl}
                                                style={styles.image}
                                        />
                                ) : (
                                        <View
                                                style={[
                                                        styles.image,
                                                        styles.placeholder,
                                                ]}
                                        >
                                                <Ionicons
                                                        name="image-outline"
                                                        size={32}
                                                        color={
                                                                colors.textSecondary
                                                        }
                                                />
                                        </View>
                                )}
                        </View>

                        <View style={styles.infoContainer}>
                                <Text style={styles.title} numberOfLines={2}>
                                        {evento.titulo}
                                </Text>

                                <View style={styles.detailRow}>
                                        <Ionicons
                                                name="calendar-outline"
                                                size={15}
                                                color={colors.blueText}
                                        />
                                        <Text style={styles.detailText}>
                                                {textoFecha}
                                        </Text>
                                </View>

                                <View style={styles.detailRow}>
                                        <Ionicons
                                                name="location-outline"
                                                size={15}
                                                color={colors.blueText}
                                        />
                                        <Text
                                                style={styles.detailText}
                                                numberOfLines={1}
                                        >
                                                {evento.direccionLibre ||
                                                        "Colón, Entre Ríos"}
                                        </Text>
                                </View>

                                <View style={getBadgeStyle()}>
                                        <Text
                                                style={[
                                                        styles.badgeText,
                                                        estado ===
                                                                "suspendido" &&
                                                                styles.badgeTextoOscuro,
                                                ]}
                                        >
                                                {estado.toUpperCase()}
                                        </Text>
                                </View>
                        </View>

                        <View style={styles.chevronContainer}>
                                <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={colors.blueText}
                                />
                        </View>
                </TouchableOpacity>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                tarjeta: {
                        flexDirection: "row",
                        backgroundColor: colors.surface,
                        borderRadius: 14,
                        marginBottom: 10,
                        overflow: "hidden",
                        elevation: 1,
                        shadowColor: colors.blueText,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        width: "100%",
                },
                imageContainer: {
                        width: 106,
                        minHeight: 112,
                        borderRadius: 12,
                        alignSelf: "stretch",
                        overflow: "hidden",
                },
                image: {
                        ...StyleSheet.absoluteFillObject,
                },
                placeholder: {
                        backgroundColor: colors.secondaryLight,
                        justifyContent: "center",
                        alignItems: "center",
                },
                infoContainer: {
                        flex: 1,
                        paddingVertical: 10,
                        paddingLeft: 14,
                        paddingRight: 4,
                        justifyContent: "center",
                },
                title: {
                        fontSize: 16,
                        fontWeight: "bold",
                        color: colors.blueText,
                        marginBottom: 7,
                },
                detailRow: {
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                },
                detailText: {
                        flex: 1,
                        fontSize: 13,
                        color: colors.blueText,
                        marginLeft: 6,
                },
                badge: {
                        alignSelf: "flex-start",
                        minWidth: 104,
                        flexShrink: 0,
                        alignItems: "center",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                        marginTop: 4,
                },
                badgeProgramado: { backgroundColor: "#17B3A7" },
                badgeSuspendido: { backgroundColor: "#FFC137" },
                badgeCancelado: { backgroundColor: "#F34D4D" },
                badgeTextoOscuro: { color: "#473400" },
                badgeText: {
                        paddingHorizontal: 3,
                        lineHeight: 16,
                        textAlign: "center",
                        flexShrink: 0,
                        color: colors.onPrimary,
                        fontSize: 10,
                        fontWeight: "bold",
                },
                chevronContainer: {
                        justifyContent: "center",
                        paddingRight: 12,
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
