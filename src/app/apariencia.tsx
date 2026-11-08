import { useState } from "react";
import {
        ActivityIndicator,
        Alert,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useAuth } from "../context/auth.context";
import { useTema } from "../context/tema.context";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { EstadoPantalla } from "../components/estado-pantalla";
import { colors as paleta } from "../styles/theme";
import { fuenteTitulo } from "../styles/inicio";

export default function AparienciaScreen() {
        const { usuario, status, actualizarTema } = useAuth();
        const { colors, oscuro } = useTema();
        const styles = crearEstilos(colors);
        const volver = useVolverPerfil();
        const [elegido, setElegido] = useState<"claro" | "oscuro">(
                oscuro ? "oscuro" : "claro",
        );
        const [guardando, setGuardando] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const cambiado = elegido !== usuario?.preferencias?.tema;

        async function guardar() {
                if (guardando) return;
                setGuardando(true);
                setError(null);
                try {
                        await actualizarTema(elegido);
                        Alert.alert(
                                "Apariencia actualizada",
                                "Guardamos el tema que elegiste.",
                                [{ text: "Aceptar", onPress: volver }],
                        );
                } catch (fallo) {
                        setError(
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No pudimos guardar la apariencia. Intentá de nuevo.",
                        );
                } finally {
                        setGuardando(false);
                }
        }

        if (status === "cargando") return <EstadoPantalla tipo="cargando" />;
        if (status !== "autenticado" || !usuario)
                return (
                        <EstadoPantalla
                                tipo="vacio"
                                titulo="Iniciá sesión"
                                mensaje="Necesitás una sesión activa para guardar la apariencia."
                                accion="Volver al perfil"
                                onPress={volver}
                        />
                );

        return (
                <SafeAreaView
                        style={styles.pantalla}
                        edges={["top", "bottom", "left", "right"]}
                >
                        <Stack.Screen options={{ headerShown: false }} />
                        <ScrollView contentContainerStyle={styles.contenido}>
                                <View style={styles.cabecera}>
                                        <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel="Volver al perfil"
                                                onPress={volver}
                                                disabled={guardando}
                                                style={styles.volver}
                                        >
                                                <Ionicons
                                                        name="chevron-back"
                                                        size={24}
                                                        color={colors.secondary}
                                                />
                                        </Pressable>
                                        <Image
                                                source={require("../../assets/images/logo-colon.png")}
                                                style={styles.logo}
                                                contentFit="contain"
                                        />
                                </View>
                                <Text style={styles.titulo}>Apariencia</Text>
                                <Text style={styles.descripcion}>
                                        Elegí cómo querés ver la aplicación.
                                </Text>
                                <View
                                        accessibilityRole="radiogroup"
                                        style={styles.opciones}
                                >
                                        {(["claro", "oscuro"] as const).map(
                                                (tema) => {
                                                        const esOscuro =
                                                                tema ===
                                                                "oscuro";
                                                        const seleccionado =
                                                                elegido ===
                                                                tema;
                                                        return (
                                                                <Pressable
                                                                        key={
                                                                                tema
                                                                        }
                                                                        accessibilityRole="radio"
                                                                        accessibilityState={{
                                                                                checked: seleccionado,
                                                                                disabled: guardando,
                                                                        }}
                                                                        accessibilityLabel={
                                                                                esOscuro
                                                                                        ? "Tema oscuro"
                                                                                        : "Tema claro"
                                                                        }
                                                                        disabled={
                                                                                guardando
                                                                        }
                                                                        onPress={() => {
                                                                                setElegido(
                                                                                        tema,
                                                                                );
                                                                                setError(
                                                                                        null,
                                                                                );
                                                                        }}
                                                                        style={[
                                                                                styles.opcion,
                                                                                seleccionado &&
                                                                                        styles.seleccionada,
                                                                        ]}
                                                                >
                                                                        <View
                                                                                style={[
                                                                                        styles.preview,
                                                                                        {
                                                                                                backgroundColor:
                                                                                                        esOscuro
                                                                                                                ? "#171C1D"
                                                                                                                : "#FBF7F0",
                                                                                        },
                                                                                ]}
                                                                        >
                                                                                <View
                                                                                        style={[
                                                                                                styles.previewBarra,
                                                                                                {
                                                                                                        backgroundColor:
                                                                                                                esOscuro
                                                                                                                        ? "#232B2D"
                                                                                                                        : "#FFFFFF",
                                                                                                },
                                                                                        ]}
                                                                                >
                                                                                        <Ionicons
                                                                                                name={
                                                                                                        esOscuro
                                                                                                                ? "moon-outline"
                                                                                                                : "sunny-outline"
                                                                                                }
                                                                                                size={
                                                                                                        25
                                                                                                }
                                                                                                color={
                                                                                                        esOscuro
                                                                                                                ? "#EFBE66"
                                                                                                                : "#E7A93B"
                                                                                                }
                                                                                        />
                                                                                </View>
                                                                                <View
                                                                                        style={[
                                                                                                styles.previewLinea,
                                                                                                {
                                                                                                        backgroundColor:
                                                                                                                esOscuro
                                                                                                                        ? "#B4BEBD"
                                                                                                                        : "#697174",
                                                                                                },
                                                                                        ]}
                                                                                />
                                                                                <View
                                                                                        style={[
                                                                                                styles.previewTarjeta,
                                                                                                {
                                                                                                        backgroundColor:
                                                                                                                esOscuro
                                                                                                                        ? "#232B2D"
                                                                                                                        : "#FFFFFF",
                                                                                                },
                                                                                        ]}
                                                                                />
                                                                                <View
                                                                                        style={
                                                                                                styles.previewBoton
                                                                                        }
                                                                                />
                                                                        </View>
                                                                        <View
                                                                                style={
                                                                                        styles.opcionPie
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.nombre
                                                                                        }
                                                                                >
                                                                                        {esOscuro
                                                                                                ? "Tema oscuro"
                                                                                                : "Tema claro"}
                                                                                </Text>
                                                                                <Ionicons
                                                                                        name={
                                                                                                seleccionado
                                                                                                        ? "radio-button-on"
                                                                                                        : "radio-button-off"
                                                                                        }
                                                                                        size={
                                                                                                22
                                                                                        }
                                                                                        color={
                                                                                                seleccionado
                                                                                                        ? colors.primary
                                                                                                        : colors.textSecondary
                                                                                        }
                                                                                />
                                                                        </View>
                                                                </Pressable>
                                                        );
                                                },
                                        )}
                                </View>
                                <Text style={styles.ayuda}>
                                        La elección se guarda en tu cuenta y
                                        queda disponible en este dispositivo sin
                                        conexión.
                                </Text>
                                {error && (
                                        <Text
                                                accessibilityRole="alert"
                                                accessibilityLiveRegion="polite"
                                                style={styles.error}
                                        >
                                                {error}
                                        </Text>
                                )}
                                <Pressable
                                        accessibilityRole="button"
                                        disabled={guardando || !cambiado}
                                        onPress={() => void guardar()}
                                        style={[
                                                styles.guardar,
                                                (guardando || !cambiado) &&
                                                        styles.deshabilitado,
                                        ]}
                                >
                                        {guardando ? (
                                                <ActivityIndicator
                                                        color={colors.onPrimary}
                                                />
                                        ) : (
                                                <Text
                                                        style={
                                                                styles.guardarTexto
                                                        }
                                                >
                                                        Guardar apariencia
                                                </Text>
                                        )}
                                </Pressable>
                        </ScrollView>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paleta) =>
        StyleSheet.create({
                pantalla: { flex: 1, backgroundColor: colors.background },
                contenido: {
                        paddingHorizontal: 18,
                        paddingTop: 8,
                        paddingBottom: 32,
                },
                cabecera: {
                        minHeight: 64,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                },
                volver: {
                        position: "absolute",
                        left: 0,
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                },
                logo: { width: 90, height: 48 },
                titulo: {
                        fontFamily: fuenteTitulo,
                        fontSize: 24,
                        fontWeight: "700",
                        color: colors.secondary,
                },
                descripcion: {
                        fontSize: 14,
                        lineHeight: 21,
                        color: colors.textSecondary,
                        marginTop: 8,
                        marginBottom: 24,
                },
                opciones: { flexDirection: "row", gap: 12 },
                opcion: {
                        flex: 1,
                        minWidth: 0,
                        borderWidth: 2,
                        borderColor: colors.border,
                        borderRadius: 16,
                        padding: 10,
                },
                seleccionada: { borderColor: colors.primary },
                preview: {
                        height: 175,
                        borderRadius: 10,
                        padding: 12,
                        gap: 12,
                },
                previewBarra: {
                        height: 38,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                },
                previewLinea: { width: "60%", height: 6, borderRadius: 3 },
                previewTarjeta: { height: 35, borderRadius: 6 },
                previewBoton: {
                        height: 20,
                        backgroundColor: "#F4604D",
                        borderRadius: 10,
                },
                opcionPie: {
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                        marginTop: 12,
                },
                nombre: { fontSize: 14, color: colors.text, fontWeight: "600" },
                ayuda: {
                        fontSize: 12,
                        lineHeight: 18,
                        color: colors.textSecondary,
                        marginTop: 20,
                },
                error: {
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.error,
                        marginTop: 16,
                },
                guardar: {
                        minHeight: 48,
                        backgroundColor: colors.primarySolid,
                        borderRadius: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 28,
                },
                guardarTexto: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.onPrimary,
                },
                deshabilitado: { opacity: 0.5 },
        });
