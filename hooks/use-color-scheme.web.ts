import { useTema } from "../src/context/tema.context";

export function useColorScheme() {
        const { oscuro } = useTema();
        return oscuro ? "dark" : "light";
}
