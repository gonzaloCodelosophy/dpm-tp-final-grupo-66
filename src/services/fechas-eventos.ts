import type { EstadoEvento, Evento } from "../types/evento";

/**
 * Toda la agenda de la API se calcula en hora de Buenos Aires. El teléfono puede
 * estar en otra zona, así que no conviene usar la zona del dispositivo.
 */
export const ZONA_EVENTOS = "America/Argentina/Buenos_Aires";
const OFFSET_BUENOS_AIRES = "-03:00";

const formatoDia = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_EVENTOS,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
});

const formatoHora = new Intl.DateTimeFormat("en-GB", {
        timeZone: ZONA_EVENTOS,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
});

const DIA_VALIDO = /^(\d{4})-(\d{2})-(\d{2})$/;

function partesDeDia(dia: string) {
        const partes = DIA_VALIDO.exec(dia);
        if (!partes) return null;
        const anio = Number(partes[1]);
        const mes = Number(partes[2]);
        const numero = Number(partes[3]);
        const fecha = new Date(Date.UTC(anio, mes - 1, numero));
        if (
                fecha.getUTCFullYear() !== anio ||
                fecha.getUTCMonth() !== mes - 1 ||
                fecha.getUTCDate() !== numero
        )
                return null;
        return { anio, mes, numero };
}

/** Instante → "AAAA-MM-DD" del día en Buenos Aires. */
export function diaLocal(fecha: Date | string | number): string {
        const instante = fecha instanceof Date ? fecha : new Date(fecha);
        if (Number.isNaN(instante.getTime())) {
                return typeof fecha === "string" ? fecha.slice(0, 10) : "";
        }
        const partes = formatoDia.formatToParts(instante);
        const valor = (tipo: string) =>
                partes.find((parte) => parte.type === tipo)?.value ?? "";
        return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/** "AAAA-MM-DD" + cantidad de días, sin pasar por la zona del dispositivo. */
export function sumarDias(dia: string, cantidad: number): string {
        const partes = partesDeDia(dia);
        if (!partes) return dia;
        const fecha = new Date(
                Date.UTC(partes.anio, partes.mes - 1, partes.numero + cantidad),
        );
        const anio = fecha.getUTCFullYear();
        const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
        const numero = String(fecha.getUTCDate()).padStart(2, "0");
        return `${anio}-${mes}-${numero}`;
}

/** 00:00 de un día en Buenos Aires (Argentina no tiene horario de verano). */
export function inicioDelDia(dia: string): Date {
        return new Date(`${dia}T00:00:00${OFFSET_BUENOS_AIRES}`);
}

/** 00:00 del día siguiente: límite exclusivo del día. */
export function finDelDia(dia: string): Date {
        return inicioDelDia(sumarDias(dia, 1));
}

/**
 * Fin real del evento. Si no tiene `fin`, la API lo cuenta hasta las 23:59:59
 * del día de `inicio`.
 */
export function finEfectivo(evento: Pick<Evento, "inicio" | "fin">): Date {
        if (evento.fin) {
                const fin = new Date(evento.fin);
                if (!Number.isNaN(fin.getTime())) return fin;
        }
        const inicio = new Date(evento.inicio);
        if (Number.isNaN(inicio.getTime())) return new Date(Number.NaN);
        return new Date(
                `${diaLocal(inicio)}T23:59:59${OFFSET_BUENOS_AIRES}`,
        );
}

/**
 * La API devuelve `finalizado` calculado, pero una copia guardada puede haber
 * quedado con `programado`. Se recalcula con el mismo criterio de la API.
 */
export function estadoVisible(
        evento: Pick<Evento, "inicio" | "fin" | "estado">,
        ahora: Date = new Date(),
): EstadoEvento {
        if (evento.estado !== "programado") return evento.estado;
        const fin = finEfectivo(evento);
        if (Number.isNaN(fin.getTime())) return evento.estado;
        return fin.getTime() < ahora.getTime() ? "finalizado" : "programado";
}

/** ¿El intervalo del evento toca el día indicado? Incluye los eventos que cruzan la medianoche. */
export function ocurreEnDia(
        evento: Pick<Evento, "inicio" | "fin">,
        dia: string,
): boolean {
        const inicio = new Date(evento.inicio);
        if (Number.isNaN(inicio.getTime())) return false;
        return (
                inicio.getTime() < finDelDia(dia).getTime() &&
                finEfectivo(evento).getTime() > inicioDelDia(dia).getTime()
        );
}

/** La API representa "sin horario" con las 00:00 del día de inicio. */
export function esSinHorario(inicio: string): boolean {
        const instante = new Date(inicio);
        if (Number.isNaN(instante.getTime())) return false;
        return formatoHora.format(instante).startsWith("00:00:00");
}

const formatoFechaCorta = new Intl.DateTimeFormat("es-AR", {
        timeZone: ZONA_EVENTOS,
        day: "2-digit",
        month: "short",
});

function fechaCorta(instante: Date): string {
        const partes = formatoFechaCorta.formatToParts(instante);
        const valor = (tipo: string) =>
                partes.find((parte) => parte.type === tipo)?.value ?? "";
        return `${valor("day")} ${valor("month").replace(".", "")}`;
}

function fechaLarga(instante: Date): string {
        return instante.toLocaleDateString("es-AR", {
                timeZone: ZONA_EVENTOS,
                day: "numeric",
                month: "long",
        });
}

function horaLocal(instante: Date): string {
        return instante.toLocaleTimeString("es-AR", {
                timeZone: ZONA_EVENTOS,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
        });
}

/**
 * Texto de fecha para la tarjeta y el detalle. Los eventos que cruzan la
 * medianoche se muestran como rango (por ejemplo, 21:00 al 02:00 del día siguiente).
 */
export function formatearFechaEvento(
        evento: Pick<Evento, "inicio" | "fin">,
        largo = false,
): string {
        const inicio = new Date(evento.inicio);
        if (Number.isNaN(inicio.getTime())) return "";
        const fin = evento.fin ? new Date(evento.fin) : null;
        const sinHorario = esSinHorario(evento.inicio);
        const fechaDe = largo ? fechaLarga : fechaCorta;
        const textoInicio = sinHorario
                ? fechaDe(inicio)
                : `${fechaDe(inicio)}, ${horaLocal(inicio)}`;

        if (fin && !Number.isNaN(fin.getTime())) {
                if (diaLocal(inicio) === diaLocal(fin)) {
                        return sinHorario
                                ? `${textoInicio} · hasta las ${horaLocal(fin)}`
                                : `${textoInicio} a ${horaLocal(fin)}`;
                }
                return `${textoInicio} al ${fechaDe(fin)}, ${horaLocal(fin)}`;
        }

        return `${textoInicio}${sinHorario ? " · Sin horario" : ""}`;
}

/** El día de la semana corto ("LUN", "MAR", …) para las pestañas de la agenda. */
export function diaSemanaCorto(dia: string): string {
        return new Date(`${dia}T12:00:00${OFFSET_BUENOS_AIRES}`)
                .toLocaleDateString("es-AR", {
                        timeZone: ZONA_EVENTOS,
                        weekday: "short",
                })
                .replace(".", "")
                .toUpperCase();
}

/** Número de día del mes ("09" → 9) sin depender de la zona del dispositivo. */
export function numeroDeDia(dia: string): number {
        return Number(dia.slice(8, 10));
}
