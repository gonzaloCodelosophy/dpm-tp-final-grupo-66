import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { categoriasIntereses } from "../../constants/categorias-intereses";
import { TarjetaLugar } from "./tarjeta-lugar";
import { fuenteTitulo } from "../styles/inicio";
import { useTema } from "../context/tema.context";
import { useEffect, useMemo, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Haptics from "expo-haptics";
import {
        ActivityIndicator,
        Animated,
        PanResponder,
        Keyboard,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        View,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { REGION_INICIAL_COLON, DELTA_CERCANIA, ALTURA_INICIAL_MAPA, ZOOM_INICIAL_MAPA } from "../../constants/mapa";
import { TarjetaMapa } from "./tarjeta-mapa";
import { distanciaMetros } from "../services/distancias";
import { useUbicacion } from "../hooks/use-ubicacion";
import type { Lugar } from "../types/Lugar";
import type { Categoria } from "../types/Categoria";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../styles/theme";

export interface MapaLugaresProps {
        lugares: Lugar[];
        categorias: Categoria[];
}

export function MapaLugares({ lugares, categorias }: MapaLugaresProps) {
        const { colors, styles } = useEstilos();
        const router = useRouter();

        const mapa = useRef<MapView>(null);
        const ubicacion = useUbicacion();
        const [seleccionId, setSeleccionId] = useState<string | null>(null);
        const [altoPanel, setAltoPanel] = useState(0);
        const [mapReady, setMapReady] = useState(false);
        const [centrarPendiente, setCentrarPendiente] = useState(false);
        const [seguirSinUbicacion, setSeguirSinUbicacion] = useState(false);

        const [panelOculto, setPanelOculto] = useState(false);
        const [altoCercanos, setAltoCercanos] = useState(0);
        const desplazamientoPanel = useRef(new Animated.Value(0)).current;
        const inicioArrastre = useRef(0);
        const limitePanel = Math.max(0, altoCercanos - 52);

        function ajustarPanel(oculto: boolean) {
                setPanelOculto(oculto);
                Animated.spring(desplazamientoPanel, {
                        toValue: oculto ? limitePanel : 0,
                        useNativeDriver: true,
                        bounciness: 0,
                }).start();
        }

        useEffect(() => {
                Animated.spring(desplazamientoPanel, {
                        toValue: panelOculto ? limitePanel : 0,
                        useNativeDriver: true,
                        bounciness: 0,
                }).start();
        }, [limitePanel, panelOculto, desplazamientoPanel]);

        const gestoPanel = PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesto) =>
                        Math.abs(gesto.dy) > 5 && Math.abs(gesto.dy) > Math.abs(gesto.dx),
                onPanResponderGrant: () => {
                        desplazamientoPanel.stopAnimation(valor => { inicioArrastre.current = valor; });
                },
                onPanResponderMove: (_, gesto) => {
                        desplazamientoPanel.setValue(Math.min(limitePanel, Math.max(0, inicioArrastre.current + gesto.dy)));
                },
                onPanResponderRelease: (_, gesto) => {
                        const ocultar = Math.abs(gesto.vy) > 0.4
                                ? gesto.vy > 0
                                : inicioArrastre.current + gesto.dy > limitePanel / 2;
                        ajustarPanel(ocultar);
                },
                onPanResponderTerminate: () => ajustarPanel(panelOculto),
        });

        const camaraInicial = {
                center: { latitude: REGION_INICIAL_COLON.lat, longitude: REGION_INICIAL_COLON.lon },
                altitude: ALTURA_INICIAL_MAPA,
                zoom: ZOOM_INICIAL_MAPA,
                heading: 0,
                pitch: 0,
        };

        useEffect(() => {
                if (
                        !centrarPendiente ||
                        !mapReady ||
                        !ubicacion.coordenadas ||
                        !mapa.current
                )
                        return;

                mapa.current.animateToRegion(
                        {
                                latitude: ubicacion.coordenadas.latitud,
                                longitude: ubicacion.coordenadas.longitud,
                                latitudeDelta: DELTA_CERCANIA,
                                longitudeDelta: DELTA_CERCANIA,
                        },
                        500,
                );

                void Haptics.selectionAsync().catch(() => undefined);
                setCentrarPendiente(false);
        }, [centrarPendiente, mapReady, ubicacion.coordenadas]);

        const centrar = async () => {
                if (ubicacion.cargando) return;

                setSeleccionId(null);
                setSeguirSinUbicacion(false);
                setCentrarPendiente(false);

                const coordenadas = await ubicacion.solicitar();
                if (mapa.current) setCentrarPendiente(coordenadas !== null);
        };

        const cercanos = useMemo(
                () =>
                        lugares
                                .filter((lugar) => lugar.activo)
                                .map((lugar) => ({
                                        lugar,
                                        distancia: ubicacion.coordenadas
                                                ? distanciaMetros(
                                                          ubicacion.coordenadas,
                                                          lugar.coordenadas,
                                                  )
                                                : null,
                                }))
                                .sort((a, b) =>
                                        a.distancia !== null &&
                                        b.distancia !== null
                                                ? a.distancia - b.distancia ||
                                                  a.lugar.nombre.localeCompare(
                                                          b.lugar.nombre,
                                                  )
                                                : a.lugar.nombre.localeCompare(
                                                          b.lugar.nombre,
                                                  ),
                                ),
                [lugares, ubicacion.coordenadas],
        );

        // Si el filtro o la actualización quita un lugar, también se cierra su tarjeta.
        const seleccionado = cercanos.find(
                (item) => item.lugar.id === seleccionId,
        );

        useEffect(() => {
                if (seleccionId && !seleccionado) setSeleccionId(null);
        }, [seleccionId, seleccionado]);

        const seleccionar = (lugar: Lugar) => {
                Keyboard.dismiss();

                if (seleccionId !== lugar.id)
                        void Haptics.selectionAsync().catch(() => undefined);

                setSeleccionId(lugar.id);

                if (mapReady)
                        mapa.current?.animateToRegion(
                                {
                                        latitude: lugar.coordenadas.latitud,
                                        longitude: lugar.coordenadas.longitud,
                                        latitudeDelta: DELTA_CERCANIA,
                                        longitudeDelta: DELTA_CERCANIA,
                                },
                                500,
                        );
        };

        const mostrarPanel =
                !seguirSinUbicacion &&
                !ubicacion.coordenadas &&
                ubicacion.permiso !== null &&
                !ubicacion.cargando;
        const textoAccion =
                ubicacion.permiso === "granted"
                        ? "Reintentar"
                        : ubicacion.puedeSolicitar
                          ? "Permitir ubicación"
                          : "Abrir ajustes";

        return (
                <View style={styles.contenedor}>
                        <MapView
                                ref={mapa}
                                style={styles.mapa}
                                initialCamera={camaraInicial}
                                onMapReady={() => setMapReady(true)}
                                mapPadding={{
                                        top: 12,
                                        right: 12,
                                        left: 12,
                                        bottom: (!seleccionado && !mostrarPanel && panelOculto ? 52 : altoPanel) + 12,
                                }}
                                onPress={(evento) => {
                                        if (
                                                evento.nativeEvent.action !==
                                                "marker-press"
                                        )
                                                setSeleccionId(null);
                                }}
                                showsUserLocation={
                                        ubicacion.permiso === "granted" &&
                                        ubicacion.coordenadas !== null
                                }
                                showsMyLocationButton={false}
                                showsCompass
                                toolbarEnabled={false}
                        >
                                {lugares
                                        .filter((lugar) => lugar.activo)
                                        .map((place) => {
                                                const categoria =
                                                        categorias.find(
                                                                (item) =>
                                                                        item.id ===
                                                                        place.categoriaId,
                                                        );

                                                return (
                                                        <Marker
                                                                key={place.id}
                                                                identifier={
                                                                        place.id
                                                                }
                                                                coordinate={{
                                                                        latitude: place
                                                                                .coordenadas
                                                                                .latitud,
                                                                        longitude: place
                                                                                .coordenadas
                                                                                .longitud,
                                                                }}
                                                                accessibilityLabel={
                                                                        place.nombre
                                                                }
                                                                onPress={(
                                                                        evento,
                                                                ) => {
                                                                        evento.stopPropagation();
                                                                        seleccionar(
                                                                                place,
                                                                        );
                                                                }}
                                                                opacity={
                                                                        seleccionado &&
                                                                        seleccionado
                                                                                .lugar
                                                                                .id !==
                                                                                place.id
                                                                                ? 0.55
                                                                                : 1
                                                                }
                                                                anchor={{ x: 0.5, y: 1 }}
                                                        >
                                                                <View style={styles.marcador} collapsable={false}>
                                                                        <View style={[styles.circuloMarcador, { backgroundColor: categoria?.color ?? colors.primary }]}>
                                                                                <MaterialCommunityIcons name={categoriasIntereses.find(item => item.id === place.categoriaId)?.icono ?? "map-marker"} size={17} color="#FFFFFF" />
                                                                        </View>
                                                                        <View style={[styles.puntaMarcador, { borderTopColor: categoria?.color ?? colors.primary }]} />
                                                                </View>
                                                        </Marker>
                                                );
                                        })}
                        </MapView>

                        <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Centrar en mi ubicación"
                                disabled={ubicacion.cargando}
                                accessibilityState={{
                                        disabled: ubicacion.cargando,
                                        busy: ubicacion.cargando,
                                }}
                                onPress={() => {
                                        void centrar();
                                }}
                                style={styles.centrar}
                        >
                                {ubicacion.cargando ? (
                                        <ActivityIndicator
                                                color={colors.secondary}
                                        />
                                ) : (
                                        <Ionicons
                                                name="locate-outline"
                                                size={26}
                                                color={colors.secondary}
                                        />
                                )}
                        </Pressable>

                        {seleccionado ? (
                                <ScrollView
                                        style={styles.panelLugar}
                                        onLayout={(evento) =>
                                                setAltoPanel(
                                                        evento.nativeEvent
                                                                .layout.height,
                                                )
                                        }
                                >
                                        <TarjetaMapa
                                                lugar={seleccionado.lugar}
                                                categoria={
                                                        categorias.find(
                                                                (item) =>
                                                                        item.id ===
                                                                        seleccionado
                                                                                .lugar
                                                                                .categoriaId,
                                                        )?.nombre
                                                }
                                                distancia={
                                                        seleccionado.distancia
                                                }
                                                onCerrar={() =>
                                                        setSeleccionId(null)
                                                }
                                        />
                                </ScrollView>
                        ) : mostrarPanel ? (
                                <ScrollView
                                        style={styles.panel}
                                        contentContainerStyle={
                                                styles.contenidoPermiso
                                        }
                                        onLayout={(evento) =>
                                                setAltoPanel(
                                                        evento.nativeEvent
                                                                .layout.height,
                                                )
                                        }
                                >
                                        <Ionicons
                                                name="location-outline"
                                                size={32}
                                                color={colors.primary}
                                        />
                                        <Text style={styles.titulo}>
                                                {ubicacion.error
                                                        ? "No pudimos ubicarte"
                                                        : "Activá tu ubicación"}
                                        </Text>
                                        <Text
                                                style={styles.mensaje}
                                                accessibilityLiveRegion="polite"
                                        >
                                                {ubicacion.error ??
                                                        "Usamos tu ubicación para mostrarte lugares cercanos y calcular distancias."}
                                        </Text>
                                        <Pressable
                                                accessibilityRole="button"
                                                onPress={() => {
                                                        void centrar();
                                                }}
                                                style={styles.permitir}
                                        >
                                                <Text style={styles.accion}>
                                                        {textoAccion}
                                                </Text>
                                        </Pressable>
                                        <Pressable
                                                accessibilityRole="button"
                                                onPress={() =>
                                                        setSeguirSinUbicacion(
                                                                true,
                                                        )
                                                }
                                                style={styles.continuar}
                                        >
                                                <Text style={styles.enlace}>
                                                        Seguir sin ubicación
                                                </Text>
                                        </Pressable>
                                </ScrollView>
                        ) : (
                                <Animated.View
                                        style={[styles.panelCercanos, { transform: [{ translateY: desplazamientoPanel }] }]}
                                        onLayout={evento => {
                                                setAltoCercanos(evento.nativeEvent.layout.height);
                                                setAltoPanel(evento.nativeEvent.layout.height);
                                        }}
                                >
                                        <View {...gestoPanel.panHandlers}>
                                                <Pressable
                                                        accessibilityRole="button"
                                                        accessibilityLabel={panelOculto ? "Mostrar lo que tenés cerca" : "Ocultar lo que tenés cerca"}
                                                        accessibilityHint="También podés arrastrar hacia abajo para ocultar o hacia arriba para mostrar."
                                                        accessibilityState={{ expanded: !panelOculto }}
                                                        onPress={() => ajustarPanel(!panelOculto)}
                                                        style={styles.controlPanel}
                                                >
                                                        <View style={styles.tiradorPanel} />
                                                </Pressable>
                                        </View>
                                        <View style={{ flexShrink: 1 }} accessibilityElementsHidden={panelOculto} importantForAccessibility={panelOculto ? "no-hide-descendants" : "auto"}>
                                        <View style={styles.cabeceraCercanos}>
                                                <Text style={styles.tituloCercanos}>
                                                        {ubicacion.coordenadas
                                                                ? "Lo que tenés cerca"
                                                                : "Lugares"}
                                                </Text>
                                                {cercanos.length > 2 && (
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                onPress={() =>
                                                                        router.setParams({ vista: "lista" })
                                                                }
                                                                style={
                                                                        styles.continuar
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.enlace
                                                                        }
                                                                >
                                                                        Ver lista →
                                                                </Text>
                                                        </Pressable>
                                                )}
                                        </View>
                                        <ScrollView
                                                style={styles.listaCercanos}
                                                keyboardShouldPersistTaps="handled"
                                        >
                                                {cercanos.slice(0, 2).map(({ lugar }) => (
                                                        <TarjetaLugar key={lugar.id} lugar={lugar} nombreCategoria={categorias.find(item => item.id === lugar.categoriaId)?.nombre ?? ''} onPress={() => seleccionar(lugar)} />
                                                ))}
                                                {!cercanos.length && (
                                                        <Text
                                                                style={
                                                                        styles.mensaje
                                                                }
                                                        >
                                                                No hay lugares
                                                                para esta
                                                                búsqueda o
                                                                categoría.
                                                        </Text>
                                                )}
                                        </ScrollView>
                                        </View>
                                </Animated.View>
                        )}
                </View>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                contenedor: { flex: 1, overflow: "hidden" },
                mapa: { flex: 1 },
                centrar: {
                        position: "absolute",
                        top: spacing.md,
                        right: spacing.md,
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                        elevation: 3,
                },
                panel: {
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.surface,
                        maxHeight: "75%",
                        borderTopLeftRadius: borderRadius.lg,
                        borderTopRightRadius: borderRadius.lg,
                },
                contenidoPermiso: {
                        padding: spacing.sm,
                        alignItems: "center",
                        gap: spacing.xs,
                },
                panelLugar: {
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        maxHeight: "70%",
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: borderRadius.lg,
                        borderTopRightRadius: borderRadius.lg,
                },
                marcador: { width: 38, height: 44, alignItems: "center", paddingTop: 3 },
                circuloMarcador: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
                puntaMarcador: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: "transparent", borderRightColor: "transparent", marginTop: -2 },
                panelCercanos: {
                        maxHeight: "60%",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: spacing.sm,
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: borderRadius.lg,
                        borderTopRightRadius: borderRadius.lg,
                },
                controlPanel: { height: 36, alignItems: "center", justifyContent: "center" },
                tiradorPanel: { width: 42, height: 5, borderRadius: 3, backgroundColor: colors.textSecondary },
                cabeceraCercanos: {
                        marginBottom: 8,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: spacing.sm,
                },
                listaCercanos: { maxHeight: 170, flexShrink: 1 },
                filaCercana: {
                        flexDirection: "row",
                        alignItems: "center",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                },
                lugarCercano: {
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        minHeight: 52,
                        gap: spacing.sm,
                        paddingHorizontal: spacing.sm,
                },
                nombreCercano: {
                        flex: 1,
                        color: colors.text,
                        fontSize: fontSize.caption,
                },
                distancia: {
                        color: colors.textSecondary,
                        fontSize: fontSize.caption,
                },
                tituloCercanos: { fontFamily: fuenteTitulo, fontSize: 15, lineHeight: 20, fontWeight: "700", color: colors.secondary, flexShrink: 1 },
                titulo: {
                        fontFamily: fuenteTitulo,
                        fontSize: fontSize.subtitle,
                        fontWeight: "700",
                        color: colors.secondary,
                },
                mensaje: {
                        fontSize: fontSize.body,
                        color: colors.textSecondary,
                        textAlign: "center",
                },
                permitir: {
                        minHeight: 44,
                        alignSelf: "stretch",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.primarySolid,
                        borderRadius: borderRadius.pill,
                        paddingHorizontal: spacing.md,
                },
                accion: {
                        color: colors.onPrimary,
                        fontSize: fontSize.body,
                        fontWeight: "600",
                },
                continuar: { minHeight: 44, justifyContent: "center" },
                enlace: {
                        color: colors.primary,
                        fontSize: fontSize.body,
                        textDecorationLine: "underline",
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
