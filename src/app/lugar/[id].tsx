import { useState } from "react";
import { colorsInicio as paletaColors, fuenteTitulo } from "../../styles/inicio";
import { Image } from "expo-image";
import { BotonVolver } from "../../components/boton-volver";
import { useTema } from "../../context/tema.context";
import { BotonLugarFavorito } from "../../components/boton-lugar-favorito";
import { EstadoPantalla } from "../../components/estado-pantalla";
import { Audioguia } from "../../components/audioguia";
import { ImagenPersistente } from "../../components/imagen-persistente";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { useDetallesLugares } from "../../hooks/use-detalles-lugares";
import { useCatalogo } from "../../hooks/use-catalogo";
import { EstadoCatalogo } from "../../components/estado-catalogo";
import {
        borderRadius,
        fontSize,
        spacing,
} from "../../styles/theme";

export default function DetalleLugarScreen() {
        const { colors, styles, coloresBoton } = useEstilos();

        const insets = useSafeAreaInsets();
        const { width } = useWindowDimensions();
        const altoImagen = Math.min(width * 0.72, 320);
        const [altoVisible, setAltoVisible] = useState(0);
        const [altoTitulo, setAltoTitulo] = useState(0);
        const { id } = useLocalSearchParams<{ id: string }>();

        const { datos, sinConexion, cargando, error, reintentar } =
                useCatalogo();
        const detalle = useDetallesLugares(
                typeof id === "string" ? [id] : [],
                datos?.lugares ?? [],
        );
        const lugar = detalle.lugares[0] ?? null;
        const categorias = datos?.categorias ?? [];

        if ((cargando || detalle.cargando) && !lugar)
                return (
                        <EstadoPantalla
                                tipo="cargando"
                                titulo="Cargando lugar..."
                        />
                );
        if (datos === null && !lugar)
                return (
                        <EstadoPantalla
                                tipo={sinConexion ? "sinConexion" : "error"}
                                onPress={() => {
                                        void reintentar();
                                }}
                        />
                );
        if (!lugar && detalle.error)
                return (
                        <EstadoPantalla
                                tipo={sinConexion ? "sinConexion" : "error"}
                                titulo="No pudimos cargar el lugar"
                                onPress={detalle.reintentar}
                        />
                );
        if (!lugar || !lugar.activo)
                return (
                        <EstadoPantalla
                                tipo="vacio"
                                titulo="Lugar no disponible"
                                mensaje="Este lugar ya no está disponible en el catálogo."
                                accion="Explorar lugares"
                                onPress={() =>
                                        router.replace("/(tabs)/explore")
                                }
                        />
                );

        const categoria = categorias.find(
                (item) => item.id === lugar.categoriaId,
        );

        return (
                <>
                        <Stack.Screen
                                options={{
                                        title: lugar.nombre,
                                        headerShown: false,
                                }}
                        />

                        <View style={styles.container}>
                                <View style={[styles.header, { height: insets.top + 64, paddingTop: insets.top }]}>
                                        <BotonVolver style={styles.volverHeader} onPress={() => router.canGoBack() ? router.back() : router.navigate("/(tabs)/explore")} />
                                        <Image source={require("../../../assets/images/logo-colon.png")} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
                                </View>

                                <EstadoCatalogo
                                        sinConexion={sinConexion}
                                        error={error !== null}
                                />
                                <ScrollView
                                        contentContainerStyle={
                                                styles.contenidoScroll
                                        }
                                        showsVerticalScrollIndicator={false}
                                        stickyHeaderIndices={[1]}
                                        onLayout={evento => setAltoVisible(evento.nativeEvent.layout.height)}
                                >
                                        <View style={styles.imagenContainer}>
                                                {lugar.imagenes.length > 0 ? (
                                                        <ImagenPersistente
                                                                url={
                                                                        lugar
                                                                                .imagenes[0]
                                                                }
                                                                style={
                                                                        [styles.imagen, { height: altoImagen }]
                                                                }
                                                                contentFit="cover"
                                                        />
                                                ) : (
                                                        <View
                                                                style={
                                                                        [styles.imagenVacia, { height: altoImagen }]
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="image-outline"
                                                                        size={
                                                                                52
                                                                        }
                                                                        color={
                                                                                colors.textSecondary
                                                                        }
                                                                />

                                                                <Text
                                                                        style={
                                                                                styles.imagenVaciaTexto
                                                                        }
                                                                >
                                                                        Imagen
                                                                        no
                                                                        disponible
                                                                </Text>
                                                        </View>
                                                )}
                                        </View>

                                        <View style={styles.contenido} onLayout={evento => setAltoTitulo(evento.nativeEvent.layout.height)}>
                                                <View style={styles.filaNombre}>
                                                        <Text style={[styles.nombre, { flex: 1 }]} numberOfLines={2}>{lugar.nombre}</Text>
                                                </View>
                                                {categoria && (
                                                        <View style={styles.categoria}>
                                                                <Text style={styles.categoriaTexto}>{categoria.nombre}</Text>
                                                        </View>
                                                )}

                                                <View style={styles.ubicacion}>
                                                        <Ionicons
                                                                name="location-outline"
                                                                size={18}
                                                                color={
                                                                        colors.secondary
                                                                }
                                                        />

                                                        <Text
                                                                style={
                                                                        styles.ubicacionTexto
                                                                }
                                                        >
                                                                {
                                                                        lugar.direccion
                                                                }
                                                        </Text>
                                                </View>

                                                <View style={[styles.separador, { marginBottom: 0 }]} />
                                                <View style={styles.favoritoFicha}>
                                                        <BotonLugarFavorito id={lugar.id} />
                                                </View>
                                        </View>
                                        <View style={[styles.cuerpoLugar, { minHeight: Math.max(0, altoVisible - altoTitulo) }]}>
                                                <Text
                                                        style={
                                                                styles.seccionTitulo
                                                        }
                                                >
                                                        Sobre el lugar
                                                </Text>

                                                <Text
                                                        style={
                                                                styles.descripcion
                                                        }
                                                >
                                                        {lugar.descripcion}
                                                </Text>

                                                {lugar.audioguia ? (
                                                        <Audioguia
                                                                key={
                                                                        lugar
                                                                                .audioguia
                                                                                .url
                                                                }
                                                                url={
                                                                        lugar
                                                                                .audioguia
                                                                                .url
                                                                }
                                                        />
                                                ) : (
                                                        <Text
                                                                style={
                                                                        styles.infoTexto
                                                                }
                                                        >
                                                                Este lugar no
                                                                tiene audioguía
                                                                disponible.
                                                        </Text>
                                                )}

                                                <View style={styles.info}>
                                                        <View
                                                                style={
                                                                        styles.infoItem
                                                                }
                                                        >
                                                                <View
                                                                        style={
                                                                                styles.infoIcono
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="time-outline"
                                                                                size={
                                                                                        21
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                </View>

                                                                <View
                                                                        style={
                                                                                styles.infoTextoContainer
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.infoTitulo
                                                                                }
                                                                        >
                                                                                Horarios
                                                                        </Text>

                                                                        <Text
                                                                                style={
                                                                                        styles.infoTexto
                                                                                }
                                                                        >
                                                                                {lugar
                                                                                        .horarios
                                                                                        .length >
                                                                                0
                                                                                        ? lugar.horarios
                                                                                                  .map(
                                                                                                          (
                                                                                                                  horario,
                                                                                                          ) =>
                                                                                                                  `${["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][horario.dia]}: ${horario.abre} a ${horario.cierra}`,
                                                                                                  )
                                                                                                  .join(
                                                                                                          "\n",
                                                                                                  )
                                                                                        : "Horarios no disponibles"}
                                                                        </Text>
                                                                </View>
                                                        </View>

                                                        <View
                                                                style={
                                                                        styles.infoItem
                                                                }
                                                        >
                                                                <View
                                                                        style={
                                                                                styles.infoIcono
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="accessibility-outline"
                                                                                size={
                                                                                        21
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                </View>

                                                                <View
                                                                        style={
                                                                                styles.infoTextoContainer
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.infoTitulo
                                                                                }
                                                                        >
                                                                                Accesibilidad
                                                                        </Text>

                                                                        <Text
                                                                                style={
                                                                                        styles.infoTexto
                                                                                }
                                                                        >
                                                                                {lugar.accesible
                                                                                        ? "Accesible"
                                                                                        : "No especificada"}
                                                                        </Text>
                                                                </View>
                                                        </View>

                                                        {
                                                                <View
                                                                        style={
                                                                                styles.infoItem
                                                                        }
                                                                >
                                                                        <View
                                                                                style={
                                                                                        styles.infoIcono
                                                                                }
                                                                        >
                                                                                <Ionicons
                                                                                        name="call-outline"
                                                                                        size={
                                                                                                21
                                                                                        }
                                                                                        color={
                                                                                                colors.secondary
                                                                                        }
                                                                                />
                                                                        </View>

                                                                        <View
                                                                                style={
                                                                                        styles.infoTextoContainer
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.infoTitulo
                                                                                        }
                                                                                >
                                                                                        Teléfono
                                                                                </Text>

                                                                                <Text
                                                                                        style={
                                                                                                styles.infoTexto
                                                                                        }
                                                                                >
                                                                                        {lugar.telefono ||
                                                                                                "Teléfono no disponible"}
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                        }

                                                        <View
                                                                style={
                                                                        styles.infoItem
                                                                }
                                                        >
                                                                <View
                                                                        style={
                                                                                styles.infoIcono
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="globe-outline"
                                                                                size={
                                                                                        21
                                                                                }
                                                                                color={
                                                                                        colors.secondary
                                                                                }
                                                                        />
                                                                </View>

                                                                <View
                                                                        style={
                                                                                styles.infoTextoContainer
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.infoTitulo
                                                                                }
                                                                        >
                                                                                Sitio
                                                                                web
                                                                        </Text>

                                                                        <Text
                                                                                style={
                                                                                        styles.infoTexto
                                                                                }
                                                                        >
                                                                                {lugar.sitioWeb ||
                                                                                        "Sitio web no disponible"}
                                                                        </Text>
                                                                </View>
                                                        </View>

                                                        {lugar.precioEntrada !==
                                                                null && (
                                                                <View
                                                                        style={
                                                                                styles.infoItem
                                                                        }
                                                                >
                                                                        <View
                                                                                style={
                                                                                        styles.infoIcono
                                                                                }
                                                                        >
                                                                                <Ionicons
                                                                                        name="ticket-outline"
                                                                                        size={
                                                                                                21
                                                                                        }
                                                                                        color={
                                                                                                colors.secondary
                                                                                        }
                                                                                />
                                                                        </View>

                                                                        <View
                                                                                style={
                                                                                        styles.infoTextoContainer
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.infoTitulo
                                                                                        }
                                                                                >
                                                                                        Entrada
                                                                                </Text>

                                                                                <Text
                                                                                        style={
                                                                                                styles.infoTexto
                                                                                        }
                                                                                >
                                                                                        {lugar.precioEntrada ===
                                                                                        0
                                                                                                ? "Gratis"
                                                                                                : `$${lugar.precioEntrada}`}
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                        )}
                                                </View>

                                                <View style={styles.visitaCard}>
                                                        <View
                                                                style={
                                                                        styles.visitaEncabezado
                                                                }
                                                        >
                                                                <View
                                                                        style={
                                                                                styles.visitaIcono
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="location-outline"
                                                                                size={
                                                                                        24
                                                                                }
                                                                                color={
                                                                                        colors.onPrimary
                                                                                }
                                                                        />
                                                                </View>

                                                                <View
                                                                        style={
                                                                                styles.visitaTextoContainer
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.visitaTitulo
                                                                                }
                                                                        >
                                                                                ¿Ya
                                                                                visitaste
                                                                                este
                                                                                lugar?
                                                                        </Text>
                                                                        <Text
                                                                                style={
                                                                                        styles.visitaDescripcion
                                                                                }
                                                                        >
                                                                                Registrá
                                                                                tu
                                                                                visita
                                                                                y
                                                                                sumala
                                                                                a
                                                                                tu
                                                                                recorrido.
                                                                        </Text>
                                                                </View>
                                                        </View>

                                                        <Pressable
                                                                accessibilityRole="button"
                                                                accessibilityLabel={`Registrar una visita a ${lugar.nombre}`}
                                                                onPress={() => router.push({ pathname: "/(tabs)/recorrido/recuerdo-visita", params: { lugarId: lugar.id } })}
                                                                style={({ pressed }) => [styles.registrarVisita, { backgroundColor: coloresBoton.primarySolid, opacity: pressed ? 0.8 : 1 }]}
                                                        >
                                                                <Ionicons name="add-circle-outline" size={20} color={coloresBoton.onPrimary} />
                                                                <Text style={[styles.registrarVisitaTexto, { color: coloresBoton.onPrimary }]}>Registrar visita</Text>
                                                        </Pressable>
                                                </View>
                                        </View>
                                </ScrollView>
                        </View>
                </>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                container: {
                        flex: 1,
                        backgroundColor: colors.background,
                },

                header: { alignItems: "center", justifyContent: "center", paddingHorizontal: 70, backgroundColor: colors.background },
                volverHeader: { position: "absolute", left: 18, bottom: 10 },
                logo: { width: 90, height: 48 },
                filaNombre: { flexDirection: "row", alignItems: "center", paddingRight: 56 },
                favoritoFicha: { position: "absolute", top: 2, right: 2, width: 44, height: 44, zIndex: 1 },

                contenidoScroll: {
                        paddingBottom: spacing.xl,
                        maxWidth: 900,
                        width: "100%",
                        alignSelf: "center",
                },

                imagenContainer: {
                        marginBottom: -24,
                        overflow: "hidden",
                },

                imagen: {
                        width: "100%",
                        height: 230,
                },

                imagenVacia: {
                        width: "100%",
                        height: 230,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.secondaryLight,
                        gap: spacing.sm,
                },

                imagenVaciaTexto: {
                        fontSize: fontSize.caption,
                        color: colors.textSecondary,
                },

                contenido: {
                        position: "relative",
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        padding: 20,
                        paddingBottom: 0,
                        backgroundColor: colors.background,
                },
                cuerpoLugar: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: colors.background },

                categoria: {
                        marginTop: 10,
                        alignSelf: "flex-start",
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: borderRadius.pill,
                        backgroundColor: colors.greenLight,
                },

                categoriaTexto: {
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.secondary,
                },

                nombre: {
                        marginTop: spacing.sm,
                        fontFamily: fuenteTitulo,
                        fontSize: 28,
                        lineHeight: 34,
                        fontWeight: "700",
                        color: colors.secondary,
                },

                ubicacion: {
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: spacing.xs,
                        marginTop: spacing.sm,
                },

                ubicacionTexto: {
                        flex: 1,
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.blueText,
                },

                separador: {
                        height: 1,
                        backgroundColor: colors.border,
                        marginVertical: spacing.lg,
                },

                seccionTitulo: {
                        fontSize: 19,
                        fontWeight: "700",
                        color: colors.secondary,
                        marginBottom: spacing.sm,
                },

                descripcion: {
                        fontSize: 15,
                        lineHeight: 24,
                        color: colors.textSecondary,
                },

                info: {
                        marginTop: spacing.lg,
                        gap: spacing.sm,
                },

                infoItem: {
                        flexDirection: "row",
                        alignItems: "center",
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                },

                infoIcono: {
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: spacing.sm,
                },

                infoTextoContainer: {
                        flex: 1,
                },

                infoTitulo: {
                        fontSize: fontSize.caption,
                        fontWeight: "700",
                        color: colors.text,
                },

                infoTexto: {
                        marginTop: 2,
                        fontSize: fontSize.caption,
                        color: colors.textSecondary,
                },

                registrarVisita: { minHeight: 48, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
                registrarVisitaTexto: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
                visitaCard: {
                        marginTop: spacing.lg,
                        gap: spacing.sm,
                        padding: spacing.md,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.primaryLight,
                },

                visitaEncabezado: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                },

                visitaIcono: {
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.primarySolid,
                },

                visitaTextoContainer: { flex: 1 },

                visitaTitulo: {
                        fontSize: fontSize.body,
                        fontWeight: "700",
                        color: colors.primary,
                },

                visitaDescripcion: {
                        marginTop: 2,
                        fontSize: fontSize.caption,
                        color: colors.textSecondary,
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors), coloresBoton: tema.colorsInicio };
}
