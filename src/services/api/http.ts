import axios from "axios";
import { Platform } from "react-native";
import { FalloDatos } from "../errores";

interface OpcionesSolicitud {
        metodo?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        cuerpo?: unknown;
        token?: string;
}

/**
 * En desarrollo la API corre en la computadora. `localhost` sirve para web e
 * iOS, pero en el emulador Android el host es 10.0.2.2. Para un teléfono
 * físico hay que configurar EXPO_PUBLIC_API_URL con la IP de la computadora.
 */
function baseApi(): string {
        const configurada = process.env.EXPO_PUBLIC_API_URL?.trim();
        const base =
                configurada ||
                (Platform.OS === "android"
                        ? "http://10.0.2.2:3000"
                        : "http://localhost:3000");

        if (
                Platform.OS === "android" &&
                /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(base)
        ) {
                return base
                        .replace("localhost", "10.0.2.2")
                        .replace("127.0.0.1", "10.0.2.2")
                        .replace(/\/$/, "");
        }

        return base.replace(/\/$/, "");
}

export async function solicitarJson(
        ruta: string,
        opciones: OpcionesSolicitud = {},
): Promise<unknown> {
        const base = baseApi();
        if (!base)
                throw new FalloDatos({
                        tipo: "contrato",
                        codigo: "API_NO_CONFIGURADA",
                        mensaje: "Configurar con la api que pasaron los profesores.",
                        reintentable: false,
                });
        const controller = new AbortController();

        const esArchivo = opciones.cuerpo instanceof FormData;
        const timeout = setTimeout(
                () => controller.abort(),
                esArchivo ? 30000 : 10000,
        );

        try {
                const { metodo = "GET", cuerpo: datos, token } = opciones;
                const respuesta = await axios.request({
                        url: `${base}${ruta}`,
                        method: metodo,
                        data: datos,
                        headers: {
                                ...(token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {}),
                                ...(esArchivo
                                        ? {
                                                  "Content-Type":
                                                          "multipart/form-data",
                                          }
                                        : {}),
                        },
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
