import { z } from "zod";
import Storage from "expo-sqlite/kv-store";
import { solicitarJson } from "./api/http";
import { eventoSchema } from "./api/eventos.api";
import { POR_PAGINA, validarPagina } from "./api/paginacion";
import { obtenerToken } from "./storage.service";
import { puedeConsultarApi } from "./red.service";
import { errorDatos } from "./errores";
import type { Evento } from "../types/evento";

type Copia = {
        eventos: Evento[];
        pendientes: Record<string, { guardar: boolean; evento: Evento }>;
};
const oyentes = new Set<() => void>();
const tareas = new Map<string, Promise<unknown>>();
const clave = (usuarioId: string) => `eventos_guardados_v1_${usuarioId}`;

export function observarEventosGuardados(oyente: () => void) {
        oyentes.add(oyente);
        return () => {
                oyentes.delete(oyente);
        };
}

async function leer(usuarioId: string): Promise<Copia> {
        const valor = await Storage.getItem(clave(usuarioId));
        return valor ? JSON.parse(valor) : { eventos: [], pendientes: {} };
}

async function escribir(usuarioId: string, copia: Copia) {
        await Storage.setItem(clave(usuarioId), JSON.stringify(copia));
        for (const oyente of oyentes) oyente();
}

function exclusivo<T>(usuarioId: string, accion: () => Promise<T>): Promise<T> {
        const anterior = tareas.get(usuarioId) ?? Promise.resolve();
        const tarea = anterior.then(accion, accion);
        tareas.set(usuarioId, tarea);
        void tarea
                .finally(() => {
                        if (tareas.get(usuarioId) === tarea)
                                tareas.delete(usuarioId);
                })
                .catch((error) =>
                        console.error(
                                "No se pudo actualizar la agenda guardada",
                                error,
                        ),
                );
        return tarea;
}

export async function leerEventosGuardados(usuarioId: string) {
        return (await leer(usuarioId)).eventos.sort(
                (a, b) => Date.parse(a.inicio) - Date.parse(b.inicio),
        );
}

async function sincronizar(usuarioId: string) {
        if (!(await puedeConsultarApi())) return;
        const token = await obtenerToken();
        if (!token)
                throw new Error(
                        "Iniciá sesión para consultar tus eventos guardados.",
                );
        const yo = z
                .object({ datos: z.object({ id: z.string() }) })
                .parse(await solicitarJson("/yo", { token }));
        if (yo.datos.id !== usuarioId || (await obtenerToken()) !== token)
                throw new Error(
                        "La sesión cambió. Volvé a entrar a tu agenda.",
                );
        const copia = await leer(usuarioId);
        for (const [id, pendiente] of Object.entries(copia.pendientes)) {
                try {
                        await solicitarJson(
                                `/yo/eventos-guardados/${encodeURIComponent(id)}`,
                                {
                                        metodo: pendiente.guardar
                                                ? "PUT"
                                                : "DELETE",
                                        token,
                                },
                        );
                        delete copia.pendientes[id];
                        await escribir(usuarioId, copia);
                } catch (error) {
                        if (errorDatos(error).codigo === "EVENTO_NO_VIGENTE") {
                                delete copia.pendientes[id];
                                copia.eventos = copia.eventos.filter(
                                        (evento) => evento.id !== id,
                                );
                                await escribir(usuarioId, copia);
                        }
                        throw error;
                }
        }
        const eventos: Evento[] = [];
        let pagina = 1;
        let total = 0;
        do {
                const respuesta = validarPagina(
                        await solicitarJson(
                                `/yo/eventos-guardados?pagina=${pagina}&porPagina=${POR_PAGINA}`,
                                { token },
                        ),
                        eventoSchema,
                        pagina,
                );
                eventos.push(...respuesta.datos);
                total = respuesta.meta.total;
                pagina += 1;
        } while (eventos.length < total);
        await escribir(usuarioId, { eventos, pendientes: {} });
}

export function actualizarEventosGuardados(usuarioId: string) {
        return exclusivo(usuarioId, () => sincronizar(usuarioId));
}

export function cambiarEventoGuardado(
        usuarioId: string,
        evento: Evento,
        guardar: boolean,
) {
        return exclusivo(usuarioId, async () => {
                const copia = await leer(usuarioId);
                copia.eventos = copia.eventos.filter(
                        (item) => item.id !== evento.id,
                );
                if (guardar) copia.eventos.push(evento);
                copia.pendientes[evento.id] = { guardar, evento };
                await escribir(usuarioId, copia);
                await sincronizar(usuarioId);
        });
}
