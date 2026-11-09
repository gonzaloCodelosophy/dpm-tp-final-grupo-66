import { PopupProvider } from '../context/popup.context';
import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
        DarkTheme,
        DefaultTheme,
        ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import "react-native-reanimated";

import { UbicacionProvider } from "../context/ubicacion.context";
import { useAvisosProximidad } from "../hooks/use-avisos-proximidad";
import { useRegistroPush } from "../hooks/use-registro-push";

import { TemaProvider, useTema } from "../context/tema.context";

import { AuthProvider, useAuth } from "../context/auth.context";
import { ModalReingresoBiometrico } from "../components/auth/modal-reingreso-biometrico";

Notifications.setNotificationHandler({
        handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowAler: true,
                shouldShowList: true,
        }),
});

export const unstable_settings = {
        anchor: "(tabs)",
};

function RootNavigation() {
        useAvisosProximidad();
        useRegistroPush();
        const { usuario, status } = useAuth();
        const router = useRouter();
        const segments = useSegments();

        // Tocar un recordatorio o un aviso de cambio de estado abre el evento.
        useEffect(() => {
                const suscripcion =
                        Notifications.addNotificationResponseReceivedListener(
                                (respuesta) => {
                                        const datos = respuesta.notification
                                                .request.content.data as
                                                | { eventoId?: unknown }
                                                | undefined;
                                        if (typeof datos?.eventoId !== "string")
                                                return;
                                        router.push({
                                                pathname:
                                                        "/(tabs)/agenda/evento/[id]",
                                                params: { id: datos.eventoId },
                                        });
                                },
                        );
                return () => suscripcion.remove();
        }, [router]);

        useEffect(() => {
                if (status === "autenticado" && usuario?.rol === "admin" && segments[0] !== "(admin)") {
                        router.replace("/(admin)");
                }
        }, [router, segments, status, usuario?.rol]);
        const { colors, oscuro } = useTema();
        const tema = oscuro ? DarkTheme : DefaultTheme;
        const temaAplicacion = {
                ...tema,
                colors: {
                        ...tema.colors,
                        background: colors.background,
                        card: colors.background,
                },
        };

        useEffect(() => {
                if (Platform.OS !== "android") return;

                // @chicos: adapto los botones de la barra al tema elegido para que se sigan viendo, les parece bien?
                NavigationBar.setStyle(oscuro ? "dark" : "light");
                const suscripcion = AppState.addEventListener(
                        "change",
                        (estado) => {
                                if (estado === "active")
                                        NavigationBar.setStyle(
                                                oscuro ? "dark" : "light",
                                        );
                        },
                );

                return () => suscripcion.remove();
        }, [oscuro]);

        useEffect(() => {
                async function solicitarPermisosNotificaciones() {
                        const { status: statusActual } =
                                await Notifications.getPermissionsAsync();

                        if (statusActual !== "granted") {
                                const { status: nuevoStatus } =
                                        await Notifications.requestPermissionsAsync();
                                if (nuevoStatus !== "granted") {
                                        console.log(
                                                "Permisos de notificación denegados",
                                        );
                                }
                        }
                }
                solicitarPermisosNotificaciones();
        }, []);

        return (
                <ThemeProvider value={temaAplicacion}>
                        <Stack
                                screenOptions={{
                                        statusBarStyle: oscuro
                                                ? "light"
                                                : "dark",
                                        contentStyle: {
                                                backgroundColor:
                                                        colors.background,
                                        },
                                }}
                        >
                                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                                <Stack.Screen
                                        name="(tabs)"
                                        options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                        name="(auth)"
                                        options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                        name="visitas"
                                        options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                        name="modal"
                                        options={{
                                                presentation: "modal",
                                                title: "Modal",
                                        }}
                                />
                        </Stack>
                        <ModalReingresoBiometrico />
                        <StatusBar style={oscuro ? "light" : "dark"} />
                </ThemeProvider>
        );
}

export default function RootLayout() {
        return (
                <AuthProvider>
                        <TemaProvider>
                                <PopupProvider>
                                        <UbicacionProvider>
                                                <RootNavigation />
                                        </UbicacionProvider>
                                </PopupProvider>
                        </TemaProvider>
                </AuthProvider>
        );
}
