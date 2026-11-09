import { useTema } from "../context/tema.context";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";

import { ImagenPersistente } from "./imagen-persistente";
import { BotonLugarFavorito } from "./boton-lugar-favorito";
import { abrirIndicaciones } from "../services/navegacion.service";
import { textoDistancia } from "../services/distancias";
import type { Lugar } from "../types/Lugar";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../styles/theme";

interface TarjetaMapaProps {
        lugar: Lugar;
        categoria?: string;
        distancia: number | null;
        onCerrar: () => void;
}

export function TarjetaMapa({
        lugar,
        categoria,
        distancia,
        onCerrar,
}: TarjetaMapaProps) {
        const { colors, styles } = useEstilos();

        const comoLlegar = async () => {
                try {
                        await abrirIndicaciones(lugar.coordenadas);
                } catch {
                        Alert.alert(
                                "Cómo llegar",
                                "No pudimos abrir el mapa. Intentá de nuevo.",
                        );
                }
        };

        return (
                <View style={styles.tarjeta}>
                        {lugar.imagenes[0] && (
                                <ImagenPersistente
                                        url={lugar.imagenes[0]}
                                        style={styles.imagen}
                                />
                        )}

                        <View style={styles.fila}>
                                <Text style={styles.titulo}>
                                        {lugar.nombre}
                                </Text>
                                <BotonLugarFavorito id={lugar.id} />
                                <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Cerrar lugar seleccionado"
                                        onPress={onCerrar}
                                        style={styles.cerrar}
                                >
                                        <Ionicons
                                                name="close"
                                                size={22}
                                                color={colors.text}
                                        />
                                </Pressable>
                        </View>
                        <Text style={styles.descripcion}>
                                {[
                                        categoria,
                                        distancia !== null
                                                ? textoDistancia(distancia)
                                                : null,
                                ]
                                        .filter(Boolean)
                                        .join(" · ")}
                        </Text>
                        <Text style={styles.descripcion} numberOfLines={2}>
                                {lugar.descripcionCorta}
                        </Text>

                        <View style={styles.botones}>
                                <Pressable
                                        accessibilityRole="button"
                                        onPress={() =>
                                                router.push({
                                                        pathname: "/(tabs)/explore/lugar/[id]",
                                                        params: {
                                                                id: lugar.id,
                                                        },
                                                })
                                        }
                                        style={styles.verLugar}
                                >
                                        <Text style={styles.textoPrincipal}>
                                                Ver lugar
                                        </Text>
                                </Pressable>
                                <Pressable
                                        accessibilityRole="button"
                                        onPress={() => {
                                                void comoLlegar();
                                        }}
                                        style={styles.comoLlegar}
                                >
                                        <Ionicons
                                                name="navigate-outline"
                                                size={18}
                                                color={colors.primary}
                                        />
                                        <Text style={styles.textoSecundario}>
                                                Cómo llegar
                                        </Text>
                                </Pressable>
                        </View>
                        <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Registrar una visita a ${lugar.nombre}`}
                                onPress={() => router.push({
                                        pathname: "/(tabs)/recorrido/recuerdo-visita",
                                        params: { lugarId: lugar.id },
                                })}
                                style={({ pressed }) => [styles.registrarVisita, { opacity: pressed ? 0.8 : 1 }]}
                        >
                                <Ionicons name="add-circle-outline" size={20} color={colors.onPrimary} />
                                <Text style={styles.textoPrincipal}>Registrar visita por cercanía</Text>
                        </Pressable>
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                tarjeta: { padding: spacing.sm, gap: spacing.xs },
                cerrar: {
                        minWidth: 44,
                        minHeight: 44,
                        alignItems: "center",
                        justifyContent: "center",
                },
                imagen: {
                        width: "100%",
                        height: 110,
                        borderRadius: borderRadius.md,
                },
                fila: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                },
                titulo: {
                        flex: 1,
                        fontSize: fontSize.subtitle,
                        fontWeight: "700",
                        color: colors.secondary,
                },
                descripcion: {
                        fontSize: fontSize.caption,
                        color: colors.textSecondary,
                },
                botones: {
                        flexDirection: "row",
                        gap: spacing.sm,
                        marginTop: spacing.sm,
                },
                verLugar: {
                        flex: 1,
                        minHeight: 44,
                        borderRadius: borderRadius.pill,
                        backgroundColor: colors.primarySolid,
                        alignItems: "center",
                        justifyContent: "center",
                },
                registrarVisita: {
                        minHeight: 48,
                        borderRadius: borderRadius.pill,
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        marginTop: spacing.sm,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: spacing.sm,
                        backgroundColor: colors.primarySolid,
                },
                comoLlegar: {
                        flex: 1,
                        minHeight: 44,
                        flexDirection: "row",
                        gap: spacing.xs,
                        borderRadius: borderRadius.pill,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                },
                textoPrincipal: { color: colors.onPrimary, fontWeight: "600" },
                textoSecundario: { color: colors.primary, fontWeight: "600" },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
