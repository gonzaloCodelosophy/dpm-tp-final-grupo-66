import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useTema } from "../context/tema.context";
import { borderRadius, colors as paletaColors, spacing } from "../styles/theme";
import type { Coordenadas } from "../types/Coordenadas";

interface MapaEventoProps {
        coordenadas: Coordenadas;
        titulo: string;
        onPress: () => void;
}

/**
 * En web no hay mapa nativo: se muestra el mismo acceso "Ver en el mapa",
 * que abre Google Maps en una pestaña.
 */
export function MapaEvento({ titulo, onPress }: MapaEventoProps) {
        const { colors } = useTema();
        const styles = crearEstilos(colors);

        return (
                <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ver ${titulo} en el mapa`}
                        onPress={onPress}
                        style={({ pressed }) => [
                                styles.tarjeta,
                                pressed && styles.presionado,
                        ]}
                >
                        <View style={styles.icono}>
                                <Ionicons
                                        name="map-outline"
                                        size={22}
                                        color={colors.secondary}
                                />
                        </View>
                        <View style={styles.textos}>
                                <Text style={styles.titulo}>Ver en el mapa</Text>
                                <Text style={styles.detalle} numberOfLines={1}>
                                        {titulo}
                                </Text>
                        </View>
                        <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={colors.textSecondary}
                        />
                </Pressable>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                tarjeta: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                        padding: spacing.md,
                        marginTop: spacing.sm,
                        borderRadius: borderRadius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                },
                icono: {
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.secondaryLight,
                },
                textos: { flex: 1 },
                titulo: {
                        color: colors.blueText,
                        fontSize: 15,
                        fontWeight: "700",
                },
                detalle: {
                        color: colors.textSecondary,
                        fontSize: 13,
                        marginTop: 2,
                },
                presionado: { opacity: 0.8 },
        });
