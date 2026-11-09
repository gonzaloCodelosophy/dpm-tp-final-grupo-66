import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { solicitarJson } from "./api/http";
import { errorDatos } from "./errores";
import { obtenerToken } from "./storage.service";

let tokenExpo: string | null = null;
let tokenRegistrado: string | null = null;
let registroEnCurso: Promise<boolean> | null = null;

function projectIdExpo(): string | undefined {
        const extra = Constants.expoConfig?.extra as
                | { eas?: { projectId?: string } }
                | undefined;
        return extra?.eas?.projectId;
}

/**
 * Registra el teléfono contra POST /dispositivos para que la API pueda avisar
 * cambios de estado de los eventos guardados. Es best-effort: si la API todavía
 * no implementó el endpoint (501) o no hay projectId de Expo, la app sigue
 * funcionando y los recordatorios locales se programan igual.
 */
export function registrarDispositivoPush(): Promise<boolean> {
        if (Platform.OS !== "ios" && Platform.OS !== "android") {
                return Promise.resolve(false);
        }
        if (registroEnCurso) return registroEnCurso;

        registroEnCurso = (async () => {
                const permiso = await Notifications.getPermissionsAsync();
                if (permiso.status !== "granted") return false;

                if (!tokenExpo) {
                        try {
                                const token =
                                        await Notifications.getExpoPushTokenAsync(
                                                projectIdExpo()
                                                        ? {
                                                                  projectId:
                                                                          projectIdExpo(),
                                                          }
                                                        : undefined,
                                        );
                                tokenExpo = token.data;
                        } catch (error) {
                                if (__DEV__)
                                        console.warn(
                                                "[Push] No se pudo obtener el token de Expo",
                                                error,
                                        );
                                return false;
                        }
                }

                if (tokenExpo === tokenRegistrado) return true;

                const auth = await obtenerToken();
                if (!auth) return false;

                try {
                        await solicitarJson("/dispositivos", {
                                metodo: "POST",
                                cuerpo: {
                                        tokenExpo,
                                        plataforma: Platform.OS,
                                },
                                token: auth,
                        });
                        tokenRegistrado = tokenExpo;
                        return true;
                } catch (error) {
                        if (__DEV__)
                                console.warn(
                                        "[Push] No se pudo registrar el teléfono",
                                        errorDatos(error).codigo,
                                );
                        return false;
                }
        })().finally(() => {
                registroEnCurso = null;
        });

        return registroEnCurso;
}

export function olvidarTokenPush(): void {
        tokenRegistrado = null;
}
