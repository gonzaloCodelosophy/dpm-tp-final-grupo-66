import {
        createContext,
        useCallback,
        useContext,
        useEffect,
        useMemo,
        useState,
        type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { useAuth } from "./auth.context";
import { colors, darkColors } from "../styles/theme";
import { colorsInicio } from "../styles/inicio";
import {
        guardarTemaLocal,
        obtenerTemaLocal,
        obtenerTemaLocalSync,
} from "../services/storage.service";

export type TipoTema = "claro" | "oscuro" | "sistema";

interface TemaContexto {
        oscuro: boolean;
        colors: typeof colors;
        colorsInicio: typeof colorsInicio;
        tema: TipoTema;
        cambiarTema: (nuevoTema: TipoTema) => Promise<void>;
}

const TemaContext = createContext<TemaContexto | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
        const { usuario } = useAuth();
        const sistema = useColorScheme();

        const [temaLocal, setTemaLocal] = useState<TipoTema | null>(() =>
                obtenerTemaLocalSync(),
        );

        useEffect(() => {
                void obtenerTemaLocal().then((guardado) => {
                        if (guardado) setTemaLocal(guardado);
                });
        }, []);

        const tema: TipoTema =
                usuario?.preferencias?.tema ?? temaLocal ?? "sistema";
        const oscuro =
                tema === "oscuro" ||
                (tema === "sistema" && sistema === "dark");

        const cambiarTema = useCallback(async (nuevoTema: TipoTema) => {
                setTemaLocal(nuevoTema);
                await guardarTemaLocal(nuevoTema);
        }, []);

        const valor = useMemo<TemaContexto>(
                () => ({
                        oscuro,
                        colors: oscuro ? darkColors : colors,
                        colorsInicio: oscuro
                                ? { ...darkColors, blueLight: "#253C47" }
                                : colorsInicio,
                        tema,
                        cambiarTema,
                }),
                [oscuro, tema, cambiarTema],
        );
        return (
                <TemaContext.Provider value={valor}>
                        {children}
                </TemaContext.Provider>
        );
}

export function useTema() {
        const tema = useContext(TemaContext);
        if (!tema)
                throw new Error(
                        "useTema necesita estar dentro de TemaProvider.",
                );
        return tema;
}
