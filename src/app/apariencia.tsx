import { BotonVolver } from "../components/boton-volver";
import { fuenteTitulo } from "../styles/inicio";
import { tipografia } from "../styles/tipografia";
import { useMemo, useState } from "react";
import {
        ActivityIndicator,
        Modal,
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

export default function AparienciaScreen() {
        const { usuario, status, actualizarTema } = useAuth();
        const { colors, colorsInicio, oscuro, cambiarTema } = useTema();
        const temaColores = colorsInicio ?? colors;
        const styles = useMemo(
                () => crearEstilos(temaColores, oscuro),
                [temaColores, oscuro],
        );
        const volver = useVolverPerfil();
        const [elegido, setElegido] = useState<"claro" | "oscuro">(
                oscuro ? "oscuro" : "claro",
        );
        const [guardando, setGuardando] = useState(false);
        const [mostrarExito, setMostrarExito] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const temaActual: "claro" | "oscuro" =
                usuario?.preferencias?.tema &&
                usuario.preferencias.tema !== "sistema"
                        ? usuario.preferencias.tema
                        : oscuro
                          ? "oscuro"
                          : "claro";
        const cambiado = elegido !== temaActual;

        async function guardar() {
                if (guardando) return;
                setGuardando(true);
                setError(null);
                try {
                        if (status === "autenticado" && usuario) {
                                try {
                                        await actualizarTema(elegido);
                                } catch (falloApi) {
                                        console.warn(
                                                "No se pudo sincronizar el tema con la cuenta:",
                                                falloApi,
                                        );
                                }
                        }
                        await cambiarTema(elegido);
                        setMostrarExito(true);
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

        return (
                <SafeAreaView
                        style={styles.pantalla}
                        edges={["top", "bottom", "left", "right"]}
                >
                        <Stack.Screen options={{ headerShown: false }} />
                        <View style={styles.encabezadoFijo}>
                                <View style={styles.cabecera}>
                                        <BotonVolver
                                                style={styles.volver}
                                                onPress={volver}
                                        />
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
                        </View>
                        <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.contenido}
                        >
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
                                        {status === "autenticado" && usuario
                                                ? "La elección se guarda en tu cuenta y queda disponible en este dispositivo sin conexión."
                                                : "La elección se guarda en este dispositivo y podés cambiarla cuando quieras."}
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

                        <Modal
                                visible={mostrarExito}
                                transparent
                                animationType="fade"
                                onRequestClose={volver}
                        >
                                <View style={styles.modalFondo}>
                                        <Pressable
                                                style={StyleSheet.absoluteFillObject}
                                                accessibilityRole="button"
                                                accessibilityLabel="Cerrar aviso"
                                                onPress={volver}
                                        />
                                        <View
                                                style={styles.modalCard}
                                                accessibilityViewIsModal
                                        >
                                                <View style={styles.modalCabecera}>
                                                        <Text style={styles.modalTitulo}>
                                                                Apariencia actualizada
                                                        </Text>
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                accessibilityLabel="Cerrar"
                                                                hitSlop={8}
                                                                onPress={volver}
                                                                style={styles.modalCerrar}
                                                        >
                                                                <Ionicons
                                                                        name="close"
                                                                        size={24}
                                                                        color={colors.secondary}
                                                                />
                                                        </Pressable>
                                                </View>

                                                <Text style={styles.modalMensaje}>
                                                        Guardamos el tema que elegiste.
                                                </Text>

                                                <Pressable
                                                        style={styles.btnAlertaNaranja}
                                                        onPress={volver}
                                                        accessibilityRole="button"
                                                        accessibilityLabel="Aceptar"
                                                >
                                                        <Text style={styles.btnAlertaNaranjaTexto}>
                                                                Aceptar
                                                        </Text>
                                                </Pressable>
                                        </View>
                                </View>
                        </Modal>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paleta, oscuro: boolean) =>
        StyleSheet.create({
                scroll: { flex: 1 },
                encabezadoFijo: {
                        flexShrink: 0,
                        backgroundColor: colors.background,
                        paddingHorizontal: 18,
                        paddingTop: 8,
                },
                pantalla: { flex: 1, backgroundColor: colors.background },
                contenido: {
                        paddingHorizontal: 18,
                        paddingTop: 0,
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
                },
                logo: { width: 90, height: 48 },
                titulo: {
                        ...tipografia.titulo,
                        fontFamily: fuenteTitulo,
                        color: colors.blueText,
                },
                descripcion: {
                        ...tipografia.texto,
                        color: colors.greenText,
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
                modalFondo: {
                        flex: 1,
                        backgroundColor: oscuro
                                ? "rgba(0, 0, 0, 0.75)"
                                : "rgba(7, 59, 83, 0.45)",
                        justifyContent: "center",
                        padding: 20,
                },
                modalCard: {
                        width: "100%",
                        maxWidth: 440,
                        alignSelf: "center",
                        backgroundColor: oscuro
                                ? colors.surface
                                : colors.background,
                        borderRadius: 24,
                        padding: 22,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: oscuro ? "#000000" : colors.secondary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: oscuro ? 0.4 : 0.15,
                        shadowRadius: 12,
                        elevation: 8,
                },
                modalCabecera: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                },
                modalTitulo: {
                        flex: 1,
                        fontFamily: fuenteTitulo,
                        fontSize: 21,
                        fontWeight: "700",
                        color: colors.secondary,
                },
                modalCerrar: {
                        width: 40,
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center",
                },
                modalMensaje: {
                        fontSize: 15,
                        lineHeight: 22,
                        color: colors.textSecondary,
                        marginBottom: 22,
                },
                btnAlertaNaranja: {
                        backgroundColor: colors.primarySolid,
                        minHeight: 50,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 18,
                },
                btnAlertaNaranjaTexto: {
                        color: colors.onPrimary,
                        fontSize: 16,
                        fontWeight: "700",
                },
        });
