import { usePopup } from '../../context/popup.context';
import { tipografia, logoPrincipal } from "../../styles/tipografia";
import { useTema } from "../../context/tema.context";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
        colorsInicio as paletaColorsInicio,
        fuenteTitulo,
} from "../../styles/inicio";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "../../context/auth.context";
import {
        borderRadius,
        colors as paletaColors,
        fontSize,
        spacing,
} from "../../styles/theme";

export default function PerfilScreen() {
  const mostrarPopup = usePopup();
        const { colorsInicio, colors, styles } = useEstilos();

        const router = useRouter();
        const { usuario, status, cerrarSesion } = useAuth();
        const [modalVisible, setModalVisible] = useState(false);
        const [fotoFallida, setFotoFallida] = useState<string | null>(null);

        async function confirmarCerrarSesion() {
                setModalVisible(false);
                await cerrarSesion();
                router.replace("/(auth)/login" as any);
        }

        function abrirSeccion(titulo: string, mensaje: string) {
                mostrarPopup(titulo, mensaje);
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
                        color: colors.secondary,
                        onPress: () =>
                                router.push("/eventos-guardados" as Href),
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
                        color: colors.yellow,
                        onPress: () =>
                                abrirSeccion(
                                        "Notificaciones",
                                        "La configuración de avisos estará disponible próximamente. Los recordatorios se gestionan desde cada evento en la agenda.",
                                ),
                },
                {
                        titulo: "Apariencia",
                        descripcion: "Tema claro u oscuro",
                        icono: "moon-outline",
                        grupo: "Preferencias",
                        color: colors.blueText,
                        onPress: () => router.push("../apariencia"),
                },
                {
                        titulo: "Ayuda y soporte",
                        descripcion: "Resolvé tus dudas sobre la app",
                        icono: "help-circle-outline",
                        grupo: "Cuenta y ayuda",
                        color: colors.secondary,
                        onPress: () => router.push("/ayuda-soporte" as Href),
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
                                <Text style={styles.headerTitle}>Perfil</Text>
                                <Text style={styles.headerSubtitle}>
                                        Tu espacio personal en Colón
                                </Text>
                        </View>

                        <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.container}
                        >
                                {status === "autenticado" && usuario ? (
                                        <>
                                                <View
                                                        style={
                                                                styles.profileCard
                                                        }
                                                >
                                                        <View
                                                                style={
                                                                        styles.profileDetails
                                                                }
                                                        >
                                                                <View
                                                                        style={
                                                                                styles.profilePhoto
                                                                        }
                                                                >
                                                                        {usuario.avatarUrl &&
                                                                        fotoFallida !==
                                                                                usuario.avatarUrl ? (
                                                                                <Image
                                                                                        source={{
                                                                                                uri: usuario.avatarUrl,
                                                                                        }}
                                                                                        style={
                                                                                                styles.profilePhotoImage
                                                                                        }
                                                                                        contentFit="cover"
                                                                                        accessibilityLabel="Foto de perfil"
                                                                                        onError={() =>
                                                                                                setFotoFallida(
                                                                                                        usuario.avatarUrl,
                                                                                                )
                                                                                        }
                                                                                />
                                                                        ) : (
                                                                                <Ionicons
                                                                                        name="person"
                                                                                        size={
                                                                                                40
                                                                                        }
                                                                                        color={
                                                                                                colors.secondary
                                                                                        }
                                                                                />
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
                                                                                                16
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
                                                                        >
                                                                                {
                                                                                        usuario.email
                                                                                }
                                                                        </Text>
                                                                        <TouchableOpacity
                                                                                accessibilityRole="button"
                                                                                accessibilityLabel="Editar perfil"
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
                                                                                                16
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
                                                        </View>
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
                                        <>
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

                                                <View
                                                        style={[
                                                                styles.menu,
                                                                {
                                                                        marginTop:
                                                                                spacing.lg,
                                                                },
                                                        ]}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.sectionTitle
                                                                }
                                                        >
                                                                Preferencias
                                                        </Text>
                                                        {opciones
                                                                .filter(
                                                                        (
                                                                                opcion,
                                                                        ) =>
                                                                                opcion.titulo ===
                                                                                "Apariencia",
                                                                )
                                                                .map(
                                                                        renderOpcion,
                                                                )}
                                                </View>

                                                <View style={styles.menu}>
                                                        <Text
                                                                style={
                                                                        styles.sectionTitle
                                                                }
                                                        >
                                                                Cuenta y ayuda
                                                        </Text>
                                                        {opciones
                                                                .filter(
                                                                        (
                                                                                opcion,
                                                                        ) =>
                                                                                opcion.titulo ===
                                                                                "Ayuda y soporte",
                                                                )
                                                                .map(
                                                                        renderOpcion,
                                                                )}
                                                </View>
                                        </>
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

const crearEstilos = (
        colorsInicio: typeof paletaColorsInicio,
        colors: typeof paletaColors,
) =>
        StyleSheet.create({
                logo: {
                        ...logoPrincipal,
                        position: "absolute",
                        top: 0,
                        left: 0,
                },
                puente: {
                        width: 205,
                        height: 115,
                        position: "absolute",
                        right: -24,
                        top: 0,
                        opacity: 0.85,
                },
                headerSubtitle: {
                        ...tipografia.texto,
                        color: colors.greenText,
                        marginTop: 2,
                },
                userInfo: { flex: 1, minWidth: 0 },
                role: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                },
                email: {
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginTop: 4,
                },
                editButton: {
                        alignSelf: "flex-start",
                        marginTop: 4,
                        minHeight: 36,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                },
                editText: {
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.primary,
                },
                profileDetails: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                },
                profilePhoto: {
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                },
                profilePhotoImage: { width: "100%", height: "100%" },
                menu: { marginBottom: spacing.lg },
                sectionTitle: {
                        ...tipografia.grupo,
                        fontFamily: fuenteTitulo,
                        color: colors.greenText,
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
                optionTitle: { ...tipografia.opcion, color: colors.blueText },
                optionDescription: {
                        ...tipografia.detalle,
                        color: colors.textSecondary,
                        marginTop: 3,
                },
                scroll: { flex: 1 },
                container: {
                        flexGrow: 1,
                        backgroundColor: colors.background,
                        paddingHorizontal: 18,
                        paddingTop: spacing.sm,
                        paddingBottom: spacing.xl,
                },
                header: {
                        backgroundColor: colors.background,
                        marginHorizontal: 18,
                        marginTop: spacing.sm,
                        flexShrink: 0,
                        marginBottom: spacing.lg,
                        minHeight: 130,
                        justifyContent: "flex-end",
                },
                headerTitle: {
                        ...tipografia.titulo,
                        fontFamily: fuenteTitulo,
                        color: colors.blueText,
                },

                profileCard: {
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                        elevation: 2,
                        shadowColor: colors.text,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                },
                userName: {
                        ...tipografia.seccion,
                        flexShrink: 1,
                        color: colors.blueText,
                },
                userEmail: {
                        ...tipografia.texto,
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
                        backgroundColor: colors.primarySolid,
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
                        color: colors.onPrimary,
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
                        backgroundColor: colors.primarySolid,
                        justifyContent: "center",
                        alignItems: "center",
                },
                btnConfirmLogoutText: {
                        color: colors.onPrimary,
                        fontSize: fontSize.body,
                        fontWeight: "bold",
                },
        });

function useEstilos() {
        const tema = useTema();
        const colorsInicio = tema.colorsInicio;
        const colors = tema.colors;
        return {
                colorsInicio,
                colors,
                styles: crearEstilos(colorsInicio, colors),
        };
}
