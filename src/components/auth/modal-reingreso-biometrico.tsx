import { useTema } from "../../context/tema.context";
import React, { useCallback, useEffect, useState } from "react";
import {
        ActivityIndicator,
        Modal,
        StyleSheet,
        Text,
        TouchableOpacity,
        TouchableWithoutFeedback,
        View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "../../context/auth.context";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../../styles/theme";

export function ModalReingresoBiometrico() {
        const { colors, styles } = useEstilos();

        const router = useRouter();
        const { status, usuario, desbloquearConBiometria, cerrarSesion } =
                useAuth();
        const [procesando, setProcesando] = useState(false);
        const [errorBiometria, setErrorBiometria] = useState(false);

        const visible = status === "biometria_requerida";

        const intentarDesbloqueo = useCallback(async () => {
                try {
                        setProcesando(true);
                        setErrorBiometria(false);
                        const exito = await desbloquearConBiometria();
                        if (!exito) {
                                setErrorBiometria(true);
                        }
                } catch {
                        setErrorBiometria(true);
                } finally {
                        setProcesando(false);
                }
        }, [desbloquearConBiometria]);

        useEffect(() => {
                if (visible) {
                        // Disparo automático de biometría al detectar sesión protegida
                        const timer = setTimeout(() => {
                                void intentarDesbloqueo();
                        }, 350);
                        return () => clearTimeout(timer);
                } else {
                        setErrorBiometria(false);
                        setProcesando(false);
                }
        }, [visible, intentarDesbloqueo]);

        async function handleIngresarConPassword() {
                await cerrarSesion();
                router.push("/(auth)/login" as any);
        }

        async function handleContinuarVisitante() {
                await cerrarSesion();
        }

        if (!visible) return null;

        const nombreUsuario = usuario?.nombre || "turista";

        return (
                <Modal
                        animationType="fade"
                        transparent={true}
                        visible={visible}
                >
                        <View style={styles.overlay}>
                                <TouchableWithoutFeedback>
                                        <View style={styles.card}>
                                                <View style={styles.iconCircle}>
                                                        <Ionicons
                                                                name="finger-print-outline"
                                                                size={44}
                                                                color={
                                                                        colors.primary
                                                                }
                                                        />
                                                </View>

                                                <Text style={styles.title}>
                                                        ¡Hola de nuevo,{" "}
                                                        {nombreUsuario}!
                                                </Text>
                                                <Text style={styles.subtitle}>
                                                        Confirmá tu huella
                                                        dactilar o rostro para
                                                        acceder a tus datos y
                                                        favoritos.
                                                </Text>

                                                {errorBiometria ? (
                                                        <View
                                                                style={
                                                                        styles.errorBanner
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="alert-circle-outline"
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.error
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.errorText
                                                                        }
                                                                >
                                                                        No se
                                                                        pudo
                                                                        verificar
                                                                        tu
                                                                        identidad.
                                                                </Text>
                                                        </View>
                                                ) : null}

                                                <TouchableOpacity
                                                        style={
                                                                styles.btnPrimary
                                                        }
                                                        onPress={
                                                                intentarDesbloqueo
                                                        }
                                                        disabled={procesando}
                                                        activeOpacity={0.85}
                                                >
                                                        {procesando ? (
                                                                <ActivityIndicator
                                                                        color={
                                                                                colors.onPrimary
                                                                        }
                                                                />
                                                        ) : (
                                                                <>
                                                                        <Ionicons
                                                                                name="scan-outline"
                                                                                size={
                                                                                        20
                                                                                }
                                                                                color={
                                                                                        colors.onPrimary
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.btnPrimaryText
                                                                                }
                                                                        >
                                                                                Reintentar
                                                                                con
                                                                                huella
                                                                                /
                                                                                rostro
                                                                        </Text>
                                                                </>
                                                        )}
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={
                                                                styles.btnSecondary
                                                        }
                                                        onPress={
                                                                handleIngresarConPassword
                                                        }
                                                        activeOpacity={0.8}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.btnSecondaryText
                                                                }
                                                        >
                                                                Ingresar con
                                                                contraseña
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={styles.btnGhost}
                                                        onPress={
                                                                handleContinuarVisitante
                                                        }
                                                        activeOpacity={0.7}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.btnGhostText
                                                                }
                                                        >
                                                                Continuar como
                                                                visitante
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                </TouchableWithoutFeedback>
                        </View>
                </Modal>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                overlay: {
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: spacing.lg,
                },
                card: {
                        width: "100%",
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.xl,
                        alignItems: "center",
                        elevation: 8,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                },
                iconCircle: {
                        width: 80,
                        height: 80,
                        borderRadius: borderRadius.pill,
                        backgroundColor: colors.primaryLight,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: spacing.md,
                },
                title: {
                        fontSize: fontSize.subtitle,
                        fontWeight: "bold",
                        color: colors.secondary,
                        textAlign: "center",
                        marginBottom: spacing.xs,
                },
                subtitle: {
                        fontSize: fontSize.body,
                        color: colors.textSecondary,
                        textAlign: "center",
                        lineHeight: 22,
                        marginBottom: spacing.lg,
                        paddingHorizontal: spacing.xs,
                },
                errorBanner: {
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primaryLight,
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.md,
                        gap: spacing.xs,
                },
                errorText: {
                        color: colors.error,
                        fontSize: fontSize.caption,
                },
                btnPrimary: {
                        flexDirection: "row",
                        gap: spacing.xs,
                        backgroundColor: colors.primarySolid,
                        height: 50,
                        width: "100%",
                        borderRadius: borderRadius.pill,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: spacing.sm,
                },
                btnPrimaryText: {
                        color: colors.onPrimary,
                        fontSize: fontSize.body,
                        fontWeight: "bold",
                },
                btnSecondary: {
                        height: 48,
                        width: "100%",
                        borderRadius: borderRadius.pill,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: spacing.sm,
                        backgroundColor: colors.surface,
                },
                btnSecondaryText: {
                        color: colors.primary,
                        fontSize: fontSize.body,
                        fontWeight: "600",
                },
                btnGhost: {
                        paddingVertical: spacing.sm,
                        alignItems: "center",
                },
                btnGhostText: {
                        color: colors.textSecondary,
                        fontSize: fontSize.caption,
                        textDecorationLine: "underline",
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
