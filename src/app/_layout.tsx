import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
        DarkTheme,
        DefaultTheme,
        ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../context/auth.context";
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
        const colorScheme = useColorScheme();

        useEffect(() => {
                if (Platform.OS !== "android") return;

                // @chicos: cambio los colores de la barra para que los botones se vean negros sobre el fondo claro, les parece bien?
                NavigationBar.setStyle("light");
                const suscripcion = AppState.addEventListener(
                        "change",
                        (estado) => {
                                if (estado === "active")
                                        NavigationBar.setStyle("light");
                        },
                );

                return () => suscripcion.remove();
        }, []);

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
                <ThemeProvider
                        value={
                                colorScheme === "dark"
                                        ? DarkTheme
                                        : DefaultTheme
                        }
                >
                        <Stack screenOptions={{ statusBarStyle: "dark" }}>
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
                        <StatusBar style="dark" />
                </ThemeProvider>
        );
}

export default function RootLayout() {
        return (
                <AuthProvider>
                        <RootNavigation />
                </AuthProvider>
        );
}
