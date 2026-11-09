import { useTema } from "../context/tema.context";
import { StyleSheet, Text, View } from "react-native";
import { colors as paletaColors, spacing } from "../styles/theme";

export function EstadoCatalogo({
        sinConexion,
        error = false,
        recurso = "lugares",
}: {
        sinConexion: boolean;
        error?: boolean;
        recurso?: "lugares" | "eventos";
}) {
        const { styles } = useEstilos();

        if (!sinConexion && !error) return null;
        return (
                <View accessibilityRole="alert" style={styles.aviso}>
                        <Text style={styles.texto}>
                                {recurso === "eventos"
                                        ? "No pudimos actualizar la agenda. Mostramos la información guardada."
                                        : "No pudimos actualizar los lugares. Mostramos la información guardada."}
                        </Text>
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                aviso: {
                        padding: spacing.sm,
                        backgroundColor: colors.secondaryLight,
                },
                texto: {
                        color: colors.textSecondary,
                        textAlign: "center",
                        fontSize: 14,
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
