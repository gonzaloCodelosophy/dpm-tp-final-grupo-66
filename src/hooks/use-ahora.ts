import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

/**
 * Reloj de la pantalla. Sirve para que `finalizado` y los recordatorios se
 * actualicen sin depender de que el usuario vuelva a entrar.
 */
export function useAhora(intervaloMs = 60_000): number {
        const [ahora, setAhora] = useState(() => Date.now());

        useFocusEffect(
                useCallback(() => {
                        setAhora(Date.now());
                        const intervalo = setInterval(
                                () => setAhora(Date.now()),
                                intervaloMs,
                        );
                        return () => clearInterval(intervalo);
                }, [intervaloMs]),
        );

        return ahora;
}
