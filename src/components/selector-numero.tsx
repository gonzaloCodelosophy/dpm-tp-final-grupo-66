import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";

interface SelectorNumeroProps {
        etiqueta: string;
        detalle: string;
        valor: number;
        minimo: number;
        maximo: number;
        paso: number;
        textoValor: (valor: number) => string;
        onCambiar: (valor: number) => void;
        deshabilitado?: boolean;
}

export function SelectorNumero({
        etiqueta,
        detalle,
        valor,
        minimo,
        maximo,
        paso,
        textoValor,
        onCambiar,
        deshabilitado = false,
}: SelectorNumeroProps) {
        const { colors, styles } = useEstilos();
        const puedeBajar = !deshabilitado && valor > minimo;
        const puedeSubir = !deshabilitado && valor < maximo;

        return (
                <View style={styles.contenedor}>
                        <Text style={styles.etiqueta}>{etiqueta}</Text>
                        <Text style={styles.detalle}>{detalle}</Text>
                        <View style={styles.controles}>
                                <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Disminuir ${etiqueta}`}
                                        accessibilityState={{
                                                disabled: !puedeBajar,
                                        }}
                                        disabled={!puedeBajar}
                                        onPress={() =>
                                                onCambiar(
                                                        Math.max(
                                                                minimo,
                                                                valor - paso,
                                                        ),
                                                )
                                        }
                                        style={[
                                                styles.boton,
                                                !puedeBajar &&
                                                        styles.deshabilitado,
                                        ]}
                                >
                                        <Ionicons
                                                name="remove"
                                                size={22}
                                                color={colors.secondary}
                                        />
                                </Pressable>
                                <Text
                                        accessibilityLiveRegion="polite"
                                        style={styles.valor}
                                >
                                        {textoValor(valor)}
                                </Text>
                                <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Aumentar ${etiqueta}`}
                                        accessibilityState={{
                                                disabled: !puedeSubir,
                                        }}
                                        disabled={!puedeSubir}
                                        onPress={() =>
                                                onCambiar(
                                                        Math.min(
                                                                maximo,
                                                                valor + paso,
                                                        ),
                                                )
                                        }
                                        style={[
                                                styles.boton,
                                                !puedeSubir &&
                                                        styles.deshabilitado,
                                        ]}
                                >
                                        <Ionicons
                                                name="add"
                                                size={22}
                                                color={colors.secondary}
                                        />
                                </Pressable>
                        </View>
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                contenedor: {
                        padding: 16,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                        marginBottom: 14,
                },
                etiqueta: {
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.blueText,
                },
                detalle: {
                        fontSize: 13,
                        lineHeight: 19,
                        color: colors.textSecondary,
                        marginTop: 3,
                        marginBottom: 12,
                },
                controles: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                },
                boton: {
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.secondaryLight,
                        borderWidth: 1,
                        borderColor: colors.border,
                },
                deshabilitado: { opacity: 0.4 },
                valor: {
                        flex: 1,
                        textAlign: "center",
                        fontSize: 17,
                        fontWeight: "700",
                        color: colors.secondary,
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
