import { useEffect, useState } from "react";
import {
        ActivityIndicator,
        Pressable,
        ScrollView,
        StyleSheet,
        Text,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, type Href } from "expo-router";
import { Image } from "expo-image";
import { BotonVolver } from "../components/boton-volver";
import { EstadoPantalla } from "../components/estado-pantalla";
import { SelectorNumero } from "../components/selector-numero";
import { SelectorOpciones } from "../components/selector-opciones";
import { usePopup } from "../context/popup.context";
import { useAuth } from "../context/auth.context";
import { useTema } from "../context/tema.context";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { usePreferenciasNotificaciones } from "../hooks/use-preferencias-notificaciones";
import { leerEventosGuardados } from "../services/eventos-guardados.service";
import { sincronizarRecordatoriosEventos } from "../services/recordatorios-eventos.service";
import { colorsInicio as paletaColors, fuenteTitulo } from "../styles/inicio";
import { tipografia } from "../styles/tipografia";

export default function NotificacionesScreen() {
        const mostrarPopup = usePopup();
        const router = useRouter();
        const volver = useVolverPerfil();
        const { colors, styles } = useEstilos();
        const { usuario, status } = useAuth();
        const preferencias = usePreferenciasNotificaciones();

        const [horas, setHoras] = useState(
                preferencias.horasRecordatorioEvento,
        );
        const [radio, setRadio] = useState(preferencias.radioAvisoMetros);
        const [porDia, setPorDia] = useState(
                preferencias.avisosProximidadPorDia,
        );
        const [guardando, setGuardando] = useState(false);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
                if (preferencias.cargando) return;
                setHoras(preferencias.horasRecordatorioEvento);
                setRadio(preferencias.radioAvisoMetros);
                setPorDia(preferencias.avisosProximidadPorDia);
        }, [
                preferencias.cargando,
                preferencias.horasRecordatorioEvento,
                preferencias.radioAvisoMetros,
                preferencias.avisosProximidadPorDia,
        ]);

        const hayCambios =
                horas !== preferencias.horasRecordatorioEvento ||
                radio !== preferencias.radioAvisoMetros ||
                porDia !== preferencias.avisosProximidadPorDia;

        async function guardarAjustes() {
                if (guardando || !hayCambios || !usuario) return;
                setGuardando(true);
                setError(null);
                try {
                        await preferencias.guardar({
                                horasRecordatorioEvento: horas,
                                radioAvisoMetros: radio,
                                avisosProximidadPorDia: porDia,
                        });

                        // Los recordatorios ya programados deben reflejar la
                        // nueva anticipación sin esperar a abrir la agenda.
                        try {
                                const eventos = await leerEventosGuardados(
                                        usuario.id,
                                );
                                await sincronizarRecordatoriosEventos(
                                        eventos,
                                        horas,
                                );
                        } catch (fallo) {
                                console.warn(
                                        "No se pudieron reprogramar los recordatorios",
                                        fallo,
                                );
                        }

                        mostrarPopup(
                                "Notificaciones actualizadas",
                                "Guardamos tus preferencias de recordatorios y avisos de cercanía.",
                                [{ text: "Aceptar", onPress: volver }],
                        );
                } catch (fallo) {
                        setError(
                                fallo instanceof Error
                                        ? fallo.message
                                        : "No pudimos guardar los ajustes. Intentá de nuevo.",
                        );
                } finally {
                        setGuardando(false);
                }
        }

        if (status === "cargando" || preferencias.cargando)
                return <EstadoPantalla tipo="cargando" />;
        if (status !== "autenticado" || !usuario)
                return (
                        <EstadoPantalla
                                tipo="vacio"
                                titulo={
                                        status === "biometria_requerida"
                                                ? "Desbloqueá tu sesión"
                                                : "Iniciá sesión"
                                }
                                mensaje="Necesitás una sesión activa para configurar tus notificaciones."
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
                                                accessibilityLabel="Colón, Entre Ríos"
                                        />
                                </View>
                                <Text style={styles.titulo}>Notificaciones</Text>
                                <Text style={styles.descripcion}>
                                        Elegí cuándo avisarte de los eventos y de
                                        los lugares cercanos.
                                </Text>
                        </View>

                        <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.contenido}
                        >
                                <Text style={styles.seccionTitulo}>
                                        Recordatorios de eventos
                                </Text>
                                <SelectorNumero
                                        etiqueta="Anticipación del recordatorio"
                                        detalle="Cuántas horas antes del comienzo querés recibir el aviso."
                                        valor={horas}
                                        minimo={1}
                                        maximo={5}
                                        paso={1}
                                        textoValor={(valor) =>
                                                `${valor} ${
                                                        valor === 1
                                                                ? "hora"
                                                                : "horas"
                                                } antes`
                                        }
                                        onCambiar={setHoras}
                                        deshabilitado={guardando}
                                />

                                <Text style={styles.seccionTitulo}>
                                        Avisos de cercanía
                                </Text>
                                <SelectorOpciones
                                        etiqueta="Distancia del aviso"
                                        detalle="Elegí una de las distancias admitidas por la API."
                                        valor={radio}
                                        opciones={[
                                                { valor: 100, texto: "100 m" },
                                                { valor: 250, texto: "250 m" },
                                                { valor: 500, texto: "500 m" },
                                        ]}
                                        onCambiar={setRadio}
                                        deshabilitado={guardando}
                                />
                                <SelectorNumero
                                        etiqueta="Cantidad por día"
                                        detalle="Limita cuántos avisos de cercanía querés recibir por día. Con 0 no se envían."
                                        valor={porDia}
                                        minimo={0}
                                        maximo={3}
                                        paso={1}
                                        textoValor={(valor) =>
                                                valor === 0
                                                        ? "Sin avisos"
                                                        : `${valor} ${
                                                                  valor === 1
                                                                          ? "aviso"
                                                                          : "avisos"
                                                          } por día`
                                        }
                                        onCambiar={setPorDia}
                                        deshabilitado={guardando}
                                />

                                <Text style={styles.ayuda}>
                                        Para activar o desactivar los avisos de
                                        cercanía, usá{" "}
                                        <Text
                                                style={styles.enlace}
                                                accessibilityRole="link"
                                                onPress={() =>
                                                        router.push(
                                                                "/mis-preferencias" as Href,
                                                        )
                                                }
                                        >
                                                Mis preferencias
                                        </Text>
                                        . Estos ajustes se guardan en este
                                        teléfono.
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
                                                        guardando || !hayCambios,
                                                busy: guardando,
                                        }}
                                        disabled={guardando || !hayCambios}
                                        onPress={() => void guardarAjustes()}
                                        style={[
                                                styles.guardar,
                                                (guardando || !hayCambios) &&
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
                                                        Guardar ajustes
                                                </Text>
                                        )}
                                </Pressable>
                        </ScrollView>
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                pantalla: { flex: 1, backgroundColor: colors.background },
                encabezadoFijo: {
                        flexShrink: 0,
                        backgroundColor: colors.background,
                        paddingHorizontal: 18,
                        paddingTop: 8,
                },
                cabecera: {
                        minHeight: 64,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
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
                contenido: {
                        paddingHorizontal: 18,
                        paddingBottom: 32,
                },
                seccionTitulo: {
                        ...tipografia.seccion,
                        color: colors.secondary,
                        marginTop: 18,
                        marginBottom: 10,
                },
                ayuda: {
                        ...tipografia.detalle,
                        color: colors.textSecondary,
                        lineHeight: 20,
                        marginTop: 4,
                },
                enlace: {
                        color: colors.primary,
                        textDecorationLine: "underline",
                        fontWeight: "600",
                },
                error: {
                        ...tipografia.detalle,
                        color: colors.error,
                        marginTop: 14,
                },
                guardar: {
                        minHeight: 48,
                        backgroundColor: colors.primarySolid,
                        borderRadius: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 24,
                },
                guardarTexto: {
                        ...tipografia.opcion,
                        color: colors.onPrimary,
                },
                deshabilitado: { opacity: 0.5 },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colorsInicio;
        return { colors, styles: crearEstilos(colors) };
}
