import { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import * as Notifications from 'expo-notifications';
import { Evento } from '../types/evento';
import { guardarFavoritoLocal, removerFavoritoLocal, esFavoritoLocal } from '../services/storage.service';

interface BotonEventoFavoritoProps {
    evento: Evento;
}

export default function BotonEventoFavorito({ evento }: BotonEventoFavoritoProps) {
    const [esFavorito, setEsFavorito] = useState(false);
    const [notificacionId, setNotificacionId] = useState<string | null>(null);

    useEffect(() => {
        esFavoritoLocal(evento.id).then(estado => setEsFavorito(estado));
    }, [evento.id]);

    const toggleFavorito = async () => {
        const nuevoEstado = !esFavorito;
        setEsFavorito(nuevoEstado);

        if (nuevoEstado) {
            await guardarFavoritoLocal(evento.id);

            const fechaEvento = new Date(evento.inicio);
            const esSinHorario = evento.inicio.includes("T00:00:00");

            let triggerDate = new Date(fechaEvento.getTime());

            if (esSinHorario) {
                triggerDate.setHours(10, 0, 0, 0);
            } else {
                triggerDate.setHours(triggerDate.getHours() - 2);
            }

            if (triggerDate > new Date()) {
                const identifier = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "¡Evento próximo!",
                        body: `${evento.titulo} comienza pronto.`,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate,
                    },
                });
                setNotificacionId(identifier);
            }
        } else {
            await removerFavoritoLocal(evento.id);

            if (notificacionId) {
                await Notifications.cancelScheduledNotificationAsync(notificacionId);
                setNotificacionId(null);
            }
        }
    };

    return (
        <TouchableOpacity onPress={toggleFavorito} activeOpacity={0.7} style={styles.starButton}>
            <Ionicons
                name={esFavorito ? "star" : "star-outline"}
                size={28}
                color={esFavorito ? "#FFD700" : "#999"}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    starButton: {
        paddingLeft: 12,
        paddingBottom: 8,
        paddingTop: 4,
        paddingRight: 4,
    },
});