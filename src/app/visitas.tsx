import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../context/auth.context";
import { EstadoPantalla } from "../components/estado-pantalla";
import { obtenerLugares } from "../services/lugares.service";
import { obtenerHistorialVisitas } from "../services/visitas.service";
import { colors, spacing, fontSize, borderRadius } from "../styles/theme";
import type { Visita } from "../types/Visita";

interface VisitaConNombre extends Visita {
        nombreLugar: string;
}

function fechaLegible(fecha: string) {
        const valor = new Date(fecha);
        return `${valor.toLocaleDateString("es-AR")} · ${valor.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
}

const origenLegible: Record<Visita["origen"], string> = {
        qr: "Código QR",
        gps: "Cercanía",
        manual: "Registro manual",
};

export default function VisitasScreen() {
        const router = useRouter();
        const { usuario, status } = useAuth();
        const [visitas, setVisitas] = useState<VisitaConNombre[]>([]);
        const [cargando, setCargando] = useState(true);
        const [error, setError] = useState(false);

        const cargarHistorial = useCallback(async () => {
                if (status !== "autenticado" || !usuario) {
                        setCargando(false);
                        return;
                }

                setCargando(true);
                setError(false);
                try {
                        const historial = await obtenerHistorialVisitas(
                                usuario.id,
                        );
                        let nombres = new Map<string, string>();
                        try {
                                const lugares = await obtenerLugares();
                                nombres = new Map(
                                        lugares.map((lugar) => [
                                                lugar.id,
                                                lugar.nombre,
                                        ]),
                                );
                        } catch {
                                // @gonzalo: muestro las visitas aunque no pueda cargar los nombres del catálogo, te parece bien?
                        }

                        setVisitas(
                                historial.map((visita) => ({
                                        ...visita,
                                        nombreLugar:
                                                nombres.get(visita.lugarId) ??
                                                "Lugar visitado",
                                })),
                        );
                } catch {
                        setError(true);
                } finally {
                        setCargando(false);
                }
        }, [status, usuario]);

        useFocusEffect(
                useCallback(() => {
                        void cargarHistorial();
                }, [cargarHistorial]),
        );

        if (status !== "autenticado" || !usuario) {
                return (
                        <View style={styles.container}>
                                <Pressable
                                        style={styles.volver}
                                        onPress={() => router.back()}
                                        accessibilityRole="button"
                                        accessibilityLabel="Volver"
                                >
                                        <Ionicons
                                                name="arrow-back"
                                                size={22}
                                                color={colors.secondary}
                                        />
                                </Pressable>
                                <EstadoPantalla
                                        tipo="error"
                                        titulo="Iniciá sesión"
                                        mensaje="Necesitás una cuenta para consultar tu historial de visitas."
                                        accion="Iniciar sesión"
                                        onPress={() =>
                                                router.push(
                                                        "/(auth)/login" as any,
                                                )
                                        }
                                />
                        </View>
                );
        }

        return (
                <View style={styles.container}>
                        <View style={styles.header}>
                                <Pressable
                                        style={styles.volver}
                                        onPress={() => router.back()}
                                        accessibilityRole="button"
                                        accessibilityLabel="Volver"
                                >
                                        <Ionicons
                                                name="arrow-back"
                                                size={22}
                                                color={colors.secondary}
                                        />
                                </Pressable>
                                <Text style={styles.titulo}>Mi recorrido</Text>
                                <Pressable
                                        style={styles.recargar}
                                        onPress={() => void cargarHistorial()}
                                        accessibilityRole="button"
                                        accessibilityLabel="Actualizar historial"
                                >
                                        <Ionicons
                                                name="refresh"
                                                size={21}
                                                color={colors.secondary}
                                        />
                                </Pressable>
                        </View>

                        {cargando ? (
                                <EstadoPantalla tipo="cargando" />
                        ) : error ? (
                                <EstadoPantalla
                                        tipo="error"
                                        mensaje="No pudimos cargar tu historial. Revisá la conexión e intentá de nuevo."
                                        onPress={() => void cargarHistorial()}
                                />
                        ) : visitas.length === 0 ? (
                                <EstadoPantalla
                                        tipo="vacio"
                                        titulo="Todavía no registraste visitas"
                                        mensaje="Cuando registres una visita, va a aparecer acá."
                                />
                        ) : (
                                <FlatList
                                        data={visitas}
                                        keyExtractor={(visita) => visita.id}
                                        contentContainerStyle={styles.lista}
                                        renderItem={({ item }) => (
                                                <View style={styles.tarjeta}>
                                                        <View
                                                                style={
                                                                        styles.icono
                                                                }
                                                        >
                                                                <Ionicons
                                                                        name="location-outline"
                                                                        size={
                                                                                22
                                                                        }
                                                                        color={
                                                                                colors.secondary
                                                                        }
                                                                />
                                                        </View>
                                                        <View
                                                                style={
                                                                        styles.detalle
                                                                }
                                                        >
                                                                <Text
                                                                        style={
                                                                                styles.nombre
                                                                        }
                                                                >
                                                                        {
                                                                                item.nombreLugar
                                                                        }
                                                                </Text>
                                                                <Text
                                                                        style={
                                                                                styles.fecha
                                                                        }
                                                                >
                                                                        {fechaLegible(
                                                                                item.fechaHora,
                                                                        )}
                                                                </Text>
                                                                <Text
                                                                        style={
                                                                                styles.origen
                                                                        }
                                                                >
                                                                        {
                                                                                origenLegible[
                                                                                        item
                                                                                                .origen
                                                                                ]
                                                                        }
                                                                </Text>
                                                        </View>
                                                </View>
                                        )}
                                />
                        )}
                </View>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: spacing.xl,
        },
        header: {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.md,
                paddingBottom: spacing.md,
                gap: spacing.sm,
        },
        volver: {
                width: 42,
                height: 42,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
        },
        titulo: {
                flex: 1,
                color: colors.secondary,
                fontSize: fontSize.title,
                fontWeight: "700",
        },
        recargar: {
                width: 42,
                height: 42,
                alignItems: "center",
                justifyContent: "center",
        },
        lista: { padding: spacing.md, gap: spacing.sm },
        tarjeta: {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
        },
        icono: {
                width: 44,
                height: 44,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.secondaryLight,
                alignItems: "center",
                justifyContent: "center",
        },
        detalle: { flex: 1, gap: spacing.xs },
        nombre: {
                color: colors.text,
                fontSize: fontSize.body,
                fontWeight: "700",
        },
        fecha: { color: colors.textSecondary, fontSize: fontSize.caption },
        origen: { color: colors.secondary, fontSize: fontSize.caption },
});
