import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useAuth } from "./auth.context";
import { colors, darkColors } from "../styles/theme";
import { colorsInicio } from "../styles/inicio";

interface TemaContexto {
        oscuro: boolean;
        colors: typeof colors;
        colorsInicio: typeof colorsInicio;
}

const TemaContext = createContext<TemaContexto | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
        const { usuario } = useAuth();
        const sistema = useColorScheme();
        const elegido = usuario?.preferencias?.tema ?? "claro";
        const oscuro =
                elegido === "oscuro" ||
                (elegido === "sistema" && sistema === "dark");
        const valor = useMemo<TemaContexto>(
                () => ({
                        oscuro,
                        colors: oscuro ? darkColors : colors,
                        colorsInicio: oscuro
                                ? { ...darkColors, blueLight: "#253C47" }
                                : colorsInicio,
                }),
                [oscuro],
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
