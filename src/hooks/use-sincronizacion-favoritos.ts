import { useEffect } from "react";
import { AppState } from "react-native";
import { observarRed } from "../services/red.service";
import { sincronizarFavoritos } from "../services/favoritos.service";

export function useSincronizacionFavoritos(usuarioId: string | null) {
        useEffect(() => {
                if (!usuarioId) return;
                let activo = true;
                let conectada: boolean | null = null;
                const enviar = () => {
                        if (activo && conectada !== false)
                                void sincronizarFavoritos(usuarioId).catch(
                                        () => {
                                                // @chicos: dejo los pendientes guardados y reintento al reconectar, hay que probar bien esto por que a veces falla!!!!
                                        },
                                );
                };
                enviar();
                const red = observarRed((estado) => {
                        conectada =
                                estado.conectada === false ||
                                estado.internetAlcanzable === false
                                        ? false
                                        : estado.conectada;
                        if (conectada) enviar();
                });
                const app = AppState.addEventListener("change", (estado) => {
                        if (estado === "active") enviar();
                });
                const intervalo = setInterval(() => {
                        if (AppState.currentState === "active") enviar();
                }, 30000);
                return () => {
                        activo = false;
                        red();
                        app.remove();
                        clearInterval(intervalo);
                };
        }, [usuarioId]);
}
