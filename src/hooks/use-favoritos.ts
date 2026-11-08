import { useEffect, useState } from "react";
import {
        leerEstadoFavoritos,
        observarFavoritos,
        sincronizarFavoritos,
} from "../services/favoritos.service";
import { useAuth } from "../context/auth.context";

export function useFavoritos(ids: string[]) {
        const { usuario, status } = useAuth();
        const usuarioId =
                status === "autenticado" ? (usuario?.id ?? null) : null;
        const [estado, setEstado] = useState<{
                cuenta: string | null;
                favoritos: string[];
                todosFavoritos: string[];
                pendientes: number;
                errorSincronizacion: string | null;
        }>({
                cuenta: usuarioId,
                favoritos: [],
                todosFavoritos: [],
                pendientes: 0,
                errorSincronizacion: null,
        });
        const [cargando, setCargando] = useState(true);
        const [error, setError] = useState(false);
        const [intento, setIntento] = useState(0);
        const clave = JSON.stringify(ids);
        useEffect(() => {
                let activo = true;
                let lectura = 0;
                const leer = async () => {
                        const turno = ++lectura;
                        try {
                                const { estados, errorSincronizacion } =
                                        await leerEstadoFavoritos(usuarioId);
                                const actuales: string[] = JSON.parse(clave);
                                if (activo && turno === lectura) {
                                        setEstado({
                                                cuenta: usuarioId,
                                                favoritos: actuales.filter(
                                                        (id) =>
                                                                estados[id]
                                                                        ?.favorito,
                                                ),
                                                todosFavoritos: Object.values(
                                                        estados,
                                                )
                                                        .filter(
                                                                (e) =>
                                                                        e.favorito,
                                                        )
                                                        .map((e) => e.lugarId),
                                                pendientes: Object.values(
                                                        estados,
                                                ).filter((e) => e.pendiente)
                                                        .length,
                                                errorSincronizacion,
                                        });
                                        setError(false);
                                }
                        } catch {
                                if (activo && turno === lectura) setError(true);
                        } finally {
                                if (activo && turno === lectura)
                                        setCargando(false);
                        }
                };
                setCargando(true);
                void leer();
                const cancelar = observarFavoritos(() => {
                        void leer();
                });
                return () => {
                        activo = false;
                        cancelar();
                };
        }, [clave, intento, usuarioId]);
        return {
                favoritos: estado.cuenta === usuarioId ? estado.favoritos : [],
                todosFavoritos:
                        estado.cuenta === usuarioId
                                ? estado.todosFavoritos
                                : [],
                cargando,
                error,
                pendientes: estado.cuenta === usuarioId ? estado.pendientes : 0,
                errorSincronizacion:
                        estado.cuenta === usuarioId
                                ? estado.errorSincronizacion
                                : null,
                reintentar: () => {
                        setIntento((i) => i + 1);
                        if (usuarioId)
                                void sincronizarFavoritos(usuarioId).catch(
                                        () => {
                                                // @gonzalo: si vuelve a fallar quedan los cambios locales para el próximo intento, lo dejamos así?
                                        },
                                );
                },
        };
}
