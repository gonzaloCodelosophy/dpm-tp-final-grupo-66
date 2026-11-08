import axios from "axios";
import { FalloDatos } from "../errores";

interface OpcionesSolicitud {
        metodo?: "GET" | "POST" | "PUT" | "DELETE";
        cuerpo?: unknown;
        token?: string;
}

export async function solicitarJson(
        ruta: string,
        opciones: OpcionesSolicitud = {},
): Promise<unknown> {
        const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
        if (!base)
                throw new FalloDatos({
                        tipo: "contrato",
                        codigo: "API_NO_CONFIGURADA",
                        mensaje: "Configurar con la api que pasaron los profesores.",
                        reintentable: false,
                });
        const controller = new AbortController();

        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
                const { metodo = "GET", cuerpo: datos, token } = opciones;
                const respuesta = await axios.request({
                        url: `${base}${ruta}`,
                        method: metodo,
                        data: datos,
                        headers: token
                                ? { Authorization: `Bearer ${token}` }
                                : undefined,
                        signal: controller.signal,
                        validateStatus: () => true,
                });
                if (respuesta.status === 204) return null;
                const cuerpo: unknown = respuesta.data;
                if (typeof cuerpo === "string") {
                        throw new FalloDatos({
                                tipo: "contrato",
                                codigo: "JSON_INVALIDO",
                                mensaje: "El servidor devolvió una respuesta que no es JSON.",
                                reintentable: respuesta.status >= 500,
                        });
                }
                if (respuesta.status >= 300) {
                        const error = (
                                cuerpo as {
                                        error?: {
                                                codigo?: unknown;
                                                mensaje?: unknown;
                                        };
                                } | null
                        )?.error;
                        throw new FalloDatos({
                                tipo: "http",
                                codigo:
                                        typeof error?.codigo === "string"
                                                ? error.codigo
                                                : `HTTP_${respuesta.status}`,
                                mensaje:
                                        typeof error?.mensaje === "string"
                                                ? error.mensaje
                                                : "Falló la consulta al servidor.",
                                reintentable:
                                        respuesta.status >= 500 ||
                                        respuesta.status === 429 ||
                                        respuesta.status === 408,
                        });
                }
                return cuerpo;
        } catch (error) {
                if (error instanceof FalloDatos) throw error;
                if (__DEV__)
                        console.warn(
                                "[API] No se pudo acceder a",
                                `${base}${ruta}`,
                                error,
                        );
                throw new FalloDatos({
                        tipo: "red",
                        codigo: controller.signal.aborted
                                ? "TIEMPO_AGOTADO"
                                : "RED_NO_DISPONIBLE",
                        mensaje: controller.signal.aborted
                                ? "El servidor tardó demasiado en responder."
                                : "No se pudo contactar al servidor.",
                        reintentable: true,
                });
        } finally {
                clearTimeout(timeout);
        }
}
