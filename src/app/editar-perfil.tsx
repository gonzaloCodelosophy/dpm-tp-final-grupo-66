import { BotonVolver } from "../components/boton-volver";
import { tipografia } from "../styles/tipografia";
import { useTema } from "../context/tema.context";
import { useState } from "react";
import {
        ActivityIndicator,
        Alert,
        KeyboardAvoidingView,
        Platform,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        TextInput,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { useAuth } from "../context/auth.context";
import { EstadoPantalla } from "../components/estado-pantalla";
import { colorsInicio as paletaColors, fuenteTitulo } from "../styles/inicio";

export default function EditarPerfilScreen() {
        const { colors, styles } = useEstilos();

        const { usuario, status, actualizarPerfil } = useAuth();
        const [nombre, setNombre] = useState(usuario?.nombre ?? "");
        const [foto, setFoto] = useState<
                ImagePicker.ImagePickerAsset | null | undefined
        >(undefined);
        const [guardando, setGuardando] = useState(false);
        const [eligiendo, setEligiendo] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const volver = useVolverPerfil();
        const avatar = foto === null ? null : (foto?.uri ?? usuario?.avatarUrl);
        const cambiado =
                nombre.trim() !== usuario?.nombre || foto !== undefined;
        const ocupado = guardando || eligiendo;

        async function elegirFoto() {
                setEligiendo(true);
                setError(null);
                try {
                        const resultado =
                                await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ["images"],
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                        quality: 0.8,
                                        preferredAssetRepresentationMode:
                                                ImagePicker
                                                        .UIImagePickerPreferredAssetRepresentationMode
                                                        .Compatible,
                                });
                        if (resultado.canceled) return;
                        const seleccionada = resultado.assets[0];
                        if (
                                seleccionada.fileSize &&
                                seleccionada.fileSize > 5 * 1024 * 1024
                        )
                                throw new Error(
                                        "La foto puede pesar hasta 5 MB.",
                                );
                        if (
                                seleccionada.mimeType &&
                                ![
                                        "image/jpeg",
                                        "image/png",
                                        "image/webp",
                                ].includes(seleccionada.mimeType)
                        )
                                throw new Error(
                                        "Elegí una foto JPG, PNG o WEBP.",
                                );
                        setFoto(seleccionada);
                } catch (fallo) {
                        setError(
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No pudimos abrir tus fotos. Intentá de nuevo.",
                        );
                } finally {
                        setEligiendo(false);
                }
        }

        async function guardar() {
                if (ocupado) return;
                if (!nombre.trim()) {
                        setError("Ingresá tu nombre completo.");
                        return;
                }
                setGuardando(true);
                setError(null);
                try {
                        await actualizarPerfil({ nombre: nombre.trim(), foto });
                        Alert.alert(
                                "Perfil actualizado",
                                "Tus cambios se guardaron correctamente.",
                                [{ text: "Aceptar", onPress: volver }],
                        );
                } catch (fallo) {
                        setError(
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No pudimos guardar los cambios. Intentá de nuevo.",
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
                                titulo={
                                        status === "biometria_requerida"
                                                ? "Desbloqueá tu sesión"
                                                : "Iniciá sesión"
                                }
                                mensaje="Necesitás una sesión activa para editar tu perfil."
                                accion="Volver al perfil"
                                onPress={() => router.replace("/(tabs)/perfil")}
                        />
                );

        return (
                <SafeAreaView
                        style={styles.pantalla}
                        edges={["top", "bottom", "left", "right"]}
                >
                        <Stack.Screen options={{ headerShown: false }} />
                        <KeyboardAvoidingView
                                style={styles.pantalla}
                                behavior={
                                        Platform.OS === "ios"
                                                ? "padding"
                                                : undefined
                                }
                        >
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
                                        <Text style={styles.titulo}>
                                                Editar perfil
                                        </Text>
                                        <Text style={styles.subtitulo}>
                                                Actualizá tu información
                                        </Text>
                                </View>
                                <ScrollView
                                        style={styles.scroll}
                                        contentContainerStyle={styles.contenido}
                                        keyboardShouldPersistTaps="handled"
                                >
                                        <Text style={styles.etiqueta}>
                                                Foto de perfil
                                        </Text>
                                        <View style={styles.fotoSeccion}>
                                                <View style={styles.avatar}>
                                                        {avatar ? (
                                                                <Image
                                                                        source={{
                                                                                uri: avatar,
                                                                        }}
                                                                        style={
                                                                                styles.imagen
                                                                        }
                                                                        contentFit="cover"
                                                                />
                                                        ) : (
                                                                <Ionicons
                                                                        name="person-outline"
                                                                        size={
                                                                                36
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                        )}
                                                </View>
                                                <View
                                                        style={
                                                                styles.accionesFoto
                                                        }
                                                >
                                                        <Pressable
                                                                accessibilityRole="button"
                                                                onPress={() =>
                                                                        void elegirFoto()
                                                                }
                                                                disabled={
                                                                        ocupado
                                                                }
                                                                style={
                                                                        styles.accionFoto
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="camera-outline"
                                                                        size={
                                                                                19
                                                                        }
                                                                        color={
                                                                                colors.primary
                                                                        }
                                                                />
                                                                <Text
                                                                        style={
                                                                                styles.enlace
                                                                        }
                                                                >
                                                                        {eligiendo
                                                                                ? "Abriendo fotos…"
                                                                                : "Cambiar foto"}
                                                                </Text>
                                                        </Pressable>
                                                        {avatar && (
                                                                <Pressable
                                                                        accessibilityRole="button"
                                                                        onPress={() =>
                                                                                setFoto(
                                                                                        null,
                                                                                )
                                                                        }
                                                                        disabled={
                                                                                ocupado
                                                                        }
                                                                        style={
                                                                                styles.accionFoto
                                                                        }
                                                                >
                                                                        <Ionicons
                                                                                name="trash-outline"
                                                                                size={
                                                                                        18
                                                                                }
                                                                                color={
                                                                                        colors.error
                                                                                }
                                                                        />
                                                                        <Text
                                                                                style={
                                                                                        styles.eliminar
                                                                                }
                                                                        >
                                                                                Eliminar
                                                                                foto
                                                                        </Text>
                                                                </Pressable>
                                                        )}
                                                </View>
                                        </View>
                                        <Text style={styles.ayuda}>
                                                JPG, PNG o WEBP. Hasta 5 MB.
                                        </Text>
                                        <Text style={styles.etiqueta}>
                                                Nombre completo
                                        </Text>
                                        <TextInput
                                                accessibilityLabel="Nombre completo"
                                                value={nombre}
                                                onChangeText={setNombre}
                                                editable={!ocupado}
                                                maxLength={100}
                                                autoCapitalize="words"
                                                autoComplete="name"
                                                textContentType="name"
                                                placeholder="Tu nombre completo"
                                                placeholderTextColor={
                                                        colors.textSecondary
                                                }
                                                style={styles.campo}
                                        />
                                        <Text style={styles.etiqueta}>
                                                Correo electrónico
                                        </Text>
                                        <View style={styles.correo}>
                                                <TextInput
                                                        accessibilityLabel="Correo electrónico, no se puede modificar"
                                                        value={usuario.email}
                                                        editable={false}
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        style={
                                                                styles.correoTexto
                                                        }
                                                />
                                                <Ionicons
                                                        name="lock-closed-outline"
                                                        size={18}
                                                        color={
                                                                colors.textSecondary
                                                        }
                                                />
                                        </View>
                                        <Text style={styles.ayuda}>
                                                El correo electrónico no se
                                                puede modificar.
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
                                                disabled={
                                                        ocupado ||
                                                        !cambiado ||
                                                        !nombre.trim()
                                                }
                                                onPress={() => void guardar()}
                                                style={[
                                                        styles.guardar,
                                                        (ocupado ||
                                                                !cambiado ||
                                                                !nombre.trim()) &&
                                                                styles.deshabilitado,
                                                ]}
                                        >
                                                {guardando ? (
                                                        <ActivityIndicator
                                                                color={
                                                                        colors.onPrimary
                                                                }
                                                        />
                                                ) : (
                                                        <Text
                                                                style={
                                                                        styles.guardarTexto
                                                                }
                                                        >
                                                                Guardar cambios
                                                        </Text>
                                                )}
                                        </Pressable>
                                        <Pressable
                                                accessibilityRole="button"
                                                onPress={volver}
                                                disabled={ocupado}
                                                style={styles.cancelar}
                                        >
                                                <Text style={styles.enlace}>
                                                        Cancelar
                                                </Text>
                                        </Pressable>
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
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
                        color: colors.secondary,
                },
                subtitulo: {
                        ...tipografia.texto,
                        color: colors.textSecondary,
                        marginTop: 4,
                        marginBottom: 8,
                },
                etiqueta: {
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.secondary,
                        marginTop: 24,
                        marginBottom: 10,
                },
                fotoSeccion: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 20,
                },
                avatar: {
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        backgroundColor: colors.secondaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                },
                imagen: { width: "100%", height: "100%" },
                accionesFoto: { flex: 1 },
                accionFoto: {
                        minHeight: 44,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                },
                enlace: {
                        color: colors.primary,
                        fontSize: 14,
                        fontWeight: "600",
                },
                eliminar: { color: colors.error, fontSize: 14 },
                ayuda: {
                        color: colors.textSecondary,
                        fontSize: 12,
                        lineHeight: 18,
                        marginTop: 8,
                },
                campo: {
                        minHeight: 48,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 14,
                        color: colors.secondary,
                        backgroundColor: colors.surface,
                },
                correo: {
                        flexDirection: "row",
                        alignItems: "center",
                        minHeight: 48,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        backgroundColor: colors.secondaryLight,
                },
                correoTexto: {
                        flex: 1,
                        fontSize: 14,
                        color: colors.textSecondary,
                        paddingVertical: 12,
                },
                error: {
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.error,
                        marginTop: 20,
                },
                guardar: {
                        minHeight: 48,
                        borderRadius: 24,
                        backgroundColor: colors.primarySolid,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 32,
                },
                guardarTexto: {
                        color: colors.onPrimary,
                        fontWeight: "600",
                        fontSize: 14,
                },
                deshabilitado: { opacity: 0.5 },
                cancelar: {
                        minHeight: 48,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 8,
                },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
