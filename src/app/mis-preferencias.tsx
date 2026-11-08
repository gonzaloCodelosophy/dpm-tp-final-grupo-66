import { useState } from "react";
import {
        ActivityIndicator,
        Alert,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        Switch,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "../context/auth.context";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { BotonCategoria } from "../components/boton-categoria";
import { categoriasIntereses } from "../../constants/categorias-intereses";
import { EstadoPantalla } from "../components/estado-pantalla";
import { colorsInicio as colors, fuenteTitulo } from "../styles/inicio";

export default function MisPreferenciasScreen() {
        const { usuario, status, actualizarPreferencias } = useAuth();
        const volver = useVolverPerfil();
        const [seleccionadas, setSeleccionadas] = useState<string[]>(
                usuario?.preferencias?.categoriasFavoritas ?? [],
        );
        const [avisarProximidad, setAvisarProximidad] = useState(
                usuario?.preferencias?.avisarProximidad ?? true,
        );
        const radioInicial = usuario?.preferencias?.radioAvisoMetros;
        const [radioAvisoMetros, setRadioAvisoMetros] = useState<
                100 | 250 | 500
        >(radioInicial === 100 || radioInicial === 500 ? radioInicial : 250);
        const [guardando, setGuardando] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const originales = usuario?.preferencias?.categoriasFavoritas ?? [];
        const hayCambios =
                JSON.stringify([...seleccionadas].sort()) !==
                        JSON.stringify([...originales].sort()) ||
                avisarProximidad !==
                        (usuario?.preferencias?.avisarProximidad ?? true) ||
                radioAvisoMetros !==
                        (usuario?.preferencias?.radioAvisoMetros ?? 250);

        function cambiar(id: string) {
                setSeleccionadas((actuales) =>
                        actuales.includes(id)
                                ? actuales.filter(
                                          (categoria) => categoria !== id,
                                  )
                                : [...actuales, id],
                );
                setError(null);
        }

        async function guardar() {
                if (guardando) return;
                setGuardando(true);
                setError(null);
                try {
                        await actualizarPreferencias({
                                categoriasFavoritas: seleccionadas,
                                avisarProximidad,
                                radioAvisoMetros,
                        });
                        Alert.alert(
                                "Preferencias actualizadas",
                                "Guardamos tus categorías y la configuración de avisos.",
                                [{ text: "Aceptar", onPress: volver }],
                        );
                } catch (fallo) {
                        setError(
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No pudimos guardar tus preferencias. Intentá de nuevo.",
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
                                mensaje="Necesitás una sesión activa para elegir tus preferencias."
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
                                <Text style={styles.titulo}>
                                        Mis preferencias
                                </Text>
                                <Text style={styles.descripcion}>
                                        Elegí las categorías que más te gustan
                                        para personalizar tus recomendaciones.
                                        Podés elegir más de una.
                                </Text>
                                <Text style={styles.seccionTitulo}>
                                        Tus intereses
                                </Text>
                                <View style={styles.categorias}>
                                        {categoriasIntereses.map(
                                                (categoria) => (
                                                        <BotonCategoria
                                                                key={
                                                                        categoria.id
                                                                }
                                                                nombre={
                                                                        categoria.nombre
                                                                }
                                                                icono={
                                                                        categoria.icono
                                                                }
                                                                color={
                                                                        categoria.color
                                                                }
                                                                fondo={
                                                                        categoria.fondo
                                                                }
                                                                seleccionado={seleccionadas.includes(
                                                                        categoria.id,
                                                                )}
                                                                deshabilitado={
                                                                        guardando
                                                                }
                                                                multiple
                                                                onPress={() =>
                                                                        cambiar(
                                                                                categoria.id,
                                                                        )
                                                                }
                                                                style={
                                                                        styles.categoria
                                                                }
                                                        />
                                                ),
                                        )}
                                </View>
                                <Text style={styles.seccionTitulo}>
                                        Avisos de proximidad
                                </Text>
                                <View style={styles.fila}>
                                        <View style={styles.textoAvisos}>
                                                <Text style={styles.nombre}>
                                                        Avisarme cuando esté
                                                        cerca
                                                </Text>
                                                <Text
                                                        style={
                                                                styles.detalleAvisos
                                                        }
                                                >
                                                        Activá o desactivá los
                                                        avisos de lugares
                                                        cercanos.
                                                </Text>
                                        </View>
                                        <Switch
                                                accessibilityLabel="Avisos de proximidad"
                                                value={avisarProximidad}
                                                disabled={guardando}
                                                onValueChange={(valor) => {
                                                        setAvisarProximidad(
                                                                valor,
                                                        );
                                                        setError(null);
                                                }}
                                                trackColor={{
                                                        false: colors.border,
                                                        true: colors.secondary,
                                                }}
                                                thumbColor={colors.surface}
                                        />
                                </View>
                                <Text style={styles.seccionTitulo}>
                                        Distancia de avisos
                                </Text>
                                <View
                                        style={styles.distancias}
                                        accessibilityRole="radiogroup"
                                >
                                        {([100, 250, 500] as const).map(
                                                (radio) => (
                                                        <Pressable
                                                                key={radio}
                                                                accessibilityRole="radio"
                                                                accessibilityLabel={`${radio} metros`}
                                                                accessibilityState={{
                                                                        checked:
                                                                                radioAvisoMetros ===
                                                                                radio,
                                                                        disabled:
                                                                                guardando ||
                                                                                !avisarProximidad,
                                                                }}
                                                                disabled={
                                                                        guardando ||
                                                                        !avisarProximidad
                                                                }
                                                                onPress={() => {
                                                                        setRadioAvisoMetros(
                                                                                radio,
                                                                        );
                                                                        setError(
                                                                                null,
                                                                        );
                                                                }}
                                                                style={[
                                                                        styles.distancia,
                                                                        radioAvisoMetros ===
                                                                                radio &&
                                                                                styles.distanciaElegida,
                                                                        !avisarProximidad &&
                                                                                styles.deshabilitado,
                                                                ]}
                                                        >
                                                                <Text
                                                                        style={[
                                                                                styles.distanciaTexto,
                                                                                radioAvisoMetros ===
                                                                                        radio &&
                                                                                        styles.elegida,
                                                                        ]}
                                                                >
                                                                        {radio}{" "}
                                                                        m
                                                                </Text>
                                                        </Pressable>
                                                ),
                                        )}
                                </View>
                                {!avisarProximidad && (
                                        <Text style={styles.ayuda}>
                                                Activá los avisos para cambiar
                                                la distancia. Conservamos la que
                                                tenías elegida.
                                        </Text>
                                )}
                                <Text style={styles.ayuda}>
                                        Podés cambiar tu selección cuando
                                        quieras.
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
                                        accessibilityState={{
                                                disabled:
                                                        guardando ||
                                                        !hayCambios,
                                                busy: guardando,
                                        }}
                                        disabled={guardando || !hayCambios}
                                        onPress={() => void guardar()}
                                        style={[
                                                styles.guardar,
                                                (guardando || !hayCambios) &&
                                                        styles.deshabilitado,
                                        ]}
                                >
                                        {guardando ? (
                                                <ActivityIndicator
                                                        color={colors.surface}
                                                />
                                        ) : (
                                                <Text
                                                        style={
                                                                styles.guardarTexto
                                                        }
                                                >
                                                        Guardar preferencias
                                                </Text>
                                        )}
                                </Pressable>
                        </ScrollView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        pantalla: { flex: 1, backgroundColor: colors.background },
        contenido: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 },
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
                color: colors.textSecondary,
                lineHeight: 21,
                marginTop: 8,
                marginBottom: 20,
        },
        categorias: {
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: 8,
                rowGap: 4,
        },
        categoria: { width: "23%" },
        fila: {
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                minHeight: 64,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
        },
        nombre: { flex: 1, fontSize: 15, color: colors.secondary },
        elegida: { fontWeight: "600" },
        seccionTitulo: {
                fontSize: 14,
                fontWeight: "600",
                color: colors.secondary,
                marginTop: 24,
                marginBottom: 12,
        },
        textoAvisos: { flex: 1, paddingVertical: 10 },
        detalleAvisos: {
                fontSize: 12,
                lineHeight: 18,
                color: colors.textSecondary,
                marginTop: 5,
        },
        distancias: { flexDirection: "row", gap: 10 },
        distancia: {
                flex: 1,
                minHeight: 46,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 24,
        },
        distanciaElegida: {
                borderColor: colors.primary,
                backgroundColor: colors.primaryLight,
        },
        distanciaTexto: { fontSize: 14, color: colors.secondary },
        ayuda: {
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 18,
                marginTop: 18,
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
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 28,
        },
        guardarTexto: {
                fontSize: 14,
                fontWeight: "600",
                color: colors.surface,
        },
        deshabilitado: { opacity: 0.5 },
});
