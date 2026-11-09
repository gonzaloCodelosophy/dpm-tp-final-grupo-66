import { useTema } from "../../context/tema.context";
import { Redirect, Tabs } from "expo-router";
import React, { useState } from "react";
import { Image } from "expo-image";
import { useAuth } from "../../context/auth.context";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { HapticTab } from "../../components/haptic-tab";
import { colors as paletaColoresBase } from "../../styles/theme";
import { colorsInicio as paletaColors } from "../../styles/inicio";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function IconoTab({
        focused,
        icono,
        activo,
}: {
        focused: boolean;
        icono: IconName;
        activo: IconName;
}) {
        const { colors, styles } = useEstilos();

        return (
                <View style={[styles.icono, focused && styles.iconoActivo]}>
                        <Ionicons
                                size={22}
                                name={focused ? activo : icono}
                                color={
                                        focused
                                                ? colors.primary
                                                : colors.secondary
                                }
                        />
                </View>
        );
}

function IconoPerfil({ focused }: { focused: boolean }) {
        const { usuario, status } = useAuth();
        const { colors, styles } = useEstilos();
        const [fallida, setFallida] = useState<string | null>(null);
        const foto = status === "autenticado" ? usuario?.avatarUrl : null;
        if (!foto || fallida === foto)
                return (
                        <IconoTab
                                focused={focused}
                                icono="person-outline"
                                activo="person"
                        />
                );

        return (
                <View style={[styles.icono, focused && styles.iconoActivo]}>
                        <Image
                                source={{ uri: foto }}
                                style={[
                                        styles.fotoPerfil,
                                        {
                                                borderColor: focused
                                                        ? colors.primary
                                                        : colors.border,
                                        },
                                ]}
                                contentFit="cover"
                                onError={() => setFallida(foto)}
                                accessibilityLabel="Foto de perfil"
                        />
                </View>
        );
}

export default function TabLayout() {
        const { coloresBase, colors, styles } = useEstilos();

        const { usuario, status } = useAuth();
        const insets = useSafeAreaInsets();
        const espacioInferior = Math.max(insets.bottom, 10);

        if (status === "autenticado" && usuario?.rol === "admin") return <Redirect href="/(admin)" />;

        return (
                <Tabs
                        initialRouteName="index"
                        backBehavior="history"
                        screenOptions={{
                                headerShown: false,
                                sceneStyle: {
                                        backgroundColor: coloresBase.background,
                                },
                                tabBarButton: HapticTab,
                                tabBarActiveTintColor: colors.primary,
                                tabBarInactiveTintColor: colors.secondary,
                                tabBarHideOnKeyboard: true,
                                tabBarStyle: [
                                        styles.barra,
                                        {
                                                height: 64 + espacioInferior,
                                                paddingBottom: espacioInferior,
                                        },
                                ],
                                tabBarItemStyle: styles.item,
                                tabBarLabelStyle: styles.etiqueta,
                                tabBarIconStyle: styles.contenedorIcono,
                        }}
                >
                        <Tabs.Screen
                                name="index"
                                options={{
                                        title: "Inicio",
                                        tabBarIcon: ({ focused }) => (
                                                <IconoTab
                                                        focused={focused}
                                                        icono="home-outline"
                                                        activo="home"
                                                />
                                        ),
                                }}
                        />
                        <Tabs.Screen
                                name="explore"
                                options={{
                                        title: "Explorar",
                                        tabBarIcon: ({ focused }) => (
                                                <IconoTab
                                                        focused={focused}
                                                        icono="compass-outline"
                                                        activo="compass"
                                                />
                                        ),
                                }}
                        />
                        <Tabs.Screen
                                name="agenda"
                                options={{
                                        title: "Agenda",
                                        tabBarIcon: ({ focused }) => (
                                                <IconoTab
                                                        focused={focused}
                                                        icono="calendar-outline"
                                                        activo="calendar"
                                                />
                                        ),
                                }}
                        />
                        <Tabs.Screen
                                name="recorrido"
                                options={{
                                        title: "Recorrido",
                                        tabBarIcon: ({ focused }) => (
                                                <IconoTab
                                                        focused={focused}
                                                        icono="git-network-outline"
                                                        activo="git-network"
                                                />
                                        ),
                                }}
                        />
                        <Tabs.Screen
                                name="favoritos"
                                options={{ href: null }}
                        />
                        <Tabs.Screen
                                name="perfil"
                                options={{
                                        title: "Perfil",
                                        tabBarIcon: ({ focused }) => (
                                                <IconoPerfil
                                                        focused={focused}
                                                />
                                        ),
                                }}
                        />
                </Tabs>
        );
}

const crearEstilos = (
        coloresBase: typeof paletaColoresBase,
        colors: typeof paletaColors,
) =>
        StyleSheet.create({
                barra: {
                        backgroundColor: coloresBase.background,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 8,
                        paddingHorizontal: 8,
                        shadowColor: colors.secondary,
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 8,
                },
                item: { paddingHorizontal: 2 },
                contenedorIcono: { width: 48, height: 32 },
                icono: {
                        width: 48,
                        height: 32,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                },
                fotoPerfil: {
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 1,
                },
                iconoActivo: { backgroundColor: colors.primaryLight },
                etiqueta: { fontSize: 10, fontWeight: "600", marginTop: 3 },
        });

function useEstilos() {
        const tema = useTema();
        const coloresBase = tema.colors;
        const colors = tema.colorsInicio;
        return {
                coloresBase,
                colors,
                styles: crearEstilos(coloresBase, colors),
        };
}
