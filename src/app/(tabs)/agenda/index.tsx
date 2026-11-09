import { fuenteTitulo } from "../../../styles/inicio";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { logoPrincipal, tipografia } from "../../../styles/tipografia";
import { useTema } from "../../../context/tema.context";
import { useMemo, useState } from "react";
import {
        StyleSheet,
        Text,
        View,
        FlatList,
        TouchableOpacity,
        ScrollView,
        ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useEventos } from "../../../hooks/use-eventos";
import { EstadoCatalogo } from "../../../components/estado-catalogo";
import TarjetaEvento from "../../../components/tarjeta-evento";
import { colors as paletaColors } from "../../../styles/theme";
import {
        diaLocal,
        diaSemanaCorto,
        estadoVisible,
        numeroDeDia,
        ocurreEnDia,
        sumarDias,
} from "../../../services/fechas-eventos";

const ESTADOS = [
        "Todos",
        "Programados",
        "Suspendidos",
        "Cancelados",
        "Finalizados",
];

export default function AgendaScreen() {
        const { colors, styles } = useEstilos();

        const {
                datos,
                sinConexion,
                cargando,
                hayMas,
                cargarMas,
                actualizando,
                error,
                reintentar,
        } = useEventos();
        const eventos = datos ?? [];
        const ahora = new Date();
        const hoy = diaLocal(ahora);
        const fechasUnicas = useMemo(
                () =>
                        Array.from({ length: 14 }, (_, indice) =>
                                sumarDias(hoy, indice),
                        ),
                [hoy],
        );
        const [filtroFecha, setFiltroFecha] = useState<string | null>(
                fechasUnicas[0],
        );
        const [filtroEstado, setFiltroEstado] = useState("Todos");
        const router = useRouter();

        const eventosFiltrados = eventos.filter((evento) => {
                const coincideFecha =
                        filtroFecha === null ||
                        ocurreEnDia(evento, filtroFecha);
                const estadoEv = estadoVisible(evento, ahora);

                let coincideEstado = true;
                if (filtroEstado === "Programados")
                        coincideEstado = estadoEv === "programado";
                if (filtroEstado === "Suspendidos")
                        coincideEstado = estadoEv === "suspendido";
                if (filtroEstado === "Cancelados")
                        coincideEstado = estadoEv === "cancelado";
                if (filtroEstado === "Finalizados")
                        coincideEstado = estadoEv === "finalizado";

                return coincideFecha && coincideEstado;
        });

        const formatearDiaTab = (fechaStr: string) => ({
                diaSemana: diaSemanaCorto(fechaStr),
                numero: numeroDeDia(fechaStr),
        });

        return (
                <SafeAreaView
                        style={styles.container}
                        edges={["top", "left", "right"]}
                >
                        <View style={styles.header}>
                                <Image
                                        source={require("../../../../assets/images/logo-colon.png")}
                                        style={styles.logo}
                                        contentFit="contain"
                                        accessibilityLabel="Colón, Entre Ríos"
                                />
                                <Image
                                        source={require("../../../../assets/images/ilustracion-colon-puente.png")}
                                        style={styles.puente}
                                        contentFit="contain"
                                />
                                <Text style={styles.headerTitle}>Agenda</Text>
                                <Text style={styles.headerSubtitle}>
                                        Qué hacer en Colón
                                </Text>
                        </View>
                        <EstadoCatalogo
                                sinConexion={sinConexion}
                                recurso="eventos"
                        />

                        <View style={{ paddingHorizontal: 16 }}>
                                {cargando && (
                                        <ActivityIndicator
                                                color={colors.primary}
                                        />
                                )}
                        </View>
                        <View style={styles.filtersContainer}>
                                <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.dateTabs}
                                        contentContainerStyle={
                                                styles.fechasContenido
                                        }
                                >
                                        <TouchableOpacity
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                        selected:
                                                                filtroFecha ===
                                                                null,
                                                }}
                                                style={[
                                                        styles.dateTab,
                                                        filtroFecha === null &&
                                                                styles.dateTabSelected,
                                                ]}
                                                onPress={() =>
                                                        setFiltroFecha(null)
                                                }
                                        >
                                                <Text
                                                        style={[
                                                                styles.dateTabDay,
                                                                filtroFecha ===
                                                                        null &&
                                                                        styles.textWhite,
                                                        ]}
                                                >
                                                        Todos
                                                </Text>
                                        </TouchableOpacity>
                                        {fechasUnicas.map((fecha) => {
                                                const { diaSemana, numero } =
                                                        formatearDiaTab(fecha);
                                                const isSelected =
                                                        filtroFecha === fecha;
                                                return (
                                                        <TouchableOpacity
                                                                key={fecha}
                                                                style={[
                                                                        styles.dateTab,
                                                                        isSelected &&
                                                                                styles.dateTabSelected,
                                                                ]}
                                                                onPress={() =>
                                                                        setFiltroFecha(
                                                                                isSelected
                                                                                        ? null
                                                                                        : fecha,
                                                                        )
                                                                }
                                                        >
                                                                <Text
                                                                        style={[
                                                                                styles.dateTabDay,
                                                                                isSelected &&
                                                                                        styles.textWhite,
                                                                        ]}
                                                                >
                                                                        {fecha ===
                                                                        fechasUnicas[0]
                                                                                ? "HOY"
                                                                                : diaSemana.replace(
                                                                                          ".",
                                                                                          "",
                                                                                  )}
                                                                </Text>
                                                                <Text
                                                                        style={[
                                                                                styles.dateTabNumber,
                                                                                isSelected &&
                                                                                        styles.textWhite,
                                                                        ]}
                                                                >
                                                                        {numero}
                                                                </Text>
                                                        </TouchableOpacity>
                                                );
                                        })}
                                </ScrollView>

                                <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.statusPills}
                                        contentContainerStyle={
                                                styles.estadosContenido
                                        }
                                >
                                        {ESTADOS.map((estado) => (
                                                <TouchableOpacity
                                                        key={estado}
                                                        style={[
                                                                styles.statusPill,
                                                                filtroEstado ===
                                                                        estado &&
                                                                        styles.statusPillSelected,
                                                        ]}
                                                        onPress={() =>
                                                                setFiltroEstado(
                                                                        estado,
                                                                )
                                                        }
                                                >
                                                        <Text
                                                                style={[
                                                                        styles.statusPillText,
                                                                        filtroEstado ===
                                                                                estado &&
                                                                                styles.textWhite,
                                                                ]}
                                                        >
                                                                {estado}
                                                        </Text>
                                                </TouchableOpacity>
                                        ))}
                                </ScrollView>
                        </View>

                        <FlatList
                                data={eventosFiltrados}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                        <TarjetaEvento
                                                evento={item}
                                                onPress={() =>
                                                        router.push(
                                                                `/(tabs)/agenda/evento/${item.id}`,
                                                        )
                                                }
                                        />
                                )}
                                contentContainerStyle={styles.listContainer}
                                //@Itati aca hay otro bloque para revisar diseño, "Cargar más lugares"
                                ListFooterComponent={
                                        hayMas ? (
                                                <TouchableOpacity
                                                        accessibilityRole="button"
                                                        disabled={
                                                                actualizando ||
                                                                sinConexion
                                                        }
                                                        onPress={() => {
                                                                void cargarMas();
                                                        }}
                                                        style={styles.dateTab}
                                                >
                                                        <Text>
                                                                {actualizando
                                                                        ? "Cargando…"
                                                                        : "Cargar más eventos"}
                                                        </Text>
                                                </TouchableOpacity>
                                        ) : error && !sinConexion ? (
                                                <TouchableOpacity
                                                        accessibilityRole="button"
                                                        onPress={() => {
                                                                void reintentar();
                                                        }}
                                                        style={styles.dateTab}
                                                >
                                                        <Text>Reintentar</Text>
                                                </TouchableOpacity>
                                        ) : null
                                }
                                ListEmptyComponent={
                                        <Text style={styles.emptyText}>
                                                {cargando
                                                        ? "Cargando agenda…"
                                                        : datos === null
                                                          ? "Agenda aún no descargada. Conectate para descargarla."
                                                          : "No hay eventos para esta selección."}
                                        </Text>
                                }
                        />
                </SafeAreaView>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                container: {
                        flex: 1,
                        backgroundColor: colors.background,
                },
                header: {
                        backgroundColor: colors.background,
                        marginHorizontal: 18,
                        marginTop: 8,
                        flexShrink: 0,
                        marginBottom: 24,
                        minHeight: 130,
                        justifyContent: "flex-end",
                },
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
                headerTitle: {
                        ...tipografia.titulo,
                        fontFamily: fuenteTitulo,
                        color: colors.blueText,
                },
                headerSubtitle: {
                        ...tipografia.texto,
                        color: colors.greenText,
                        marginTop: 2,
                },
                filtersContainer: {
                        paddingBottom: 10,
                },

                dateTabs: { flexGrow: 0, marginBottom: 14 },
                fechasContenido: { paddingHorizontal: 18, gap: 8 },
                estadosContenido: { paddingHorizontal: 18, gap: 8 },
                dateTab: {
                        backgroundColor: colors.secondaryLight,
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        alignItems: "center",
                        minWidth: 58,
                        flexShrink: 0,
                        minHeight: 54,
                        justifyContent: "center",
                },
                dateTabSelected: { backgroundColor: colors.primarySolid },
                dateTabDay: {
                        minWidth: 34,
                        paddingHorizontal: 2,
                        textAlign: "center",
                        lineHeight: 18,
                        fontSize: 12,
                        color: colors.textSecondary,
                        fontWeight: "bold",
                },
                dateTabNumber: {
                        alignSelf: "stretch",
                        minWidth: 38,
                        paddingHorizontal: 2,
                        textAlign: "center",
                        lineHeight: 22,
                        fontSize: 16,
                        color: colors.text,
                        fontWeight: "bold",
                        marginTop: 2,
                },

                statusPills: { flexGrow: 0 },
                statusPill: {
                        backgroundColor: colors.secondaryLight,
                        borderRadius: 12,
                        paddingVertical: 6,
                        paddingHorizontal: 11,
                },
                statusPillSelected: { backgroundColor: colors.primarySolid },
                statusPillText: {
                        fontSize: 12,
                        color: colors.blueText,
                },
                textWhite: { color: colors.onPrimary },

                listContainer: {
                        paddingHorizontal: 18,
                        paddingTop: 8,
                        paddingBottom: 24,
                },
                emptyText: {
                        textAlign: "center",
                        color: colors.textSecondary,
                        marginTop: 20,
                },
        });
function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
