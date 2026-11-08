import { useTema } from "../context/tema.context";
import { useAuth } from "../context/auth.context";
import { useVolverPerfil } from "../hooks/use-volver-perfil";
import { useEventosGuardados } from "../hooks/use-eventos-guardados";
import { BotonVolver } from "../components/boton-volver";
import TarjetaEvento from "../components/tarjeta-evento";
import { EstadoPantalla } from "../components/estado-pantalla";
import { fuenteTitulo } from "../styles/inicio";
import { tipografia } from "../styles/tipografia";
import { colors as paleta } from "../styles/theme";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Image } from "expo-image";

export default function EventosGuardadosScreen() {
        const { colorsInicio: colors } = useTema();
        const styles = crearEstilos(colors);
        const volver = useVolverPerfil();
        const { status } = useAuth();
        const { eventos, cargando, error } = useEventosGuardados();
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
                                        Eventos guardados
                                </Text>
                                <Text style={styles.descripcion}>
                                        Las actividades que guardaste en tu
                                        agenda
                                </Text>
                        </View>
                        {status !== "autenticado" ? (
                                <EstadoPantalla
                                        tipo="vacio"
                                        titulo="Iniciá sesión"
                                        mensaje="Entrá a tu cuenta para consultar tus eventos guardados."
                                />
                        ) : (
                                <FlatList
                                        style={styles.scroll}
                                        data={eventos}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={styles.lista}
                                        ListHeaderComponent={
                                                error ? (
                                                        <Text
                                                                style={
                                                                        styles.error
                                                                }
                                                        >
                                                                {error} Si ya
                                                                tenés eventos
                                                                descargados,
                                                                podés seguir
                                                                consultándolos.
                                                        </Text>
                                                ) : null
                                        }
                                        renderItem={({ item }) => (
                                                <TarjetaEvento
                                                        evento={item}
                                                        onPress={() =>
                                                                router.push({
                                                                        pathname: "/(tabs)/agenda/evento/[id]",
                                                                        params: {
                                                                                id: item.id,
                                                                                origen: "eventos-guardados",
                                                                        },
                                                                })
                                                        }
                                                />
                                        )}
                                        ListFooterComponent={
                                                <Pressable
                                                        accessibilityRole="button"
                                                        onPress={() =>
                                                                router.navigate(
                                                                        "/(tabs)/agenda",
                                                                )
                                                        }
                                                        style={styles.explorar}
                                                >
                                                        <Text
                                                                style={
                                                                        styles.explorarTexto
                                                                }
                                                        >
                                                                Explorar más
                                                        </Text>
                                                </Pressable>
                                        }
                                        ListEmptyComponent={
                                                <EstadoPantalla
                                                        tipo={
                                                                cargando
                                                                        ? "cargando"
                                                                        : error
                                                                          ? "error"
                                                                          : "vacio"
                                                        }
                                                        titulo={
                                                                cargando
                                                                        ? "Cargando eventos…"
                                                                        : error
                                                                          ? "No pudimos actualizar tu agenda"
                                                                          : "Todavía no guardaste eventos"
                                                        }
                                                        mensaje={
                                                                error ??
                                                                "Podés agregarlos desde el detalle de un evento en Agenda."
                                                        }
                                                />
                                        }
                                />
                        )}
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paleta) =>
        StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.background },
                encabezado: {
                        paddingHorizontal: 18,
                        paddingTop: 8,
                        backgroundColor: colors.background,
                        flexShrink: 0,
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
                explorar: {
                        minHeight: 44,
                        marginTop: 14,
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: colors.primarySolid,
                        alignItems: "center",
                        justifyContent: "center",
                },
                explorarTexto: {
                        ...tipografia.opcion,
                        color: colors.onPrimary,
                },
                lista: {
                        paddingHorizontal: 18,
                        paddingBottom: 32,
                        flexGrow: 1,
                },
                error: {
                        ...tipografia.detalle,
                        color: colors.textSecondary,
                        marginBottom: 12,
                },
        });
