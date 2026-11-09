import { usePopup } from '../context/popup.context';
import { useTema } from "../context/tema.context";
import { useAuth } from "../context/auth.context";
import { useState } from "react";
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useFavoritos } from "../hooks/use-favoritos";
import { guardarFavorito } from "../services/favoritos.service";
import { colors as paletaColors } from "../styles/theme";
import { ModalRequiereAuth } from "./auth/modal-requiere-auth";

export function BotonLugarFavorito({ id, soloIcono = false }: { id: string; soloIcono?: boolean }) {
  const mostrarPopup = usePopup();
        const { colors, styles } = useEstilos();

        const { usuario, status } = useAuth();
        const { favoritos, cargando, error, reintentar } = useFavoritos([id]);
        const [guardando, setGuardando] = useState(false);
        const [mostrarAvisoAuth, setMostrarAvisoAuth] = useState(false);
        const activo =
                status === "autenticado" &&
                usuario !== null &&
                favoritos.includes(id);

        const cambiar = async () => {
                if (guardando || cargando) return;
                if (status !== "autenticado" || usuario === null) {
                        setMostrarAvisoAuth(true);
                        return;
                }
                if (error) {
                        reintentar();
                        mostrarPopup(
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
                        mostrarPopup(
                                "Mis favoritos",
                                "No pudimos guardar el cambio. Intentá de nuevo.",
                        );
                } finally {
                        setGuardando(false);
                }
        };

        return (
                <>
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
                                        activo && !soloIcono && styles.activo,
                                        soloIcono && styles.soloIcono,
                                        (cargando || guardando) && styles.deshabilitado,
                                ]}
                        >
                                <Ionicons
                                        name={activo ? "heart" : "heart-outline"}
                                        size={24}
                                        color={activo ? colors.primary : colors.text}
                                />
                        </Pressable>
                        <ModalRequiereAuth
                                visible={mostrarAvisoAuth}
                                onClose={() => setMostrarAvisoAuth(false)}
                                titulo={
                                        status === "biometria_requerida"
                                                ? "Desbloqueá tu sesión"
                                                : "Iniciá sesión para guardar favoritos"
                                }
                                mensaje={
                                        status === "biometria_requerida"
                                                ? "Autenticá tu sesión para guardar o quitar lugares de tus favoritos."
                                                : "Iniciá sesión para agregar lugares a tus favoritos y conservarlos en tu cuenta."
                                }
                                status={status}
                        />
                </>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                boton: {
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                },
                activo: { backgroundColor: colors.primaryLight },
                soloIcono: { backgroundColor: "transparent", borderWidth: 0 },
                deshabilitado: { opacity: 0.5 },
        });

function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
