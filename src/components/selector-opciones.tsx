import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";

interface Opcion {
        valor: number;
        texto: string;
}

interface SelectorOpcionesProps {
        etiqueta: string;
        detalle: string;
        valor: number;
        opciones: Opcion[];
        onCambiar: (valor: number) => void;
        deshabilitado?: boolean;
}

export function SelectorOpciones({
        etiqueta,
        detalle,
        valor,
        opciones,
        onCambiar,
        deshabilitado = false,
}: SelectorOpcionesProps) {
        const { styles } = useEstilos();

        return (
                <View style={styles.contenedor}>
                        <Text style={styles.etiqueta}>{etiqueta}</Text>
                        <Text style={styles.detalle}>{detalle}</Text>
                        <View
                                style={styles.opciones}
                                accessibilityRole="radiogroup"
                        >
                                {opciones.map((opcion) => {
                                        const elegida = opcion.valor === valor;
                                        return (
                                                <Pressable
                                                        key={opcion.valor}
                                                        accessibilityRole="radio"
                                                        accessibilityLabel={
                                                                opcion.texto
                                                        }
                                                        accessibilityState={{
                                                                checked: elegida,
                                                                disabled: deshabilitado,
                                                        }}
                                                        disabled={deshabilitado}
                                                        onPress={() =>
                                                                onCambiar(
                                                                        opcion.valor,
                                                                )
                                                        }
                                                        style={[
                                                                styles.opcion,
                                                                elegida &&
                                                                        styles.opcionElegida,
                                                                deshabilitado &&
                                                                        styles.deshabilitado,
                                                        ]}
                                                >
                                                        <Text
                                                                style={[
                                                                        styles.texto,
                                                                        elegida &&
                                                                                styles.textoElegido,
                                                                ]}
                                                        >
                                                                {opcion.texto}
                                                        </Text>
                                                </Pressable>
                                        );
                                })}
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
                opciones: {
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                },
                opcion: {
                        flexGrow: 1,
                        minWidth: 86,
                        minHeight: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: colors.secondaryLight,
                        borderWidth: 1,
                        borderColor: colors.border,
                },
                opcionElegida: {
                        backgroundColor: colors.primarySolid,
                        borderColor: colors.primarySolid,
                },
                texto: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.secondary,
                },
                textoElegido: { color: colors.onPrimary },
                deshabilitado: { opacity: 0.5 },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
