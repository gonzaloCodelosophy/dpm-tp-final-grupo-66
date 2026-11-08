import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";
import { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as Notifications from "expo-notifications";
import { Evento } from "../types/evento";
import { useAuth } from "../context/auth.context";
import { useEventosGuardados } from "../hooks/use-eventos-guardados";
import { cambiarEventoGuardado } from "../services/eventos-guardados.service";
import { errorDatos } from "../services/errores";

interface BotonEventoFavoritoProps {
        evento: Evento;
        compacto?: boolean;
}

export default function BotonEventoFavorito({
        evento,
        compacto = false,
}: BotonEventoFavoritoProps) {
        const { colors, styles } = useEstilos();

        const { usuario, status } = useAuth();
        const { eventos } = useEventosGuardados();
        const esFavorito = eventos.some((item) => item.id === evento.id);
        const [guardando, setGuardando] = useState(false);
        const [notificacionId, setNotificacionId] = useState<string | null>(
                null,
        );

        const toggleFavorito = async () => {
                const nuevoEstado = !esFavorito;
                if (status !== "autenticado" || !usuario) {
                        Alert.alert(
                                "Iniciá sesión",
                                "Necesitás iniciar sesión para guardar eventos en tu agenda.",
                        );
                        return;
                }
                if (guardando) return;
                setGuardando(true);
                try {
                        await cambiarEventoGuardado(
                                usuario.id,
                                evento,
                                nuevoEstado,
                        );

                        if (nuevoEstado) {
                                const fechaEvento = new Date(evento.inicio);
                                const esSinHorario =
                                        evento.inicio.includes("T00:00:00");
                                let triggerDate = new Date(
                                        fechaEvento.getTime(),
                                );

                                if (esSinHorario) {
                                        triggerDate.setHours(10, 0, 0, 0);
                                } else {
                                        triggerDate.setHours(
                                                triggerDate.getHours() - 2,
                                        );
                                }

                                if (triggerDate > new Date()) {
                                        const identifier =
                                                await Notifications.scheduleNotificationAsync(
                                                        {
                                                                content: {
                                                                        title: "¡Evento próximo!",
                                                                        body: `${evento.titulo} comienza pronto.`,
                                                                },
                                                                trigger: {
                                                                        type: Notifications
                                                                                .SchedulableTriggerInputTypes
                                                                                .DATE,
                                                                        date: triggerDate,
                                                                },
                                                        },
                                                );
                                        setNotificacionId(identifier);
                                }
                        } else {
                                if (notificacionId) {
                                        await Notifications.cancelScheduledNotificationAsync(
                                                notificacionId,
                                        );
                                        setNotificacionId(null);
                                }
                        }
                } catch (error) {
                        Alert.alert(
                                "Agenda guardada",
                                errorDatos(error).mensaje,
                        );
                } finally {
                        setGuardando(false);
                }
        };

        return (
                <TouchableOpacity
                        onPress={toggleFavorito}
                        disabled={guardando}
                        activeOpacity={0.7}
                        style={[
                                styles.button,
                                compacto && {
                                        paddingVertical: 10,
                                        minHeight: 44,
                                },
                                esFavorito
                                        ? styles.buttonAdded
                                        : styles.buttonAdd,
                        ]}
                >
                        <Ionicons
                                name={
                                        esFavorito
                                                ? "calendar-clear"
                                                : "calendar-outline"
                                }
                                size={20}
                                color={esFavorito ? "#fff" : colors.primary}
                        />
                        <Text
                                style={[
                                        styles.text,
                                        compacto && { fontSize: 14 },
                                        esFavorito
                                                ? styles.textAdded
                                                : styles.textAdd,
                                ]}
                        >
                                {esFavorito
                                        ? "Agregado a mi agenda"
                                        : "Agregar a mi agenda"}
                        </Text>
                </TouchableOpacity>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                button: {
                        width: "100%",
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                },
                buttonAdd: {
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                },
                buttonAdded: {
                        backgroundColor: colors.primarySolid,
                        borderColor: colors.primary,
                },
                text: {
                        fontSize: 16,
                        fontWeight: "bold",
                        marginLeft: 8,
                },
                textAdd: {
                        color: colors.primary,
                },
                textAdded: {
                        color: colors.onPrimary,
                },
        });
function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
