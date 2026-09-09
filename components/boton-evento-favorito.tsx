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
    // Guardamos el ID de la notificación por si el usuario se arrepiente y desmarca la estrella en la misma sesión
    const [notificacionId, setNotificacionId] = useState<string | null>(null);

    // Al montar el componente, verificamos si el evento ya está guardado en el KV-Store
    useEffect(() => {
        esFavoritoLocal(evento.id).then(estado => setEsFavorito(estado));
    }, [evento.id]);

    const toggleFavorito = async () => {
        const nuevoEstado = !esFavorito;
        setEsFavorito(nuevoEstado);

        if (nuevoEstado) {
            // 1. Guardar en SQLite local
            await guardarFavoritoLocal(evento.id);

            // 2. Calcular cuándo debe sonar la notificación
            const fechaEvento = new Date(evento.inicio);
            const esSinHorario = evento.inicio.includes("T00:00:00");

            let triggerDate = new Date(fechaEvento.getTime());

            if (esSinHorario) {
                // Si no tiene horario, avisamos a las 10:00 AM del mismo día del evento
                triggerDate.setHours(10, 0, 0, 0);
            } else {
                // Si tiene horario, avisamos 2 horas antes
                triggerDate.setHours(triggerDate.getHours() - 2);
            }

            // 3. Programar la notificación (solo si la fecha de aviso aún no pasó)
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
            // 1. Remover de SQLite local
            await removerFavoritoLocal(evento.id);

            // 2. Cancelar la notificación programada si existe
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
                color={esFavorito ? "#FFD700" : "#999"} // Amarillo dorado si es favorito, gris si no
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    starButton: {
        paddingLeft: 12,
        paddingBottom: 8,
        // Añadimos un pequeño padding extra para que sea más fácil tocar el icono con el dedo
        paddingTop: 4,
        paddingRight: 4,
    },
});