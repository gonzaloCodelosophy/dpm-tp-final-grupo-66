import { useTema } from "../../context/tema.context";
import React, { useState } from "react";
import {
        ActivityIndicator,
        Image,
        KeyboardAvoidingView,
        Modal,
        Platform,
        ScrollView,
        StyleSheet,
        Text,
        TextInput,
        TouchableOpacity,
        TouchableWithoutFeedback,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/auth.context";
import { loginSchema, LoginFormData } from "../../schemas/auth.schema";
import { FalloDatos } from "../../services/errores";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../../styles/theme";
import { fuenteTitulo } from "../../styles/inicio";

export default function LoginScreen() {
        const { colors, styles } = useEstilos();

        const router = useRouter();
        const { iniciarSesion, soportaBiometria, desbloquearConBiometria } =
                useAuth();

        const [mostrarPassword, setMostrarPassword] = useState(false);
        const [cargando, setCargando] = useState(false);
        const [errorMsg, setErrorMsg] = useState<string | null>(null);

        const {
                control,
                handleSubmit,
                formState: { errors },
        } = useForm<LoginFormData>({
                resolver: zodResolver(loginSchema),
                mode: "onSubmit",
                reValidateMode: "onSubmit",
                defaultValues: {
                        email: "",
                        password: "",
                },
        });

        // modal flotante personalizado
        const [modalConfig, setModalConfig] = useState<{
                visible: boolean;
                title: string;
                body: string;
        }>({
                visible: false,
                title: "",
                body: "",
        });

        function mostrarModalNotificacion(title: string, body: string) {
                setModalConfig({ visible: true, title, body });
        }

        function cerrarModalNotificacion() {
                setModalConfig((prev) => ({ ...prev, visible: false }));
        }

        async function handleIngresar(data: LoginFormData) {
                try {
                        setErrorMsg(null);
                        setCargando(true);
                        await iniciarSesion({
                                email: data.email.trim(),
                                password: data.password.trim(),
                        });
                        router.replace("/(tabs)" as any);
                } catch (err: any) {
                        if (err instanceof FalloDatos || err?.detalle) {
                                const codigo = err?.detalle?.codigo;
                                if (
                                        codigo === "CREDENCIALES_INVALIDAS" ||
                                        codigo === "HTTP_401"
                                ) {
                                        setErrorMsg(
                                                "Correo o contraseña incorrectos. Verificá tus credenciales.",
                                        );
                                        return;
                                }
                                if (
                                        codigo === "RED_NO_DISPONIBLE" ||
                                        codigo === "TIEMPO_AGOTADO"
                                ) {
                                        setErrorMsg(
                                                "No se pudo conectar con el servidor. Comprobá tu conexión a internet.",
                                        );
                                        return;
                                }
                                if (codigo === "API_NO_CONFIGURADA") {
                                        setErrorMsg(
                                                "El servicio no se encuentra disponible temporalmente. Por favor, intentá más tarde.",
                                        );
                                        return;
                                }
                        }
                        setErrorMsg(
                                err?.message ||
                                        "Ocurrió un error al iniciar sesión.",
                        );
                } finally {
                        setCargando(false);
                }
        }

        async function handleBiometria() {
                try {
                        const exito = await desbloquearConBiometria();
                        if (exito) {
                                router.replace("/(tabs)" as any);
                        } else {
                                mostrarModalNotificacion(
                                        "Sin sesión registrada",
                                        "No se encontró una sesión iniciada en este dispositivo. Primero debés iniciar sesión o registrarte manualmente.",
                                );
                        }
                } catch {
                        mostrarModalNotificacion(
                                "Autenticación biométrica",
                                "No se pudo verificar la identidad en este dispositivo.",
                        );
                }
        }

        return (
                <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                        <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={
                                        Platform.OS === "ios"
                                                ? "padding"
                                                : undefined
                                }
                        >
                                <ScrollView
                                        contentContainerStyle={styles.container}
                                        keyboardShouldPersistTaps="handled"
                                        showsVerticalScrollIndicator={false}
                                >
                                        <View style={styles.navBar}>
                                                <TouchableOpacity
                                                        style={
                                                                styles.btnBackCircle
                                                        }
                                                        onPress={() =>
                                                                router.replace(
                                                                        "/(tabs)/perfil" as any,
                                                                )
                                                        }
                                                        activeOpacity={0.7}
                                                >
                                                        <Ionicons
                                                                name="chevron-back"
                                                                size={20}
                                                                color={
                                                                        colors.text
                                                                }
                                                        />
                                                </TouchableOpacity>
                                                <Image
                                                        source={require("../../../assets/images/logo-colon.png")}
                                                        style={styles.topLogo}
                                                        resizeMode="contain"
                                                />
                                                <View
                                                        style={
                                                                styles.navBarPlaceholder
                                                        }
                                                />
                                        </View>
                                        <View style={styles.header}>
                                                <Text style={styles.title}>
                                                        Mi Ciudad{"\n"}Colón
                                                </Text>
                                                <Text style={styles.subtitle}>
                                                        Volvé a descubrir Colón
                                                </Text>
                                        </View>

                                        <View style={styles.bridgeContainer}>
                                                <Image
                                                        source={require("../../../assets/images/ilustracion-colon-puente.png")}
                                                        style={
                                                                styles.heroImagePuente
                                                        }
                                                        resizeMode="contain"
                                                />
                                        </View>

                                        <View style={styles.formContainer}>
                                                {errorMsg ? (
                                                        <View
                                                                style={
                                                                        styles.errorBox
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="alert-circle-outline"
                                                                        size={
                                                                                20
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
                                                                        {
                                                                                errorMsg
                                                                        }
                                                                </Text>
                                                        </View>
                                                ) : null}

                                                <Controller
                                                        control={control}
                                                        name="email"
                                                        render={({
                                                                field: {
                                                                        onChange,
                                                                        onBlur,
                                                                        value,
                                                                },
                                                        }) => (
                                                                <View
                                                                        style={[
                                                                                styles.inputContainer,
                                                                                errors.email &&
                                                                                        styles.inputContainerError,
                                                                        ]}
                                                                >
                                                                        <Ionicons
                                                                                name="mail-outline"
                                                                                size={
                                                                                        20
                                                                                }
                                                                                color={
                                                                                        colors.textSecondary
                                                                                }
                                                                                style={
                                                                                        styles.inputIcon
                                                                                }
                                                                        />
                                                                        <TextInput
                                                                                style={
                                                                                        styles.input
                                                                                }
                                                                                placeholder="Correo electrónico"
                                                                                placeholderTextColor={
                                                                                        colors.textSecondary
                                                                                }
                                                                                value={
                                                                                        value
                                                                                }
                                                                                onChangeText={
                                                                                        onChange
                                                                                }
                                                                                onBlur={
                                                                                        onBlur
                                                                                }
                                                                                keyboardType="email-address"
                                                                                autoCapitalize="none"
                                                                                autoCorrect={
                                                                                        false
                                                                                }
                                                                        />
                                                                </View>
                                                        )}
                                                />
                                                {errors.email ? (
                                                        <Text
                                                                style={
                                                                        styles.fieldErrorText
                                                                }
                                                        >
                                                                {
                                                                        errors
                                                                                .email
                                                                                .message
                                                                }
                                                        </Text>
                                                ) : null}

                                                <Controller
                                                        control={control}
                                                        name="password"
                                                        render={({
                                                                field: {
                                                                        onChange,
                                                                        onBlur,
                                                                        value,
                                                                },
                                                        }) => (
                                                                <View
                                                                        style={[
                                                                                styles.inputContainer,
                                                                                errors.password &&
                                                                                        styles.inputContainerError,
                                                                        ]}
                                                                >
                                                                        <Ionicons
                                                                                name="lock-closed-outline"
                                                                                size={
                                                                                        20
                                                                                }
                                                                                color={
                                                                                        colors.textSecondary
                                                                                }
                                                                                style={
                                                                                        styles.inputIcon
                                                                                }
                                                                        />
                                                                        <TextInput
                                                                                style={
                                                                                        styles.input
                                                                                }
                                                                                placeholder="Contraseña"
                                                                                placeholderTextColor={
                                                                                        colors.textSecondary
                                                                                }
                                                                                value={
                                                                                        value
                                                                                }
                                                                                onChangeText={
                                                                                        onChange
                                                                                }
                                                                                onBlur={
                                                                                        onBlur
                                                                                }
                                                                                secureTextEntry={
                                                                                        !mostrarPassword
                                                                                }
                                                                        />
                                                                        <TouchableOpacity
                                                                                onPress={() =>
                                                                                        setMostrarPassword(
                                                                                                !mostrarPassword,
                                                                                        )
                                                                                }
                                                                                hitSlop={
                                                                                        10
                                                                                }
                                                                        >
                                                                                <Ionicons
                                                                                        name={
                                                                                                mostrarPassword
                                                                                                        ? "eye-outline"
                                                                                                        : "eye-off-outline"
                                                                                        }
                                                                                        size={
                                                                                                20
                                                                                        }
                                                                                        color={
                                                                                                colors.textSecondary
                                                                                        }
                                                                                />
                                                                        </TouchableOpacity>
                                                                </View>
                                                        )}
                                                />
                                                {errors.password ? (
                                                        <Text
                                                                style={
                                                                        styles.fieldErrorText
                                                                }
                                                        >
                                                                {
                                                                        errors
                                                                                .password
                                                                                .message
                                                                }
                                                        </Text>
                                                ) : null}

                                                <TouchableOpacity
                                                        style={
                                                                styles.btnPrimary
                                                        }
                                                        onPress={handleSubmit(
                                                                handleIngresar,
                                                        )}
                                                        disabled={cargando}
                                                        activeOpacity={0.85}
                                                >
                                                        {cargando ? (
                                                                <ActivityIndicator
                                                                        color={
                                                                                colors.onPrimary
                                                                        }
                                                                />
                                                        ) : (
                                                                <Text
                                                                        style={
                                                                                styles.btnPrimaryText
                                                                        }
                                                                >
                                                                        Iniciar
                                                                        sesión
                                                                </Text>
                                                        )}
                                                </TouchableOpacity>
                                                {soportaBiometria ? (
                                                        <TouchableOpacity
                                                                style={
                                                                        styles.btnBiometric
                                                                }
                                                                onPress={
                                                                        handleBiometria
                                                                }
                                                                activeOpacity={
                                                                        0.8
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="finger-print-outline"
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.btnBiometricText
                                                                        }
                                                                >
                                                                        Ingresar
                                                                        con
                                                                        Huella /
                                                                        Rostro
                                                                </Text>
                                                        </TouchableOpacity>
                                                ) : null}
                                        </View>

                                        <View style={styles.footer}>
                                                <Text style={styles.footerText}>
                                                        ¿Todavía no tenés
                                                        cuenta?{" "}
                                                </Text>
                                                <TouchableOpacity
                                                        onPress={() =>
                                                                router.push(
                                                                        "/(auth)/registro" as any,
                                                                )
                                                        }
                                                >
                                                        <Text
                                                                style={
                                                                        styles.linkText
                                                                }
                                                        >
                                                                Registrate
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                </ScrollView>
                        </KeyboardAvoidingView>

                        <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalConfig.visible}
                                onRequestClose={cerrarModalNotificacion}
                        >
                                <TouchableWithoutFeedback
                                        onPress={cerrarModalNotificacion}
                                >
                                        <View style={styles.modalOverlay}>
                                                <TouchableWithoutFeedback>
                                                        <View
                                                                style={
                                                                        styles.modalCard
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.modalTitle
                                                                        }
                                                                >
                                                                        {
                                                                                modalConfig.title
                                                                        }
                                                                </Text>
                                                                <Text
                                                                        style={
                                                                                styles.modalBody
                                                                        }
                                                                >
                                                                        {
                                                                                modalConfig.body
                                                                        }
                                                                </Text>

                                                                <TouchableOpacity
                                                                        style={
                                                                                styles.btnModalPrimary
                                                                        }
                                                                        onPress={
                                                                                cerrarModalNotificacion
                                                                        }
                                                                        activeOpacity={
                                                                                0.85
                                                                        }
                                                                >
                                                                        <Text
                                                                                style={
                                                                                        styles.btnModalPrimaryText
                                                                                }
                                                                        >
                                                                                Entendido
                                                                        </Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                </TouchableWithoutFeedback>
                                        </View>
                                </TouchableWithoutFeedback>
                        </Modal>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                safeArea: {
                        flex: 1,
                        backgroundColor: colors.surface,
                },
                container: {
                        flexGrow: 1,
                        backgroundColor: colors.surface,
                        paddingHorizontal: spacing.lg,
                        paddingTop: spacing.xs,
                        paddingBottom: spacing.lg,
                },
                navBar: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: spacing.lg,
                },
                btnBackCircle: {
                        width: 38,
                        height: 38,
                        borderRadius: borderRadius.pill,
                        borderWidth: 1,
                        borderColor: colors.border,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.surface,
                },
                topLogo: {
                        width: 145,
                        height: 54,
                },
                navBarPlaceholder: {
                        width: 38,
                },
                header: {
                        marginTop: spacing.xs,
                        marginBottom: 4,
                },
                title: {
                        fontFamily: fuenteTitulo,
                        fontSize: 32,
                        fontWeight: "bold",
                        color: colors.secondary,
                        lineHeight: 38,
                },
                subtitle: {
                        fontSize: 15,
                        color: colors.textSecondary,
                        marginTop: 4,
                },
                bridgeContainer: {
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        marginVertical: 6,
                },
                heroImagePuente: {
                        width: "100%",
                        height: 105,
                },
                formContainer: {
                        width: "100%",
                        marginTop: spacing.xs,
                },
                errorBox: {
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primaryLight,
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.md,
                        gap: spacing.xs,
                },
                errorText: {
                        color: colors.error,
                        fontSize: fontSize.caption,
                        flex: 1,
                },
                inputContainer: {
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.surface,
                        height: 52,
                        marginBottom: spacing.md,
                },
                inputContainerError: {
                        borderColor: colors.error,
                },
                fieldErrorText: {
                        color: colors.error,
                        fontSize: fontSize.caption,
                        marginTop: -spacing.sm,
                        marginBottom: spacing.sm,
                        marginLeft: spacing.sm,
                },
                inputIcon: {
                        marginRight: spacing.sm,
                },
                input: {
                        flex: 1,
                        fontSize: 15,
                        color: colors.text,
                },
                btnPrimary: {
                        backgroundColor: colors.primarySolid,
                        height: 52,
                        borderRadius: borderRadius.md,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: spacing.xs,
                        marginBottom: spacing.sm,
                },
                btnPrimaryText: {
                        color: colors.onPrimary,
                        fontSize: 16,
                        fontWeight: "bold",
                },
                btnBiometric: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 8,
                        gap: 6,
                },
                btnBiometricText: {
                        color: colors.secondary,
                        fontSize: 14,
                        fontWeight: "600",
                },
                footer: {
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: spacing.lg,
                        paddingBottom: spacing.sm,
                },
                footerText: {
                        color: colors.textSecondary,
                        fontSize: 14,
                },
                linkText: {
                        color: colors.primary,
                        fontSize: 14,
                        fontWeight: "bold",
                },
                modalOverlay: {
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: spacing.lg,
                },
                modalCard: {
                        width: "100%",
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.xl,
                        alignItems: "center",
                        elevation: 4,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                },
                modalTitle: {
                        fontSize: fontSize.subtitle,
                        fontWeight: "bold",
                        color: colors.text,
                        textAlign: "center",
                        marginBottom: spacing.sm,
                },
                modalBody: {
                        fontSize: fontSize.body,
                        color: colors.textSecondary,
                        textAlign: "center",
                        marginBottom: spacing.lg,
                        paddingHorizontal: spacing.xs,
                        lineHeight: 22,
                },
                btnModalPrimary: {
                        width: "100%",
                        height: 48,
                        borderRadius: borderRadius.pill,
                        backgroundColor: colors.primarySolid,
                        justifyContent: "center",
                        alignItems: "center",
                },
                btnModalPrimaryText: {
                        color: colors.onPrimary,
                        fontSize: fontSize.body,
                        fontWeight: "bold",
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
