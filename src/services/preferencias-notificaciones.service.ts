import Storage from "expo-sqlite/kv-store";
import { diaLocal } from "./fechas-eventos";

export interface PreferenciasNotificaciones {
        horasRecordatorioEvento: number;
        radioAvisoMetros: number;
        avisosProximidadIntervalo: number;
}

export const RADIOS_AVISO = [100, 250, 500] as const;
export type RadioAviso = (typeof RADIOS_AVISO)[number];

export type CambiosPreferenciasNotificaciones =
        Partial<PreferenciasNotificaciones>;

export const PREFERENCIAS_NOTIFICACIONES_DEFAULT: PreferenciasNotificaciones =
        {
                horasRecordatorioEvento: 2,
                radioAvisoMetros: 500,
                avisosProximidadIntervalo: 1,
        };

const oyentes = new Set<() => void>();
const clave = (usuarioId: string) => `notificaciones_v1_${usuarioId}`;
const claveAvisos = (usuarioId: string) =>
        `ultimo_aviso_proximidad_v2_${usuarioId}`;

function limitar(valor: number, minimo: number, maximo: number): number {
        if (!Number.isFinite(valor)) return minimo;
        return Math.min(maximo, Math.max(minimo, Math.round(valor)));
}

function normalizarRadio(valor: number | undefined): RadioAviso {
        return valor === 100 || valor === 250 || valor === 500 ? valor : 500;
}

function normalizar(
        valor: CambiosPreferenciasNotificaciones & {
                intervaloAvisosProximidadMinutos?: number;
                avisosProximidadPorDia?: number;
        },
): PreferenciasNotificaciones {
        return {
                horasRecordatorioEvento: limitar(
                        valor.horasRecordatorioEvento ??
                                PREFERENCIAS_NOTIFICACIONES_DEFAULT.horasRecordatorioEvento,
                        1,
                        5,
                ),
                radioAvisoMetros: normalizarRadio(valor.radioAvisoMetros),
                avisosProximidadIntervalo: limitar(
                        valor.avisosProximidadIntervalo ??
                                valor.intervaloAvisosProximidadMinutos ??
                                valor.avisosProximidadPorDia ??
                                PREFERENCIAS_NOTIFICACIONES_DEFAULT.avisosProximidadIntervalo,
                        0,
                        5,
                ),
        };
}

async function leerValor(claveValor: string): Promise<string | null> {

        return Storage.getItem(claveValor);
}

async function escribirValor(
        claveValor: string,
        valor: string,
): Promise<void> {

        await Storage.setItem(claveValor, valor);
}

export function observarPreferenciasNotificaciones(oyente: () => void) {
        oyentes.add(oyente);
        return () => {
                oyentes.delete(oyente);
        };
}

export async function leerPreferenciasNotificaciones(
        usuarioId: string,
): Promise<PreferenciasNotificaciones> {
        try {
                const valor = await leerValor(clave(usuarioId));
                if (!valor) return { ...PREFERENCIAS_NOTIFICACIONES_DEFAULT };
                return normalizar(
                        JSON.parse(valor) as CambiosPreferenciasNotificaciones,
                );
        } catch {
                return { ...PREFERENCIAS_NOTIFICACIONES_DEFAULT };
        }
}

export async function guardarPreferenciasNotificaciones(
        usuarioId: string,
        cambios: CambiosPreferenciasNotificaciones,
): Promise<PreferenciasNotificaciones> {
        const actuales = await leerPreferenciasNotificaciones(usuarioId);
        const nuevo = normalizar({ ...actuales, ...cambios });
        await escribirValor(clave(usuarioId), JSON.stringify(nuevo));
        for (const oyente of oyentes) {
                try {
                        oyente();
                } catch (error) {
                        console.error(
                                "Error en observador de preferencias de notificaciones",
                                error,
                        );
                }
        }
        return nuevo;
}

/** El intervalo es global para todos los lugares y persiste entre sesiones. */
export async function puedeAvisarProximidad(
        usuarioId: string,
        intervaloMinutos: number,
): Promise<boolean> {
        if (!Number.isFinite(intervaloMinutos) || intervaloMinutos <= 0) return false;
        const valor = await leerValor(claveAvisos(usuarioId));
        if (!valor) return true;
        const ultimoAviso = Number(valor);
        return !Number.isFinite(ultimoAviso) ||
                Date.now() - ultimoAviso >= intervaloMinutos * 60 * 1000;
}

const claveAvisoLugar = (usuarioId: string, lugarId: string) =>
        `aviso_proximidad_lugar_v1_${JSON.stringify([usuarioId, lugarId])}`;

export async function puedeAvisarLugarHoy(
        usuarioId: string,
        lugarId: string,
): Promise<boolean> {
        const ultimoDia = await leerValor(claveAvisoLugar(usuarioId, lugarId));
        return ultimoDia !== diaLocal(new Date());
}

export async function registrarAvisoProximidad(
        usuarioId: string,
        lugarId: string,
): Promise<void> {
        await escribirValor(claveAvisoLugar(usuarioId, lugarId), diaLocal(new Date()));
        await escribirValor(claveAvisos(usuarioId), String(Date.now()));
}
