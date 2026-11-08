import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { BotonVolver } from "../components/boton-volver";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { useTema } from "../context/tema.context";
import { fuenteTitulo } from "../styles/inicio";
import { tipografia } from "../styles/tipografia";
import { colors as paleta } from "../styles/theme";

const preguntas = [
        {
                pregunta: "Cómo guardo un lugar en mis favoritos?",
                respuesta: "Iniciá sesión y tocá el corazón del lugar que te guste. Después podés encontrarlo en Perfil, en Mis favoritos. Para quitarlo, tocá el corazón otra vez.",
        },
        {
                pregunta: "Dónde veo los eventos que guardé?",
                respuesta: "Entrá a Perfil y elegí Eventos guardados. Para agregar uno, abrí su detalle desde Agenda y tocá Agregar a mi agenda.",
        },
        {
                pregunta: "Puedo usar la app sin conexión?",
                respuesta: "Podés consultar la información que ya se descargó en tu teléfono. Los cambios pendientes de tus favoritos y eventos guardados se sincronizan cuando volvés a tener conexión.",
        },
        {
                pregunta: "Cómo cambio mis preferencias y el tema de la app?",
                respuesta: "Desde Perfil, entrá a Mis preferencias para elegir tus categorías y configurar la preferencia de avisos de proximidad. En Apariencia podés elegir el tema claro u oscuro.",
        },
];

export default function AyudaSoporteScreen() {
        const { colorsInicio: colors } = useTema();
        const styles = crearEstilos(colors);
        const volver = useVolverPerfil();
        const [abierta, setAbierta] = useState<number | null>(null);
        return (
                <SafeAreaView
                        style={styles.container}
                        edges={["top", "left", "right"]}
                >
                        <Stack.Screen options={{ headerShown: false }} />
                        <View style={styles.encabezado}>
                                <View style={styles.cabecera}>
                                        <BotonVolver
                                                style={styles.volver}
                                                onPress={volver}
                                        />
                                        <Image
                                                source={require("../../assets/images/logo-colon.png")}
                                                style={styles.logo}
                                                contentFit="contain"
                                                accessibilityLabel="Colón, Entre Ríos"
                                        />
                                </View>
                                <Text style={styles.titulo}>
                                        Ayuda y soporte
                                </Text>
                                <Text style={styles.descripcion}>
                                        Resolvé tus dudas sobre la app
                                </Text>
                        </View>
                        <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.contenido}
                        >
                                <Text style={styles.seccion}>
                                        Preguntas frecuentes
                                </Text>
                                {preguntas.map((item, indice) => (
                                        <View
                                                key={item.pregunta}
                                                style={styles.fila}
                                        >
                                                <Pressable
                                                        accessibilityRole="button"
                                                        accessibilityState={{
                                                                expanded:
                                                                        abierta ===
                                                                        indice,
                                                        }}
                                                        onPress={() =>
                                                                setAbierta(
                                                                        abierta ===
                                                                                indice
                                                                                ? null
                                                                                : indice,
                                                                )
                                                        }
                                                        style={styles.pregunta}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.preguntaTexto
                                                                }
                                                        >
                                                                {item.pregunta}
                                                        </Text>
                                                        <Ionicons
                                                                name={
                                                                        abierta ===
                                                                        indice
                                                                                ? "chevron-up"
                                                                                : "chevron-down"
                                                                }
                                                                size={19}
                                                                color={
                                                                        colors.blueText
                                                                }
                                                        />
                                                </Pressable>
                                                {abierta === indice && (
                                                        <Text
                                                                style={
                                                                        styles.respuesta
                                                                }
                                                        >
                                                                {item.respuesta}
                                                        </Text>
                                                )}
                                        </View>
                                ))}
                        </ScrollView>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paleta) =>
        StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.background },
                encabezado: {
                        flexShrink: 0,
                        paddingHorizontal: 18,
                        paddingTop: 8,
                        backgroundColor: colors.background,
                },
                cabecera: {
                        minHeight: 64,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                },
                volver: { position: "absolute", left: 0 },
                logo: { width: 90, height: 48 },
                titulo: {
                        ...tipografia.titulo,
                        fontFamily: fuenteTitulo,
                        color: colors.blueText,
                },
                descripcion: {
                        ...tipografia.texto,
                        color: colors.greenText,
                        marginTop: 4,
                        marginBottom: 18,
                },
                scroll: { flex: 1 },
                contenido: { paddingHorizontal: 18, paddingBottom: 32 },
                seccion: {
                        ...tipografia.seccion,
                        fontFamily: fuenteTitulo,
                        color: colors.greenText,
                        marginBottom: 8,
                },
                fila: {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                },
                pregunta: {
                        minHeight: 60,
                        paddingVertical: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                },
                preguntaTexto: {
                        ...tipografia.opcion,
                        flex: 1,
                        color: colors.blueText,
                },
                respuesta: {
                        ...tipografia.texto,
                        color: colors.textSecondary,
                        paddingBottom: 18,
                },
        });
