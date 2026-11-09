import { MaterialCommunityIcons } from "@expo/vector-icons";
import { categoriasIntereses } from "../../../constants/categorias-intereses";
import { tipografia } from "../../styles/tipografia";
import { useTema } from "../../context/tema.context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";

import { ImagenPersistente } from "../imagen-persistente";
import { BotonLugarFavorito } from "../boton-lugar-favorito";
import type { Lugar } from "../../types/Lugar";
import type { Evento } from "../../types/evento";
import { colorsInicio as paletaColors } from "../../styles/inicio";
import { borderRadius, spacing } from "../../styles/theme";
import {
        diaLocal,
        estadoVisible,
        numeroDeDia,
} from "../../services/fechas-eventos";

interface LugarInicioProps {
        lugar: Lugar;
        categoria: string;
        distancia: string | null;
}

export function TarjetaLugarInicio({
        lugar,
        categoria,
        distancia,
}: LugarInicioProps) {
        const { colors, styles } = useEstilos();
        const categoriaVisual = categoriasIntereses.find(
                (item) => item.id === lugar.categoriaId,
        );

        return (
                <View style={styles.tarjeta}>
                        <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Ver ${lugar.nombre}`}
                                onPress={() =>
                                        router.push({
                                                pathname: "/(tabs)/explore/lugar/[id]",
                                                params: { id: lugar.id },
                                        })
                                }
                        >
                                {lugar.imagenes.length > 0 ? (
                                        <ImagenPersistente
                                                url={lugar.imagenes[0]}
                                                style={styles.imagenLugar}
                                        />
                                ) : (
                                        <View
                                                style={[
                                                        styles.imagenLugar,
                                                        styles.sinImagen,
                                                ]}
                                        >
                                                <Ionicons
                                                        name="image-outline"
                                                        size={32}
                                                        color={
                                                                colors.textSecondary
                                                        }
                                                />
                                                <Text style={styles.secundario}>
                                                        Imagen no disponible
                                                </Text>
                                        </View>
                                )}
                                <View style={styles.infoLugar}>
                                        <View style={styles.textos}>
                                                <Text
                                                        style={styles.nombre}
                                                        numberOfLines={2}
                                                >
                                                        {lugar.nombre}
                                                </Text>
                                                <View style={styles.fila}>
                                                        <Ionicons
                                                                name="location-outline"
                                                                size={17}
                                                                color={
                                                                        colors.textSecondary
                                                                }
                                                        />
                                                        <Text
                                                                style={
                                                                        styles.secundario
                                                                }
                                                                numberOfLines={
                                                                        2
                                                                }
                                                        >
                                                                {distancia ??
                                                                        lugar.direccion}
                                                        </Text>
                                                </View>
                                        </View>
                                        <View
                                                style={styles.categoria}
                                                accessible
                                                accessibilityLabel={categoria}
                                        >
                                                <MaterialCommunityIcons
                                                        name={
                                                                categoriaVisual?.icono ??
                                                                "map-marker-outline"
                                                        }
                                                        size={24}
                                                        color={
                                                                categoriaVisual?.color ??
                                                                colors.greenText
                                                        }
                                                />
                                        </View>
                                </View>
                        </Pressable>
                        <View style={styles.corazon}>
                                <BotonLugarFavorito id={lugar.id} />
                        </View>
                </View>
        );
}

export function TarjetaEventoInicio({
        evento,
        direccion,
}: {
        evento: Evento;
        direccion: string;
}) {
        const { colors, styles } = useEstilos();

        const fecha = new Date(evento.inicio);
        const estado = estadoVisible(evento);
        const dia = numeroDeDia(diaLocal(evento.inicio));
        const mes = fecha
                .toLocaleDateString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires",
                        month: "short",
                })
                .replace(".", "")
                .toUpperCase();
        return (
                <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ver ${evento.titulo}`}
                        style={[styles.tarjeta, styles.evento]}
                        onPress={() =>
                                router.push({
                                        pathname: "/(tabs)/agenda/evento/[id]",
                                        params: { id: evento.id },
                                })
                        }
                >
                        <View>
                                {evento.imagenUrl ? (
                                        <ImagenPersistente
                                                url={evento.imagenUrl}
                                                style={styles.imagenEvento}
                                        />
                                ) : (
                                        <View
                                                style={[
                                                        styles.imagenEvento,
                                                        styles.sinImagen,
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
                                <View style={styles.fecha}>
                                        <Text style={styles.dia}>{dia}</Text>
                                        <Text style={styles.mes}>{mes}</Text>
                                </View>
                        </View>
                        <View style={styles.infoEvento}>
                                <Text style={styles.nombre} numberOfLines={2}>
                                        {evento.titulo}
                                </Text>
                                <View style={styles.fila}>
                                        <Ionicons
                                                name="location-outline"
                                                size={15}
                                                color={colors.textSecondary}
                                        />
                                        <Text
                                                style={styles.secundario}
                                                numberOfLines={2}
                                        >
                                                {direccion}
                                        </Text>
                                </View>
                                <View
                                        style={[
                                                styles.estado,
                                                estado === "suspendido" &&
                                                        styles.suspendido,
                                                estado === "cancelado" &&
                                                        styles.cancelado,
                                                estado === "finalizado" &&
                                                        styles.finalizado,
                                        ]}
                                >
                                        <Text
                                                style={[
                                                        styles.estadoTexto,
                                                        estado === "suspendido" &&
                                                                styles.suspendidoTexto,
                                                        estado === "cancelado" &&
                                                                styles.canceladoTexto,
                                                        estado === "finalizado" &&
                                                                styles.finalizadoTexto,
                                                ]}
                                        >
                                                {estado.toUpperCase()}
                                        </Text>
                                </View>
                        </View>
                </Pressable>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                tarjeta: {
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginBottom: spacing.md,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        elevation: 1,
                },
                imagenLugar: { width: "100%", height: 120 },
                sinImagen: {
                        backgroundColor: colors.blueLight,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: spacing.sm,
                },
                corazon: {
                        position: "absolute",
                        top: spacing.sm,
                        right: spacing.sm,
                },
                infoLugar: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                        padding: 12,
                },
                textos: { flex: 1, minWidth: 0 },
                nombre: { ...tipografia.opcion, color: colors.blueText },
                fila: {
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: spacing.xs,
                        marginTop: spacing.xs,
                },
                secundario: {
                        ...tipografia.detalle,
                        flexShrink: 1,
                        color: colors.textSecondary,
                },
                categoria: {
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        alignItems: "center",
                        justifyContent: "center",
                },
                evento: { flex: 1, minWidth: 0 },
                imagenEvento: { height: 140, width: "100%" },
                fecha: {
                        position: "absolute",
                        top: 10,
                        left: 10,
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderRadius: 12,
                        backgroundColor: colors.primarySolid,
                        alignItems: "center",
                },
                dia: {
                        fontSize: 18,
                        color: colors.onPrimary,
                        fontWeight: "500",
                },
                mes: { fontSize: 11, color: colors.onPrimary },
                infoEvento: { padding: 12, gap: spacing.xs },
                estado: {
                        alignSelf: "flex-start",
                        backgroundColor: colors.blueLight,
                        paddingHorizontal: 10,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.pill,
                        marginTop: spacing.xs,
                        maxWidth: "100%",
                },
                estadoTexto: { color: colors.secondary, fontSize: 10 },
                suspendido: { backgroundColor: colors.yellowLight },
                suspendidoTexto: { color: colors.yellow },
                cancelado: { backgroundColor: colors.primaryLight },
                canceladoTexto: { color: colors.error },
                finalizado: { backgroundColor: colors.secondaryLight },
                finalizadoTexto: { color: colors.textSecondary },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
