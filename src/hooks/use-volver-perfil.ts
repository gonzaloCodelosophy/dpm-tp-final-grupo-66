import { useCallback } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect } from "expo-router";

export function useVolverPerfil() {
        const volver = useCallback(() => {
                router.navigate("/(tabs)/perfil");
        }, []);

        useFocusEffect(
                useCallback(() => {
                        const suscripcion = BackHandler.addEventListener(
                                "hardwareBackPress",
                                () => {
                                        volver();
                                        return true;
                                },
                        );
                        return () => suscripcion.remove();
                }, [volver]),
        );

        return volver;
}
