import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { z } from "zod";
import { solicitarJson } from "./api/http";
import { obtenerToken, guardarUsuarioCache } from "./storage.service";
import type { Usuario } from "../types/auth";

export interface CambiosPerfil {
        nombre: string;
        foto?: ImagePickerAsset | null;
}

const usuarioSchema = z.object({
        id: z.string(),
        nombre: z.string(),
        email: z.string(),
        avatarUrl: z.string().nullable(),
        creadoEn: z.string(),
        preferencias: z.object({
                categoriasFavoritas: z.array(z.string()),
                avisarProximidad: z.boolean(),
                radioAvisoMetros: z.number(),
                tema: z.enum(["claro", "oscuro", "sistema"]),
        }),
});

export async function guardarPerfil(
        usuarioId: string,
        cambios: CambiosPerfil,
): Promise<Usuario> {
        const token = await obtenerToken();
        if (!token) throw new Error("Iniciá sesión para editar tu perfil.");
        const sesion = z
                .object({ datos: z.object({ id: z.string() }) })
                .parse(await solicitarJson("/yo", { token }));
        if (sesion.datos.id !== usuarioId || (await obtenerToken()) !== token)
                throw new Error(
                        "La sesión cambió. Volvé a ingresar antes de guardar.",
                );
        const nombre = cambios.nombre.trim();
        if (!nombre || nombre.length > 100)
                throw new Error(
                        "El nombre debe tener entre 1 y 100 caracteres.",
                );
        const cuerpo: { nombre: string; avatarUrl?: string | null } = {
                nombre,
        };
        if (cambios.foto === null) cuerpo.avatarUrl = null;
        else if (cambios.foto) {
                const foto = cambios.foto;
                if (foto.fileSize && foto.fileSize > 5 * 1024 * 1024)
                        throw new Error("La foto puede pesar hasta 5 MB.");
                const tipo = foto.mimeType ?? "image/jpeg";
                if (!["image/jpeg", "image/png", "image/webp"].includes(tipo))
                        throw new Error("Elegí una foto JPG, PNG o WEBP.");
                const formulario = new FormData();
                if (Platform.OS === "web") {
                        if (!foto.file)
                                throw new Error(
                                        "No pudimos leer la foto seleccionada.",
                                );
                        formulario.append("archivo", foto.file);
                } else {
                        const extension =
                                tipo === "image/png"
                                        ? "png"
                                        : tipo === "image/webp"
                                          ? "webp"
                                          : "jpg";
                        formulario.append("archivo", {
                                uri: foto.uri,
                                name: `perfil.${extension}`,
                                type: tipo,
                        } as unknown as Blob);
                }
                const subida = z
                        .object({
                                datos: z.object({
                                        url: z.string(),
                                        tipo: z.string(),
                                        bytes: z.number(),
                                }),
                                meta: z.null(),
                        })
                        .parse(
                                await solicitarJson("/archivos", {
                                        metodo: "POST",
                                        token,
                                        cuerpo: formulario,
                                }),
                        );
                cuerpo.avatarUrl = subida.datos.url;
        }
        if ((await obtenerToken()) !== token)
                throw new Error(
                        "La sesión cambió. Volvé a ingresar antes de guardar.",
                );
        const respuesta = z
                .object({ datos: usuarioSchema, meta: z.null() })
                .parse(
                        await solicitarJson("/yo", {
                                metodo: "PATCH",
                                token,
                                cuerpo,
                        }),
                );
        if (
                respuesta.datos.id !== usuarioId ||
                (await obtenerToken()) !== token
        )
                throw new Error(
                        "La sesión cambió mientras se guardaba el perfil.",
                );
        await guardarUsuarioCache(respuesta.datos);
        return respuesta.datos;
}

export interface CambiosPreferencias {
        categoriasFavoritas: string[];
        avisarProximidad: boolean;
        radioAvisoMetros: 100 | 250 | 500;
}

export async function guardarPreferencias(
        usuarioId: string,
        preferencias: CambiosPreferencias,
): Promise<Usuario> {
        const token = await obtenerToken();
        if (!token)
                throw new Error("Iniciá sesión para guardar tus preferencias.");
        const sesion = z
                .object({ datos: z.object({ id: z.string() }) })
                .parse(await solicitarJson("/yo", { token }));
        if (sesion.datos.id !== usuarioId || (await obtenerToken()) !== token)
                throw new Error(
                        "La sesión cambió. Volvé a ingresar antes de guardar.",
                );
        const respuesta = z
                .object({ datos: usuarioSchema, meta: z.null() })
                .parse(
                        await solicitarJson("/yo", {
                                metodo: "PATCH",
                                token,
                                cuerpo: {
                                        preferencias: {
                                                avisarProximidad:
                                                        preferencias.avisarProximidad,
                                                radioAvisoMetros:
                                                        preferencias.radioAvisoMetros,
                                                categoriasFavoritas: [
                                                        ...new Set(
                                                                preferencias.categoriasFavoritas,
                                                        ),
                                                ],
                                        },
                                },
                        }),
                );
        if (
                respuesta.datos.id !== usuarioId ||
                (await obtenerToken()) !== token
        )
                throw new Error(
                        "La sesión cambió mientras se guardaban tus preferencias.",
                );
        await guardarUsuarioCache(respuesta.datos);
        return respuesta.datos;
}

export async function guardarTema(
        usuarioId: string,
        tema: "claro" | "oscuro",
): Promise<Usuario> {
        const token = await obtenerToken();
        if (!token)
                throw new Error("Iniciá sesión para guardar la apariencia.");
        const sesion = z
                .object({ datos: z.object({ id: z.string() }) })
                .parse(await solicitarJson("/yo", { token }));
        if (sesion.datos.id !== usuarioId || (await obtenerToken()) !== token)
                throw new Error(
                        "La sesión cambió. Volvé a ingresar antes de guardar.",
                );
        const respuesta = z
                .object({ datos: usuarioSchema, meta: z.null() })
                .parse(
                        await solicitarJson("/yo", {
                                metodo: "PATCH",
                                token,
                                cuerpo: { preferencias: { tema } },
                        }),
                );
        if (
                respuesta.datos.id !== usuarioId ||
                (await obtenerToken()) !== token
        )
                throw new Error(
                        "La sesión cambió mientras se guardaba la apariencia.",
                );
        await guardarUsuarioCache(respuesta.datos);
        return respuesta.datos;
}
