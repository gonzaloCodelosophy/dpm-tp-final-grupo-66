import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Evento } from "../types/evento";
import {
        diaLocal,
        esSinHorario,
        estadoVisible,
} from "./fechas-eventos";

const ETIQUETA_EVENTO = "eventoId";
const DOS_HORAS = 2 * 60 * 60 * 1000;

async function cancelarRecordatorioEvento(eventoId: string): Promise<void> {
        if (Platform.OS === "web") return;

        const programadas =
                await Notifications.getAllScheduledNotificationsAsync();
        const propias = programadas.filter((notificacion) => {
                const datos = notificacion.content.data as
                        | Record<string, unknown>
                        | undefined;
                return datos?.[ETIQUETA_EVENTO] === eventoId;
        });

        await Promise.all(
                propias.map((notificacion) =>
                        Notifications.cancelScheduledNotificationAsync(
                                notificacion.identifier,
                        ),
                ),
        );
}

async function programarRecordatorioEvento(evento: Evento): Promise<void> {
        if (Platform.OS === "web") return;

        // Siempre se cancela el anterior: si el evento se reprogramó, no debe
        // quedar el aviso de la fecha vieja.
        await cancelarRecordatorioEvento(evento.id);

        const inicio = new Date(evento.inicio);
        if (Number.isNaN(inicio.getTime())) return;
        if (estadoVisible(evento) !== "programado") return;

        const cuando = esSinHorario(evento.inicio)
                ? new Date(`${diaLocal(inicio)}T10:00:00-03:00`)
                : new Date(inicio.getTime() - DOS_HORAS);

        if (cuando.getTime() <= Date.now()) return;

        const permiso = await Notifications.getPermissionsAsync();
        if (permiso.status !== "granted") return;

        await Notifications.scheduleNotificationAsync({
                content: {
                        title: "¡Evento próximo!",
                        body: `${evento.titulo} comienza pronto.`,
                        data: { [ETIQUETA_EVENTO]: evento.id },
                },
                trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: cuando,
                },
        });
}

/**
 * Deja el recordatorio local alineado con la copia actual del evento:
 * sólo los eventos guardados y programados tienen aviso. Los suspendidos,
 * cancelados o finalizados se cancelan.
 */
export async function sincronizarRecordatorioEvento(
        evento: Evento,
        guardado: boolean,
): Promise<void> {
        if (!guardado) {
                await cancelarRecordatorioEvento(evento.id);
                return;
        }

        await programarRecordatorioEvento(evento);
}
