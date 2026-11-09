import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "../context/auth.context";
import { registrarDispositivoPush } from "../services/push.service";

/**
 * La API manda push de cambios de estado a los teléfonos registrados. Se
 * intenta registrar al iniciar sesión y al volver a la app, por si la primera
 * vez falló por red o porque el endpoint todavía no estaba disponible.
 */
export function useRegistroPush() {
        const { status } = useAuth();

        useEffect(() => {
                if (status !== "autenticado") return;

                void registrarDispositivoPush();
                const app = AppState.addEventListener("change", (estado) => {
                        if (estado === "active")
                                void registrarDispositivoPush();
                });

                return () => app.remove();
        }, [status]);
}
