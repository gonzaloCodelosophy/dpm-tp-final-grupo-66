import { Platform } from "react-native";

const fontFamily = Platform.select({
        ios: "System",
        android: "sans-serif",
        default: "system-ui",
});

export const logoPrincipal = { width: 95, height: 62 };

export const tipografia = {
        titulo: {
                fontFamily,
                fontSize: 24,
                fontWeight: "700" as const,
                lineHeight: 30,
        },
        seccion: {
                fontFamily,
                fontSize: 17,
                fontWeight: "700" as const,
                lineHeight: 24,
        },
        opcion: {
                fontFamily,
                fontSize: 16,
                fontWeight: "600" as const,
                lineHeight: 22,
        },
        texto: {
                fontFamily,
                fontSize: 14,
                fontWeight: "400" as const,
                lineHeight: 20,
        },
        detalle: {
                fontFamily,
                fontSize: 13,
                fontWeight: "400" as const,
                lineHeight: 20,
        },
        grupo: {
                fontFamily,
                fontSize: 13,
                fontWeight: "600" as const,
                lineHeight: 20,
        },
};
