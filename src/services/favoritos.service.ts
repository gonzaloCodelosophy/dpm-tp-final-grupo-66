import Storage from "expo-sqlite/kv-store";
import { z } from "zod";
import { solicitarJson } from "./api/http";
import { puedeConsultarApi } from "./red.service";
import { obtenerToken } from "./storage.service";

export interface EstadoFavorito {
        lugarId: string;
        favorito: boolean;
        actualizadoEn: string;
        pendiente: boolean;
}
type FavoritosLocales = Record<string, EstadoFavorito>;
const oyentes = new Set<() => void>();
const escrituras = new Map<string, Promise<unknown>>();
const envios = new Map<string, Promise<void>>();
const errores = new Map<string, string>();
const favoritoSchema = z.object({
        id: z.string(),
        usuarioId: z.string(),
        lugarId: z.string(),
        creadoEn: z.iso.datetime({ offset: true }),
});
const paginaSchema = z.object({
        datos: z.array(favoritoSchema),
        meta: z.object({
                total: z.number().int().nonnegative(),
                pagina: z.number().int().positive(),
                porPagina: z.number().int().positive(),
        }),
});
const unoSchema = z.object({ datos: favoritoSchema, meta: z.null() });
const clave = (usuarioId: string | null) =>
        `favoritos_v2_${usuarioId ?? "visitante"}`;
const publicar = () => {
        for (const oyente of oyentes) oyente();
};

export function observarFavoritos(oyente: () => void) {
        oyentes.add(oyente);
        return () => {
                oyentes.delete(oyente);
        };
}

async function leer(usuarioId: string | null): Promise<FavoritosLocales> {
        const valor =
                await Storage.getItem(clave(usuarioId));
        return valor ? JSON.parse(valor) : {};
}

async function escribir(usuarioId: string | null, estados: FavoritosLocales) {
        const valor = JSON.stringify(estados);
        await Storage.setItem(clave(usuarioId), valor);
}

async function exclusivo<T>(
        usuarioId: string | null,
        accion: () => Promise<T>,
): Promise<T> {
        const id = clave(usuarioId);
        const anterior = escrituras.get(id) ?? Promise.resolve();
        const tarea = anterior
                .catch(() => {
                })
                .then(accion);
        escrituras.set(id, tarea);
        try {
                return await tarea;
        } finally {
                if (escrituras.get(id) === tarea) escrituras.delete(id);
        }
}

export async function leerEstadoFavoritos(usuarioId: string | null) {
        return exclusivo(usuarioId, async () => ({
                estados: await leer(usuarioId),
                errorSincronizacion: usuarioId
                        ? (errores.get(usuarioId) ?? null)
                        : null,
        }));
}

export async function guardarFavorito(
        id: string,
        favorito: boolean,
        usuarioId: string | null,
): Promise<void> {
        await exclusivo(usuarioId, async () => {
                const estados = await leer(usuarioId);
                const anterior = estados[id];
                const instante = Math.max(
                        Date.now(),
                        anterior ? Date.parse(anterior.actualizadoEn) + 1 : 0,
                );
                estados[id] = {
                        lugarId: id,
                        favorito,
                        actualizadoEn: new Date(instante).toISOString(),
                        pendiente: usuarioId !== null,
                };
                await escribir(usuarioId, estados);
        });
        publicar();
        if (usuarioId)
                void sincronizarFavoritos(usuarioId).catch(() => {
                });
}

export function sincronizarFavoritos(usuarioId: string): Promise<void> {
        const previa = envios.get(usuarioId);
        if (previa) return previa;
        const tarea = (async () => {
                if (!(await puedeConsultarApi())) return;
                const token = await obtenerToken();
                if (!token) return;

                const yo = z
                        .object({ datos: z.object({ id: z.string() }) })
                        .parse(await solicitarJson("/yo", { token }));
                if (
                        yo.datos.id !== usuarioId ||
                        (await obtenerToken()) !== token
                )
                        return;
                for (;;) {
                        const { estados } =
                                await leerEstadoFavoritos(usuarioId);
                        const cambios = Object.values(estados)
                                .filter((e) => e.pendiente)
                                .slice(0, 100)
                                .map(
                                        ({
                                                lugarId,
                                                favorito,
                                                actualizadoEn,
                                        }) => ({
                                                lugarId,
                                                favorito,
                                                actualizadoEn,
                                        }),
                                );
                        if ((await obtenerToken()) !== token) return;
                        const remotos: FavoritosLocales = {};
                        for (let pagina = 1; ; pagina++) {
                                if ((await obtenerToken()) !== token) return;
                                const respuesta = paginaSchema.parse(
                                        await solicitarJson(
                                                `/yo/favoritos?pagina=${pagina}&porPagina=100`,
                                                {
                                                        token,
                                                },
                                        ),
                                );
                                if (
                                        respuesta.meta.pagina !== pagina ||
                                        respuesta.meta.porPagina !== 100 ||
                                        respuesta.datos.some(
                                                (f) =>
                                                        f.usuarioId !==
                                                        usuarioId,
                                        )
                                )
                                        throw new Error(
                                                "Respuesta de favoritos inconsistente.",
                                        );
                                const esperados = Math.min(
                                        100,
                                        Math.max(
                                                0,
                                                respuesta.meta.total -
                                                        (pagina - 1) * 100,
                                        ),
                                );
                                if (respuesta.datos.length !== esperados)
                                        throw new Error(
                                                "La lista de favoritos está incompleta.",
                                        );
                                for (const f of respuesta.datos)
                                        remotos[f.lugarId] = {
                                                lugarId: f.lugarId,
                                                favorito: true,
                                                actualizadoEn: new Date(
                                                        f.creadoEn,
                                                ).toISOString(),
                                                pendiente: false,
                                        };
                                if (pagina * 100 >= respuesta.meta.total) break;
                        }
                        for (const cambio of cambios) {
                                if ((await obtenerToken()) !== token) return;
                                const remoto = remotos[cambio.lugarId];
                                let confirmado = remoto;
                                let huboEscritura = false;
                                if (
                                        !remoto ||
                                        remoto.actualizadoEn <=
                                                cambio.actualizadoEn
                                ) {
                                        if (cambio.favorito) {
                                                const respuesta =
                                                        unoSchema.parse(
                                                                await solicitarJson(
                                                                        `/yo/favoritos/${encodeURIComponent(cambio.lugarId)}`,
                                                                        {
                                                                                metodo: "PUT",
                                                                                token,
                                                                        },
                                                                ),
                                                        );
                                                if (
                                                        respuesta.datos
                                                                .usuarioId !==
                                                                usuarioId ||
                                                        respuesta.datos
                                                                .lugarId !==
                                                                cambio.lugarId
                                                )
                                                        throw new Error(
                                                                "La API confirmó otro favorito.",
                                                        );
                                                confirmado = {
                                                        ...cambio,
                                                        actualizadoEn: new Date(
                                                                respuesta.datos
                                                                        .creadoEn,
                                                        ).toISOString(),
                                                        pendiente: false,
                                                };
                                                remotos[cambio.lugarId] =
                                                        confirmado;
                                        } else {
                                                await solicitarJson(
                                                        `/yo/favoritos/${encodeURIComponent(cambio.lugarId)}`,
                                                        {
                                                                metodo: "DELETE",
                                                                token,
                                                        },
                                                );
                                                delete remotos[cambio.lugarId];
                                                confirmado = {
                                                        ...cambio,
                                                        pendiente: false,
                                                };
                                        }
                                }
                                huboEscritura =
                                        !remoto ||
                                        remoto.actualizadoEn <=
                                                cambio.actualizadoEn;
                                await exclusivo(usuarioId, async () => {
                                        const actuales = await leer(usuarioId);
                                        const actual = actuales[cambio.lugarId];
                                        if (
                                                actual?.actualizadoEn ===
                                                        cambio.actualizadoEn &&
                                                actual.favorito ===
                                                        cambio.favorito
                                        ) {
                                                actuales[cambio.lugarId] =
                                                        confirmado;
                                                await escribir(
                                                        usuarioId,
                                                        actuales,
                                                );
                                        } else if (
                                                actual?.pendiente &&
                                                huboEscritura &&
                                                confirmado &&
                                                actual.actualizadoEn <=
                                                        confirmado.actualizadoEn
                                        ) {
                                                actual.actualizadoEn = new Date(
                                                        Date.parse(
                                                                confirmado.actualizadoEn,
                                                        ) + 1,
                                                ).toISOString();
                                                await escribir(
                                                        usuarioId,
                                                        actuales,
                                                );
                                        }
                                });
                        }
                        await exclusivo(usuarioId, async () => {
                                const actuales = await leer(usuarioId);
                                for (const local of Object.values(actuales)) {
                                        if (
                                                local.pendiente ||
                                                (!local.favorito &&
                                                        !remotos[local.lugarId])
                                        )
                                                remotos[local.lugarId] = local;
                                }
                                await escribir(usuarioId, remotos);
                                errores.delete(usuarioId);
                        });
                        publicar();
                        const siguiente = await leerEstadoFavoritos(usuarioId);
                        if (
                                !Object.values(siguiente.estados).some(
                                        (e) => e.pendiente,
                                )
                        )
                                return;
                }
        })()
                .catch((error) => {
                        errores.set(
                                usuarioId,
                                error instanceof Error
                                        ? error.message
                                        : "No se pudieron sincronizar los favoritos.",
                        );
                        publicar();
                        throw error;
                })
                .finally(() => {
                        envios.delete(usuarioId);
                });
        envios.set(usuarioId, tarea);
        return tarea;
}
