import MapView, { Marker, type MapStyleElement } from "react-native-maps";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useTema } from "../context/tema.context";
import { borderRadius, colors as paletaColors, spacing } from "../styles/theme";
import type { Coordenadas } from "../types/Coordenadas";

const ESTILO_MAPA_OSCURO: MapStyleElement[] = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
        },
        {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
        },
        {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
        },
        {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
        },
        {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
        },
        {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
        },
        {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
        },
        {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
        },
        {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
        },
        {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
        },
        {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
        },
];

interface MapaEventoProps {
        coordenadas: Coordenadas;
        titulo: string;
        onPress: () => void;
}

export function MapaEvento({
        coordenadas,
        titulo,
        onPress,
}: MapaEventoProps) {
        const { colors, oscuro } = useTema();
        const styles = crearEstilos(colors);

        return (
                <View style={styles.contenedor}>
                        <MapView
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                                initialRegion={{
                                        latitude: coordenadas.latitud,
                                        longitude: coordenadas.longitud,
                                        latitudeDelta: 0.008,
                                        longitudeDelta: 0.008,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                toolbarEnabled={false}
                                showsCompass={false}
                                loadingEnabled
                                customMapStyle={
                                        oscuro ? ESTILO_MAPA_OSCURO : undefined
                                }
                                userInterfaceStyle={
                                        oscuro ? "dark" : "light"
                                }
                                accessibilityLabel={`Mapa de ${titulo}`}
                        >
                                <Marker
                                        coordinate={{
                                                latitude: coordenadas.latitud,
                                                longitude: coordenadas.longitud,
                                        }}
                                        title={titulo}
                                        pinColor={colors.primarySolid}
                                />
                        </MapView>
                        <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Ver en el mapa"
                                onPress={onPress}
                                style={({ pressed }) => [
                                        styles.boton,
                                        pressed && styles.presionado,
                                ]}
                        >
                                <Ionicons
                                        name="map-outline"
                                        size={18}
                                        color={colors.onPrimary}
                                />
                                <Text style={styles.botonTexto}>
                                        Ver en el mapa
                                </Text>
                        </Pressable>
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                contenedor: {
                        height: 190,
                        borderRadius: borderRadius.md,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                        marginTop: spacing.sm,
                },
                boton: {
                        position: "absolute",
                        left: spacing.sm,
                        bottom: spacing.sm,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 12,
                        backgroundColor: colors.primarySolid,
                },
                botonTexto: {
                        color: colors.onPrimary,
                        fontSize: 13,
                        fontWeight: "700",
                },
                presionado: { opacity: 0.8 },
        });
