import { z } from "zod";
import Storage from "expo-sqlite/kv-store";
import { solicitarJson } from "./api/http";
import { eventoSchema } from "./api/eventos.api";
import { POR_PAGINA, validarPagina } from "./api/paginacion";
import { obtenerToken } from "./storage.service";
import { puedeConsultarApi } from "./red.service";
import { precargarImagenes } from "./imagenes.service";
import { FalloDatos, errorDatos } from "./errores";
import type { Evento } from "../types/evento";

type Copia = {
        eventos: Evento[];
        pendientes: Record<string, { guardar: boolean; evento: Evento }>;
};
const oyentes = new Set<() => void>();
const tareas = new Map<string, Promise<unknown>>();
const clave = (usuarioId: string) => `eventos_guardados_v1_${usuarioId}`;
const unoSchema = z.object({ datos: eventoSchema, meta: z.null() });

export function observarEventosGuardados(oyente: () => void) {
        oyentes.add(oyente);
        return () => {
                oyentes.delete(oyente);
        };
}

async function leer(usuarioId: string): Promise<Copia> {
        const valor = await Storage.getItem(clave(usuarioId));
        const copia = valor
                ? (JSON.parse(valor) as Partial<Copia>)
                : null;
        return {
                eventos: copia?.eventos ?? [],
                pendientes: copia?.pendientes ?? {},
        };
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
                        const respuesta = await solicitarJson(
                                `/yo/eventos-guardados/${encodeURIComponent(id)}`,
                                {
                                        metodo: pendiente.guardar
                                                ? "PUT"
                                                : "DELETE",
                                        token,
                                },
                        );
                        if (pendiente.guardar) {
                                const parseada = unoSchema.safeParse(respuesta);
                                if (!parseada.success)
                                        throw new FalloDatos({
                                                tipo: "contrato",
                                                codigo: "EVENTO_GUARDADO_INVALIDO",
                                                mensaje: "La API no devolvió el evento guardado.",
                                                reintentable: true,
                                        });
                                copia.eventos = copia.eventos.filter(
                                        (evento) => evento.id !== id,
                                );
                                copia.eventos.push(parseada.data.datos);
                        } else {
                                copia.eventos = copia.eventos.filter(
                                        (evento) => evento.id !== id,
                                );
                        }
                        delete copia.pendientes[id];
                        await escribir(usuarioId, copia);
                } catch (error) {
                        const codigo = errorDatos(error).codigo;
                        if (
                                codigo === "EVENTO_NO_VIGENTE" ||
                                codigo === "EVENTO_NO_ENCONTRADO"
                        ) {
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
        const urls = eventos
                .map((evento) => evento.imagenUrl)
                .filter((url): url is string => url !== null);
        if (urls.length)
                void precargarImagenes(urls).catch((error) =>
                        console.error(
                                "No se pudieron preparar las imágenes de los eventos guardados",
                                error,
                        ),
                );
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

                try {
                        await sincronizar(usuarioId);
                } catch (error) {
                        const codigo = errorDatos(error).codigo;
                        // El cambio ya quedó guardado en el teléfono. Si fue
                        // por red o sesión, se reintenta al recuperar la
                        // conexión; sólo se avisa si la API rechazó el evento.
                        if (
                                codigo === "EVENTO_NO_VIGENTE" ||
                                codigo === "EVENTO_NO_ENCONTRADO"
                        )
                                throw error;
                        if (__DEV__)
                                console.warn(
                                        "El cambio de evento guardado quedó pendiente",
                                        error,
                                );
                }
        });
}
