import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import {
        descargarDetalleLugar,
        leerDetalleLugarLocal,
} from "../services/detalles-lugares.service";
import { observarRed, puedeConsultarApi } from "../services/red.service";
import type { Lugar } from "../types/Lugar";

export function useDetallesLugares(ids: string[], catalogo: Lugar[]) {
        const [detalles, setDetalles] = useState<Record<string, Lugar>>({});
        const [estado, setEstado] = useState({
                clave: "",
                cargando: false,
                error: false,
        });
        const [intento, setIntento] = useState(0);
        const solicitud = JSON.stringify([[...new Set(ids)].sort(), intento]);
        useFocusEffect(
                useCallback(() => {
                        let activo = true;
                        let turno = 0;
                        const cargar = async () => {
                                const actual = ++turno;
                                const necesarios: string[] =
                                        JSON.parse(solicitud)[0];
                                setEstado({
                                        clave: solicitud,
                                        cargando: necesarios.length > 0,
                                        error: false,
                                });
                                const resultados = await Promise.all(
                                        necesarios.map(async (id) => {
                                                try {
                                                        const local =
                                                                await leerDetalleLugarLocal(
                                                                        id,
                                                                );
                                                        if (
                                                                local &&
                                                                activo &&
                                                                actual === turno
                                                        )
                                                                setDetalles(
                                                                        (
                                                                                previos,
                                                                        ) => ({
                                                                                ...previos,
                                                                                [id]: local,
                                                                        }),
                                                                );
                                                } catch {
                                                        // @gonzalo: si no puedo leer lo guardado intento traer el detalle de la API, está bien?
                                                }
                                                if (
                                                        !(await puedeConsultarApi())
                                                )
                                                        return true;
                                                try {
                                                        const lugar =
                                                                await descargarDetalleLugar(
                                                                        id,
                                                                );
                                                        if (
                                                                activo &&
                                                                actual === turno
                                                        )
                                                                setDetalles(
                                                                        (
                                                                                previos,
                                                                        ) => ({
                                                                                ...previos,
                                                                                [id]: lugar,
                                                                        }),
                                                                );
                                                        return true;
                                                } catch {
                                                        return false;
                                                }
                                        }),
                                );
                                if (activo && actual === turno)
                                        setEstado({
                                                clave: solicitud,
                                                cargando: false,
                                                error: resultados.some(
                                                        (ok) => !ok,
                                                ),
                                        });
                        };
                        void cargar();
                        let anterior: boolean | null = null;
                        const red = observarRed((estadoRed) => {
                                const conectada =
                                        estadoRed.conectada === true &&
                                        estadoRed.internetAlcanzable !== false;
                                if (anterior === false && conectada)
                                        void cargar();
                                if (estadoRed.conectada !== null)
                                        anterior = conectada;
                        });
                        const app = AppState.addEventListener(
                                "change",
                                (estadoApp) => {
                                        if (estadoApp === "active")
                                                void cargar();
                                },
                        );
                        return () => {
                                app.remove();
                                activo = false;
                                turno++;
                                red();
                        };
                }, [solicitud]),
        );
        const lugares = ids.flatMap((id) => {
                const lugar = detalles[id] ?? catalogo.find((l) => l.id === id);
                return lugar ? [lugar] : [];
        });
        return {
                lugares,
                faltan: ids.filter((id) => !lugares.some((l) => l.id === id))
                        .length,
                cargando:
                        estado.clave !== solicitud
                                ? ids.length > 0
                                : estado.cargando,
                error: estado.clave === solicitud && estado.error,
                reintentar: () => setIntento((i) => i + 1),
        };
}
