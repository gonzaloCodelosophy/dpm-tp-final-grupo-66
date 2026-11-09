import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Evento } from "../types/evento";
import { estadoVisible } from "./fechas-eventos";

const ETIQUETA_EVENTO = "eventoId";
const ETIQUETA_INICIO = "inicioEvento";
const ETIQUETA_VERSION = "versionRecordatorio";
const ETIQUETA_SIMULACION = "simulacion";
const VERSION_RECORDATORIO = 2;
const DOS_HORAS = 2 * 60 * 60 * 1000;
const CANAL_EVENTOS = "recordatorios-eventos";

async function asegurarCanal(): Promise<void> {
        if (Platform.OS !== "android") return;
        await Notifications.setNotificationChannelAsync(CANAL_EVENTOS, {
                name: "Recordatorios de eventos",
                importance: Notifications.AndroidImportance.HIGH,
        });
}

type DatosNotificacion = Record<string, unknown> | undefined;

let cola: Promise<unknown> = Promise.resolve();

function enCola<T>(accion: () => Promise<T>): Promise<T> {
        const tarea = cola.then(accion, accion);
        cola = tarea.catch(() => undefined);
        return tarea;
}

function idDeEvento(
        notificacion: Notifications.NotificationRequest,
): string | null {
        const datos = notificacion.content.data as DatosNotificacion;
        return typeof datos?.[ETIQUETA_EVENTO] === "string"
                ? datos[ETIQUETA_EVENTO]
                : null;
}

function inicioDeEvento(
        notificacion: Notifications.NotificationRequest,
): string | null {
        const datos = notificacion.content.data as DatosNotificacion;
        return typeof datos?.[ETIQUETA_INICIO] === "string"
                ? datos[ETIQUETA_INICIO]
                : null;
}

function versionDeRecordatorio(
        notificacion: Notifications.NotificationRequest,
): number | null {
        const datos = notificacion.content.data as DatosNotificacion;
        return typeof datos?.[ETIQUETA_VERSION] === "number"
                ? datos[ETIQUETA_VERSION]
                : null;
}

function esSimulacion(
        notificacion: Notifications.NotificationRequest,
): boolean {
        const datos = notificacion.content.data as DatosNotificacion;
        return datos?.[ETIQUETA_SIMULACION] === true;
}

function momentoDelRecordatorio(evento: Evento): Date | null {
        if (estadoVisible(evento) !== "programado") return null;
        const inicio = new Date(evento.inicio);
        if (Number.isNaN(inicio.getTime())) return null;
        const cuando = new Date(inicio.getTime() - DOS_HORAS);
        return cuando.getTime() > Date.now() ? cuando : null;
}

async function cancelarNotificaciones(
        notificaciones: Notifications.NotificationRequest[],
): Promise<void> {
        await Promise.all(
                notificaciones.map((notificacion) =>
                        Notifications.cancelScheduledNotificationAsync(
                                notificacion.identifier,
                        ),
                ),
        );
}

async function crearRecordatorio(
        evento: Evento,
        cuando: Date,
): Promise<void> {
        await asegurarCanal();
        await Notifications.scheduleNotificationAsync({
                content: {
                        title: "¡Evento próximo!",
                        body: `${evento.titulo} comienza en 2 horas.`,
                        data: {
                                [ETIQUETA_EVENTO]: evento.id,
                                [ETIQUETA_INICIO]: evento.inicio,
                                [ETIQUETA_VERSION]: VERSION_RECORDATORIO,
                        },
                },
                trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: cuando,
                        channelId: CANAL_EVENTOS,
                },
        });
}

async function sincronizar(
        eventos: Evento[],
        notificaciones: Notifications.NotificationRequest[],
): Promise<void> {
        const deseados = new Map<
                string,
                { evento: Evento; cuando: Date }
        >();
        for (const evento of eventos) {
                const cuando = momentoDelRecordatorio(evento);
                if (cuando) deseados.set(evento.id, { evento, cuando });
        }

        const conservar = new Set<string>();
        const cancelar: Notifications.NotificationRequest[] = [];

        for (const notificacion of notificaciones) {
                const id = idDeEvento(notificacion);
                if (!id) continue;
                // Las simulaciones se muestran enseguida y no se tocan desde
                // la sincronización de recordatorios reales.
                if (esSimulacion(notificacion)) continue;
                const deseado = deseados.get(id);
                if (
                        !deseado ||
                        inicioDeEvento(notificacion) !== deseado.evento.inicio ||
                        versionDeRecordatorio(notificacion) !==
                                VERSION_RECORDATORIO ||
                        conservar.has(id)
                ) {
                        cancelar.push(notificacion);
                        continue;
                }
                conservar.add(id);
        }

        await cancelarNotificaciones(cancelar);

        for (const [id, { evento, cuando }] of deseados) {
                if (conservar.has(id)) continue;
                await crearRecordatorio(evento, cuando);
        }
}

/**
 * Deja los recordatorios locales de todos los eventos guardados alineados con
 * la API: agenda una notificación dos horas antes del inicio y cancela las de
 * eventos quitados, suspendidos, cancelados o finalizados.
 */
export function sincronizarRecordatoriosEventos(
        eventos: Evento[],
): Promise<void> {
        if (Platform.OS === "web") return Promise.resolve();

        return enCola(async () => {
                const permiso = await Notifications.getPermissionsAsync();
                if (permiso.status !== "granted") return;
                const notificaciones =
                        await Notifications.getAllScheduledNotificationsAsync();
                await sincronizar(eventos, notificaciones);
        });
}

/**
 * Variante para un solo evento. Se usa cuando el detalle cambia el estado de
 * guardado antes de que el listado vuelva a leerse.
 */
export function sincronizarRecordatorioEvento(
        evento: Evento,
        guardado: boolean,
): Promise<void> {
        if (Platform.OS === "web") return Promise.resolve();

        return enCola(async () => {
                const notificaciones =
                        await Notifications.getAllScheduledNotificationsAsync();
                const propias = notificaciones.filter(
                        (notificacion) =>
                                idDeEvento(notificacion) === evento.id &&
                                !esSimulacion(notificacion),
                );

                if (!guardado) {
                        await cancelarNotificaciones(propias);
                        return;
                }

                const permiso = await Notifications.getPermissionsAsync();
                if (permiso.status !== "granted") return;

                await cancelarNotificaciones(propias);
                const cuando = momentoDelRecordatorio(evento);
                if (cuando) await crearRecordatorio(evento, cuando);
        });
}

/**
 * Dispara en el acto la notificación que se vería dos horas antes del evento.
 * Sirve para comprobar el texto, el canal y que al tocarla se abra el detalle.
 */
export async function simularRecordatorioEvento(evento: Evento): Promise<void> {
        if (Platform.OS === "web")
                throw new Error(
                        "Las notificaciones no están disponibles en la versión web.",
                );

        await asegurarCanal();

        let permiso = await Notifications.getPermissionsAsync();
        if (permiso.status !== "granted")
                permiso = await Notifications.requestPermissionsAsync();
        if (permiso.status !== "granted")
                throw new Error(
                        "Activá los permisos de notificaciones para poder probar el recordatorio.",
                );

        await Notifications.scheduleNotificationAsync({
                content: {
                        title: "¡Evento próximo!",
                        body: `${evento.titulo} comienza en 2 horas.`,
                        data: {
                                [ETIQUETA_EVENTO]: evento.id,
                                [ETIQUETA_INICIO]: evento.inicio,
                                [ETIQUETA_SIMULACION]: true,
                        },
                },
                trigger: {
                        type: Notifications.SchedulableTriggerInputTypes
                                .TIME_INTERVAL,
                        seconds: 1,
                        channelId: CANAL_EVENTOS,
                },
        });
}
