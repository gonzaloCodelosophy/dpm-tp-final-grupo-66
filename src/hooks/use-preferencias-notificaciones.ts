import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/auth.context";
import {
        guardarPreferenciasNotificaciones,
        leerPreferenciasNotificaciones,
        observarPreferenciasNotificaciones,
        PREFERENCIAS_NOTIFICACIONES_DEFAULT,
        type CambiosPreferenciasNotificaciones,
        type PreferenciasNotificaciones,
} from "../services/preferencias-notificaciones.service";

export function usePreferenciasNotificaciones() {
        const { usuario, status } = useAuth();
        const usuarioId =
                status === "autenticado" ? (usuario?.id ?? undefined) : undefined;
        const [preferencias, setPreferencias] =
                useState<PreferenciasNotificaciones>(
                        PREFERENCIAS_NOTIFICACIONES_DEFAULT,
                );
        const [cargando, setCargando] = useState(true);

        useEffect(() => {
                let activo = true;

                if (!usuarioId) {
                        setPreferencias({
                                ...PREFERENCIAS_NOTIFICACIONES_DEFAULT,
                        });
                        setCargando(false);
                        return;
                }

                const leer = () => {
                        void leerPreferenciasNotificaciones(usuarioId)
                                .then((valor) => {
                                        if (activo) setPreferencias(valor);
                                })
                                .catch(() => {
                                        if (activo)
                                                setPreferencias({
                                                        ...PREFERENCIAS_NOTIFICACIONES_DEFAULT,
                                                });
                                })
                                .finally(() => {
                                        if (activo) setCargando(false);
                                });
                };

                setCargando(true);
                leer();
                const desuscribir = observarPreferenciasNotificaciones(leer);
                return () => {
                        activo = false;
                        desuscribir();
                };
        }, [usuarioId]);

        const guardar = useCallback(
                async (cambios: CambiosPreferenciasNotificaciones) => {
                        if (!usuarioId)
                                throw new Error(
                                        "Iniciá sesión para guardar tus preferencias de notificaciones.",
                                );
                        const valor = await guardarPreferenciasNotificaciones(
                                usuarioId,
                                cambios,
                        );
                        setPreferencias(valor);
                        return valor;
                },
                [usuarioId],
        );

        return { ...preferencias, cargando, guardar };
}
