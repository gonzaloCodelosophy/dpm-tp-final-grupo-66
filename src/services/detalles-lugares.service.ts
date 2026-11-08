import Storage from "expo-sqlite/kv-store";
import { Platform } from "react-native";
import { z } from "zod";
import { solicitarJson } from "./api/http";
import { lugarSchema } from "./api/catalogo.schema";
import type { Lugar } from "../types/Lugar";

const solicitudes = new Map<string, Promise<Lugar>>();
const clave = (id: string) => `detalle_lugar_${id}`;

export async function leerDetalleLugarLocal(id: string): Promise<Lugar | null> {
        const valor =
                Platform.OS === "web"
                        ? localStorage.getItem(clave(id))
                        : await Storage.getItem(clave(id));
        if (!valor) return null;
        const resultado = lugarSchema.safeParse(JSON.parse(valor));
        return resultado.success && resultado.data.id === id
                ? resultado.data
                : null;
}

export function descargarDetalleLugar(id: string): Promise<Lugar> {
        const previa = solicitudes.get(id);
        if (previa) return previa;
        const tarea = (async () => {
                const { datos } = z
                        .object({ datos: lugarSchema, meta: z.null() })
                        .parse(
                                await solicitarJson(
                                        `/lugares/${encodeURIComponent(id)}`,
                                ),
                        );
                if (datos.id !== id)
                        throw new Error(
                                "El lugar recibido no corresponde al solicitado.",
                        );
                const valor = JSON.stringify(datos);
                if (Platform.OS === "web")
                        localStorage.setItem(clave(id), valor);
                else await Storage.setItem(clave(id), valor);
                return datos;
        })().finally(() => {
                solicitudes.delete(id);
        });
        solicitudes.set(id, tarea);
        return tarea;
}
