import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";
import { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as Notifications from "expo-notifications";
import { Evento } from "../types/evento";
import {
        guardarFavoritoLocal,
        removerFavoritoLocal,
        esFavoritoLocal,
} from "../services/storage.service";

interface BotonEventoFavoritoProps {
        evento: Evento;
}

export default function BotonEventoFavorito({
        evento,
}: BotonEventoFavoritoProps) {
        const { colors, styles } = useEstilos();

        const [esFavorito, setEsFavorito] = useState(false);
        const [notificacionId, setNotificacionId] = useState<string | null>(
                null,
        );

        useEffect(() => {
                esFavoritoLocal(evento.id).then((estado) =>
                        setEsFavorito(estado),
                );
        }, [evento.id]);

        const toggleFavorito = async () => {
                const nuevoEstado = !esFavorito;
                setEsFavorito(nuevoEstado);

                if (nuevoEstado) {
                        await guardarFavoritoLocal(evento.id);
                        const fechaEvento = new Date(evento.inicio);
                        const esSinHorario =
                                evento.inicio.includes("T00:00:00");
                        let triggerDate = new Date(fechaEvento.getTime());

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
                        await removerFavoritoLocal(evento.id);
                        if (notificacionId) {
                                await Notifications.cancelScheduledNotificationAsync(
                                        notificacionId,
                                );
                                setNotificacionId(null);
                        }
                }
        };

        return (
                <TouchableOpacity
                        onPress={toggleFavorito}
                        activeOpacity={0.7}
                        style={[
                                styles.button,
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
