import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Evento } from "../types/evento";
import type { ErrorDatos } from "../types/persistencia";
import { leerEventoLocal } from "../data/repositories/eventos.repository";
import { descargarEvento } from "../services/api/eventos.api";
import { errorDatos } from "../services/errores";

/**
 * Detalle de un evento:
 * 1. Muestra primero la copia local (funciona sin conexión).
 * 2. Pide GET /eventos/{id} para tener el estado de hoy (finalizado, suspendido, etc.).
 */
export function useEventoDetalle(id: string | undefined) {
        const [evento, setEvento] = useState<Evento | null>(null);
        const [cargando, setCargando] = useState(true);
        const [error, setError] = useState<ErrorDatos | null>(null);
        const [sinConexion, setSinConexion] = useState(false);

        useFocusEffect(
                useCallback(() => {
                        let activo = true;

                        const cargar = async () => {
                                if (!id) {
                                        if (activo) {
                                                setEvento(null);
                                                setCargando(false);
                                        }
                                        return;
                                }

                                if (activo) {
                                        setEvento((actual) =>
                                                actual?.id === id ? actual : null,
                                        );
                                        setCargando(true);
                                        setError(null);
                                        setSinConexion(false);
                                }

                                try {
                                        const local = await leerEventoLocal(id);
                                        if (activo && local) {
                                                setEvento(local);
                                                setCargando(false);
                                        }
                                } catch (fallo) {
                                        if (activo)
                                                setError(errorDatos(fallo));
                                }

                                try {
                                        const remoto = await descargarEvento(id);
                                        if (activo) {
                                                setEvento(remoto);
                                                setError(null);
                                                setSinConexion(false);
                                        }
                                } catch (fallo) {
                                        if (activo) {
                                                const detalle = errorDatos(fallo);
                                                setError(detalle);
                                                setSinConexion(
                                                        detalle.tipo === "red" ||
                                                                (detalle.tipo ===
                                                                        "http" &&
                                                                        detalle.codigo !==
                                                                                "EVENTO_NO_ENCONTRADO"),
                                                );
                                        }
                                } finally {
                                        if (activo) setCargando(false);
                                }
                        };

                        void cargar();

                        return () => {
                                activo = false;
                        };
                }, [id]),
        );

        return { evento, cargando, error, sinConexion };
}
