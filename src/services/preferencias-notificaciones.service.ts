import Storage from "expo-sqlite/kv-store";
import { Platform } from "react-native";
import { diaLocal } from "./fechas-eventos";

export interface PreferenciasNotificaciones {
        horasRecordatorioEvento: number;
        radioAvisoMetros: number;
        avisosProximidadPorDia: number;
}

export const RADIOS_AVISO = [100, 250, 500] as const;
export type RadioAviso = (typeof RADIOS_AVISO)[number];

export type CambiosPreferenciasNotificaciones =
        Partial<PreferenciasNotificaciones>;

export const PREFERENCIAS_NOTIFICACIONES_DEFAULT: PreferenciasNotificaciones =
        {
                horasRecordatorioEvento: 2,
                radioAvisoMetros: 500,
                avisosProximidadPorDia: 1,
        };

const oyentes = new Set<() => void>();
const clave = (usuarioId: string) => `notificaciones_v1_${usuarioId}`;
const claveAvisos = (usuarioId: string) =>
        `avisos_proximidad_v1_${usuarioId}`;

function limitar(valor: number, minimo: number, maximo: number): number {
        if (!Number.isFinite(valor)) return minimo;
        return Math.min(maximo, Math.max(minimo, Math.round(valor)));
}

function normalizarRadio(valor: number | undefined): RadioAviso {
        return valor === 100 || valor === 250 || valor === 500 ? valor : 500;
}

function normalizar(
        valor: CambiosPreferenciasNotificaciones,
): PreferenciasNotificaciones {
        return {
                horasRecordatorioEvento: limitar(
                        valor.horasRecordatorioEvento ??
                                PREFERENCIAS_NOTIFICACIONES_DEFAULT.horasRecordatorioEvento,
                        1,
                        5,
                ),
                radioAvisoMetros: normalizarRadio(valor.radioAvisoMetros),
                avisosProximidadPorDia: limitar(
                        valor.avisosProximidadPorDia ??
                                PREFERENCIAS_NOTIFICACIONES_DEFAULT.avisosProximidadPorDia,
                        0,
                        3,
                ),
        };
}

async function leerValor(claveValor: string): Promise<string | null> {
        if (Platform.OS === "web") {
                return typeof window === "undefined"
                        ? null
                        : localStorage.getItem(claveValor);
        }
        return Storage.getItem(claveValor);
}

async function escribirValor(
        claveValor: string,
        valor: string,
): Promise<void> {
        if (Platform.OS === "web") {
                if (typeof window !== "undefined")
                        localStorage.setItem(claveValor, valor);
                return;
        }
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

type RegistroAvisos = { dia: string; cantidad: number };

async function leerRegistroAvisos(
        usuarioId: string,
): Promise<RegistroAvisos> {
        try {
                const valor = await leerValor(claveAvisos(usuarioId));
                const registro = valor
                        ? (JSON.parse(valor) as RegistroAvisos)
                        : null;
                const hoy = diaLocal(new Date());
                if (!registro || registro.dia !== hoy)
                        return { dia: hoy, cantidad: 0 };
                return {
                        dia: hoy,
                        cantidad: Number.isFinite(registro.cantidad)
                                ? Math.max(0, registro.cantidad)
                                : 0,
                };
        } catch {
                return { dia: diaLocal(new Date()), cantidad: 0 };
        }
}

export async function puedeAvisarProximidad(
        usuarioId: string,
        limiteDiario: number,
): Promise<boolean> {
        if (limiteDiario <= 0) return false;
        const registro = await leerRegistroAvisos(usuarioId);
        return registro.cantidad < limiteDiario;
}

export async function registrarAvisoProximidad(
        usuarioId: string,
): Promise<void> {
        const registro = await leerRegistroAvisos(usuarioId);
        await escribirValor(
                claveAvisos(usuarioId),
                JSON.stringify({
                        dia: registro.dia,
                        cantidad: registro.cantidad + 1,
                }),
        );
}
