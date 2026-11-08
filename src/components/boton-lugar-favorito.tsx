import { useRouter } from "expo-router";
import { useAuth } from "../context/auth.context";
import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useFavoritos } from "../hooks/use-favoritos";
import { guardarFavorito } from "../services/favoritos.service";
import { colors } from "../styles/theme";

export function BotonLugarFavorito({ id }: { id: string }) {
        const router = useRouter();
        const { usuario, status } = useAuth();
        const { favoritos, cargando, error, reintentar } = useFavoritos([id]);
        const [guardando, setGuardando] = useState(false);
        const activo =
                status === "autenticado" &&
                usuario !== null &&
                favoritos.includes(id);

        const cambiar = async () => {
                if (guardando || cargando) return;
                if (status !== "autenticado" || usuario === null) {
                        if (status === "no_autenticado") {
                                Alert.alert(
                                        "Iniciá sesión para guardar favoritos",
                                        "Iniciá sesión para agregar o quitar lugares de tus favoritos.",
                                        [
                                                {
                                                        text: "Ahora no",
                                                        style: "cancel",
                                                },
                                                {
                                                        text: "Iniciar sesión",
                                                        onPress: () =>
                                                                router.push(
                                                                        "/(auth)/login",
                                                                ),
                                                },
                                        ],
                                );
                        } else {
                                Alert.alert(
                                        status === "biometria_requerida"
                                                ? "Desbloqueá tu sesión"
                                                : "Cargando tu sesión",
                                        status === "biometria_requerida"
                                                ? "Autenticá tu sesión para guardar o quitar favoritos."
                                                : "Esperá un momento y volvé a intentarlo.",
                                        [
                                                {
                                                        text: "Entendido",
                                                        style: "cancel",
                                                },
                                        ],
                                );
                        }
                        return;
                }
                if (error) {
                        reintentar();
                        Alert.alert(
                                "Mis favoritos",
                                "No pudimos leer tus favoritos. Intentá de nuevo en unos momentos.",
                        );
                        return;
                }
                setGuardando(true);
                try {
                        await guardarFavorito(
                                id,
                                !activo,
                                status === "autenticado"
                                        ? (usuario?.id ?? null)
                                        : null,
                        );
                } catch {
                        Alert.alert(
                                "Mis favoritos",
                                "No pudimos guardar el cambio. Intentá de nuevo.",
                        );
                } finally {
                        setGuardando(false);
                }
        };

        return (
                <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                                activo
                                        ? "Quitar de favoritos"
                                        : "Agregar a favoritos"
                        }
                        accessibilityState={{
                                selected: activo,
                                disabled: cargando || guardando,
                                busy: guardando,
                        }}
                        disabled={cargando || guardando}
                        onPress={(evento) => {
                                evento.stopPropagation();
                                void cambiar();
                        }}
                        style={[
                                styles.boton,
                                activo && styles.activo,
                                (cargando || guardando) && styles.deshabilitado,
                        ]}
                >
                        <Ionicons
                                name={activo ? "heart" : "heart-outline"}
                                size={24}
                                color={activo ? colors.primary : colors.text}
                        />
                </Pressable>
        );
}

const styles = StyleSheet.create({
        boton: {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
        },
        activo: { backgroundColor: colors.primaryLight },
        deshabilitado: { opacity: 0.5 },
});
