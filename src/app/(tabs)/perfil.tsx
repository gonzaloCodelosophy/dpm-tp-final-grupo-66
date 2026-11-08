import React, { useState } from "react";
import {
        Alert,
        Modal,
        ScrollView,
        StyleSheet,
        Text,
        TouchableOpacity,
        TouchableWithoutFeedback,
        View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { colorsInicio, fuenteTitulo } from "../../styles/inicio";
import { useRouter } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "../../context/auth.context";
import { borderRadius, colors, fontSize, spacing } from "../../styles/theme";

export default function PerfilScreen() {
        const router = useRouter();
        const { usuario, status, cerrarSesion } = useAuth();
        const [modalVisible, setModalVisible] = useState(false);

        async function confirmarCerrarSesion() {
                setModalVisible(false);
                await cerrarSesion();
                router.replace("/(auth)/login" as any);
        }

        const iniciales = usuario?.nombre
                ? usuario.nombre
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                : "U";

        function abrirSeccion(titulo: string, mensaje: string) {
                Alert.alert(titulo, mensaje);
        }

        const opciones: {
                titulo: string;
                descripcion: string;
                icono: React.ComponentProps<typeof Ionicons>["name"];
                grupo: "Mi actividad" | "Preferencias" | "Cuenta y ayuda";
                color: string;
                onPress: () => void;
        }[] = [
                {
                        titulo: "Mis favoritos",
                        descripcion: "Lugares que guardaste",
                        icono: "heart-outline",
                        grupo: "Mi actividad",
                        color: colors.primary,
                        onPress: () => router.push("/(tabs)/favoritos"),
                },
                {
                        titulo: "Eventos guardados",
                        descripcion: "Actividades que te interesan",
                        icono: "calendar-outline",
                        grupo: "Mi actividad",
                        color: "#7955A0",
                        onPress: () =>
                                abrirSeccion(
                                        "Eventos guardados",
                                        "La lista de eventos guardados estará disponible próximamente. Podés consultar las actividades desde la agenda.",
                                ),
                },
                {
                        titulo: "Mis preferencias",
                        descripcion: "Intereses y avisos de proximidad",
                        icono: "options-outline",
                        grupo: "Preferencias",
                        color: colors.secondary,
                        onPress: () => router.push("../mis-preferencias"),
                },
                {
                        titulo: "Notificaciones",
                        descripcion: "Avisos de eventos y cercanía",
                        icono: "notifications-outline",
                        grupo: "Preferencias",
                        color: "#B58227",
                        onPress: () =>
                                abrirSeccion(
                                        "Notificaciones",
                                        "La configuración de avisos estará disponible próximamente. Los recordatorios se gestionan desde cada evento en la agenda.",
                                ),
                },
                {
                        titulo: "Apariencia",
                        descripcion: "Tema claro, oscuro o del sistema",
                        icono: "moon-outline",
                        grupo: "Preferencias",
                        color: "#24657C",
                        onPress: () =>
                                abrirSeccion(
                                        "Apariencia",
                                        "La selección del tema estará disponible próximamente.",
                                ),
                },
                {
                        titulo: "Ayuda y soporte",
                        descripcion: "Resolvé tus dudas sobre la app",
                        icono: "help-circle-outline",
                        grupo: "Cuenta y ayuda",
                        color: colors.secondary,
                        onPress: () =>
                                abrirSeccion(
                                        "Ayuda y soporte",
                                        "Las preguntas frecuentes y los canales de soporte estarán disponibles próximamente.",
                                ),
                },
                {
                        titulo: "Cerrar sesión",
                        descripcion: "Salir de tu cuenta",
                        icono: "log-out-outline",
                        grupo: "Cuenta y ayuda",
                        color: colors.error,
                        onPress: () => setModalVisible(true),
                },
        ];

        function renderOpcion(opcion: (typeof opciones)[number]) {
                return (
                        <TouchableOpacity
                                key={opcion.titulo}
                                accessibilityRole="button"
                                style={styles.option}
                                onPress={opcion.onPress}
                                activeOpacity={0.7}
                        >
                                <View style={styles.optionIcon}>
                                        <Ionicons
                                                name={opcion.icono}
                                                size={24}
                                                color={opcion.color}
                                        />
                                </View>
                                <View style={styles.optionText}>
                                        <Text
                                                style={[
                                                        styles.optionTitle,
                                                        opcion.titulo ===
                                                                "Cerrar sesión" &&
                                                                styles.btnLogoutText,
                                                ]}
                                        >
                                                {opcion.titulo}
                                        </Text>
                                        <Text style={styles.optionDescription}>
                                                {opcion.descripcion}
                                        </Text>
                                </View>
                                <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={colorsInicio.secondary}
                                />
                        </TouchableOpacity>
                );
        }

        return (
                <SafeAreaView
                        edges={["top", "left", "right"]}
                        style={{ flex: 1, backgroundColor: colors.background }}
                >
                        <ScrollView contentContainerStyle={styles.container}>
                                <View style={styles.header}>
                                        <Image
                                                source={require("../../../assets/images/logo-colon.png")}
                                                style={styles.logo}
                                                contentFit="contain"
                                        />
                                        <Image
                                                source={require("../../../assets/images/ilustracion-colon-puente.png")}
                                                style={styles.puente}
                                                contentFit="contain"
                                        />
                                        <Text style={styles.headerTitle}>
                                                Perfil
                                        </Text>
                                        <Text style={styles.headerSubtitle}>
                                                Tu espacio personal en Colón
                                        </Text>
                                </View>

                                {status === "autenticado" && usuario ? (
                                        <>
                                                <View
                                                        style={
                                                                styles.profileCard
                                                        }
                                                >
                                                        <View
                                                                style={
                                                                        styles.avatarCircle
                                                                }
                                                        >
                                                                {usuario.avatarUrl ? (
                                                                        <Image
                                                                                source={{
                                                                                        uri: usuario.avatarUrl,
                                                                                }}
                                                                                style={
                                                                                        styles.avatarImage
                                                                                }
                                                                                contentFit="cover"
                                                                                accessibilityLabel="Foto de perfil"
                                                                        />
                                                                ) : (
                                                                        <Text
                                                                                style={
                                                                                        styles.avatarText
                                                                                }
                                                                        >
                                                                                {
                                                                                        iniciales
                                                                                }
                                                                        </Text>
                                                                )}
                                                        </View>
                                                        <View
                                                                style={
                                                                        styles.userInfo
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.userName
                                                                        }
                                                                >
                                                                        {
                                                                                usuario.nombre
                                                                        }
                                                                </Text>
                                                                <View
                                                                        style={
                                                                                styles.role
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="briefcase-outline"
                                                                                size={
                                                                                        17
                                                                                }
                                                                                color={
                                                                                        colors.textSecondary
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.userEmail
                                                                                }
                                                                        >
                                                                                Turista
                                                                        </Text>
                                                                </View>
                                                                <Text
                                                                        style={
                                                                                styles.email
                                                                        }
                                                                        numberOfLines={
                                                                                1
                                                                        }
                                                                >
                                                                        {
                                                                                usuario.email
                                                                        }
                                                                </Text>
                                                        </View>
                                                        <TouchableOpacity
                                                                accessibilityRole="button"
                                                                style={
                                                                        styles.editButton
                                                                }
                                                                onPress={() =>
                                                                        router.push(
                                                                                "../editar-perfil",
                                                                        )
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="create-outline"
                                                                        size={
                                                                                18
                                                                        }
                                                                        color={
                                                                                colors.primary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.editText
                                                                        }
                                                                >
                                                                        Editar
                                                                        perfil
                                                                </Text>
                                                        </TouchableOpacity>
                                                </View>

                                                {(
                                                        [
                                                                "Mi actividad",
                                                                "Preferencias",
                                                                "Cuenta y ayuda",
                                                        ] as const
                                                ).map((grupo) => (
                                                        <View
                                                                key={grupo}
                                                                style={
                                                                        styles.menu
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.sectionTitle
                                                                        }
                                                                >
                                                                        {grupo}
                                                                </Text>
                                                                {opciones
                                                                        .filter(
                                                                                (
                                                                                        opcion,
                                                                                ) =>
                                                                                        opcion.grupo ===
                                                                                        grupo,
                                                                        )
                                                                        .map(
                                                                                renderOpcion,
                                                                        )}
                                                        </View>
                                                ))}
                                        </>
                                ) : (
                                        <View style={styles.guestCard}>
                                                <View
                                                        style={
                                                                styles.guestIconCircle
                                                        }
                                                >
                                                        <Ionicons
                                                                name="person-outline"
                                                                size={40}
                                                                color={
                                                                        colors.secondary
                                                                }
                                                        />
                                                </View>
                                                <Text style={styles.guestTitle}>
                                                        Modo Visitante
                                                </Text>
                                                <Text
                                                        style={
                                                                styles.guestSubtitle
                                                        }
                                                >
                                                        Podés explorar el mapa y
                                                        lugares libremente.
                                                        Iniciá sesión para
                                                        guardar tus eventos
                                                        favoritos y registrar
                                                        tus visitas.
                                                </Text>

                                                <TouchableOpacity
                                                        style={styles.btnLogin}
                                                        onPress={() =>
                                                                router.push(
                                                                        "/(auth)/login" as any,
                                                                )
                                                        }
                                                        activeOpacity={0.85}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.btnLoginText
                                                                }
                                                        >
                                                                Iniciar sesión /
                                                                Registrarse
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                )}
                        </ScrollView>

                        <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                        >
                                <TouchableWithoutFeedback
                                        onPress={() => setModalVisible(false)}
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
                                                                        ¿Cerrar
                                                                        sesión?
                                                                </Text>
                                                                <Text
                                                                        style={
                                                                                styles.modalBody
                                                                        }
                                                                >
                                                                        Vas a
                                                                        tener
                                                                        que
                                                                        volver a
                                                                        ingresar
                                                                        para
                                                                        acceder
                                                                        a tus
                                                                        favoritos
                                                                        y
                                                                        visitas
                                                                        guardadas.
                                                                </Text>

                                                                <View
                                                                        style={
                                                                                styles.modalActions
                                                                        }
                                                                >
                                                                        <TouchableOpacity
                                                                                style={
                                                                                        styles.btnCancel
                                                                                }
                                                                                onPress={() =>
                                                                                        setModalVisible(
                                                                                                false,
                                                                                        )
                                                                                }
                                                                                activeOpacity={
                                                                                        0.8
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.btnCancelText
                                                                                        }
                                                                                >
                                                                                        Cancelar
                                                                                </Text>
                                                                        </TouchableOpacity>

                                                                        <TouchableOpacity
                                                                                style={
                                                                                        styles.btnConfirmLogout
                                                                                }
                                                                                onPress={
                                                                                        confirmarCerrarSesion
                                                                                }
                                                                                activeOpacity={
                                                                                        0.85
                                                                                }
                                                                        >
                                                                                <Text
                                                                                        style={
                                                                                                styles.btnConfirmLogoutText
                                                                                        }
                                                                                >
                                                                                        Cerrar
                                                                                        sesión
                                                                                </Text>
                                                                        </TouchableOpacity>
                                                                </View>
                                                        </View>
                                                </TouchableWithoutFeedback>
                                        </View>
                                </TouchableWithoutFeedback>
                        </Modal>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        logo: { width: 95, height: 62, position: "absolute", top: 0, left: 0 },
        puente: {
                width: 205,
                height: 115,
                position: "absolute",
                right: -24,
                top: 0,
                opacity: 0.85,
        },
        headerSubtitle: {
                fontSize: 14,
                color: colorsInicio.secondary,
                marginTop: 2,
        },
        userInfo: { flex: 1, minWidth: 120 },
        role: {
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
        },
        email: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
        editButton: {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.primaryLight,
        },
        editText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
        menu: { marginBottom: spacing.lg },
        sectionTitle: {
                fontSize: 13,
                fontWeight: "600",
                color: colors.textSecondary,
                marginBottom: spacing.sm,
                marginTop: spacing.sm,
        },
        option: {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                minHeight: 70,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
        },
        optionIcon: {
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
        },
        optionText: { flex: 1 },
        optionTitle: {
                fontSize: 16,
                fontWeight: "600",
                color: colorsInicio.secondary,
        },
        optionDescription: {
                fontSize: fontSize.caption,
                color: colors.textSecondary,
                marginTop: 3,
                lineHeight: 20,
        },
        container: {
                flexGrow: 1,
                backgroundColor: colors.background,
                paddingHorizontal: 18,
                paddingTop: spacing.sm,
                paddingBottom: spacing.xl,
        },
        header: {
                marginBottom: spacing.lg,
                minHeight: 130,
                justifyContent: "flex-end",
        },
        headerTitle: {
                fontSize: 24,
                fontFamily: fuenteTitulo,
                fontWeight: "bold",
                color: colors.secondary,
        },

        profileCard: {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
                alignItems: "center",
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                elevation: 2,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
        },
        avatarCircle: {
                width: 46,
                height: 46,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
        },
        avatarImage: {
                width: "100%",
                height: "100%",
                borderRadius: borderRadius.pill,
        },
        avatarText: {
                color: colors.surface,
                fontSize: 20,
                fontWeight: "bold",
        },
        userName: {
                fontSize: 17,
                fontWeight: "bold",
                color: colors.text,
        },
        userEmail: {
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: spacing.xs,
        },
        btnLogoutText: {
                color: colors.error,
                fontSize: 14,
                fontWeight: "bold",
        },

        guestCard: {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                alignItems: "center",
                marginTop: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                elevation: 2,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
        },
        guestIconCircle: {
                width: 76,
                height: 76,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.secondaryLight,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.sm,
        },
        guestTitle: {
                fontSize: fontSize.subtitle,
                fontWeight: "bold",
                color: colors.secondary,
                marginBottom: spacing.xs,
        },
        guestSubtitle: {
                fontSize: fontSize.body,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: spacing.xl,
        },
        btnLogin: {
                backgroundColor: colors.primary,
                height: 52,
                width: "100%",
                borderRadius: borderRadius.pill,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
        },
        btnLoginText: {
                color: colors.surface,
                fontSize: fontSize.body,
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
                lineHeight: 22,
                marginBottom: spacing.lg,
                paddingHorizontal: spacing.xs,
        },
        modalActions: {
                flexDirection: "row",
                width: "100%",
                gap: spacing.sm,
        },
        btnCancel: {
                flex: 1,
                height: 48,
                borderRadius: borderRadius.pill,
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.surface,
                justifyContent: "center",
                alignItems: "center",
        },
        btnCancelText: {
                color: colors.primary,
                fontSize: fontSize.body,
                fontWeight: "bold",
        },
        btnConfirmLogout: {
                flex: 1,
                height: 48,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
        },
        btnConfirmLogoutText: {
                color: colors.surface,
                fontSize: fontSize.body,
                fontWeight: "bold",
        },
});
