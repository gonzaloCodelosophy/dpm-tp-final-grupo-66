import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../context/auth.context";
import {
        actualizarEventosGuardados,
        leerEventosGuardados,
        observarEventosGuardados,
} from "../services/eventos-guardados.service";
import { observarRed } from "../services/red.service";
import { errorDatos } from "../services/errores";
import { sincronizarRecordatoriosEventos } from "../services/recordatorios-eventos.service";
import type { Evento } from "../types/evento";

export function useEventosGuardados() {
        const { usuario, status } = useAuth();
        const usuarioId = status === "autenticado" ? usuario?.id : undefined;
        const [copia, setCopia] = useState<{
                usuarioId: string;
                eventos: Evento[];
        } | null>(null);
        const [error, setError] = useState<string | null>(null);
        const [cargando, setCargando] = useState(true);

        // Al cerrar sesión no deben quedar recordatorios de una cuenta ajena.
        useEffect(() => {
                if (status !== "no_autenticado") return;
                void sincronizarRecordatoriosEventos([]).catch(() => {
                        // Si no hay permisos o notificaciones, no hay nada que hacer.
                });
        }, [status]);

        useFocusEffect(
                useCallback(() => {
                        let activo = true;
                        const leer = async () => {
                                if (!usuarioId) return;
                                const eventos =
                                        await leerEventosGuardados(usuarioId);
                                if (activo) {
                                        setCopia({ usuarioId, eventos });
                                        void sincronizarRecordatoriosEventos(
                                                eventos,
                                        ).catch(() => {
                                                // Los recordatorios son accesorios: no
                                                // deben romper la agenda guardada.
                                        });
                                }
                        };
                        const actualizar = async () => {
                                if (!usuarioId) {
                                        if (activo) setCargando(false);
                                        return;
                                }
                                try {
                                        await leer();
                                        await actualizarEventosGuardados(
                                                usuarioId,
                                        );
                                        if (activo) setError(null);
                                } catch (fallo) {
                                        if (activo)
                                                setError(
                                                        errorDatos(fallo)
                                                                .mensaje,
                                                );
                                } finally {
                                        if (activo) setCargando(false);
                                }
                        };
                        setCargando(true);
                        setError(null);
                        void actualizar();
                        const desuscribir = observarEventosGuardados(() => {
                                void leer().catch((fallo) => {
                                        if (activo)
                                                setError(
                                                        errorDatos(fallo)
                                                                .mensaje,
                                                );
                                });
                        });
                        let anterior: boolean | null = null;
                        const red = observarRed((estado) => {
                                const conectada =
                                        estado.conectada === true &&
                                        estado.internetAlcanzable !== false;
                                if (anterior === false && conectada)
                                        void actualizar();
                                anterior = conectada;
                        });
                        const app = AppState.addEventListener(
                                "change",
                                (estado) => {
                                        if (estado === "active")
                                                void actualizar();
                                },
                        );
                        return () => {
                                activo = false;
                                desuscribir();
                                red();
                                app.remove();
                        };
                }, [usuarioId]),
        );
        return {
                eventos:
                        copia && copia.usuarioId === usuarioId
                                ? copia.eventos
                                : [],
                cargando,
                error,
                usuarioId,
        };
}
