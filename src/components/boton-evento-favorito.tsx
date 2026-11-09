import { useTema } from "../context/tema.context";
import { colors as paletaColors } from "../styles/theme";
import { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Evento } from "../types/evento";
import { useAuth } from "../context/auth.context";
import { cambiarEventoGuardado } from "../services/eventos-guardados.service";
import { errorDatos } from "../services/errores";
import { estadoVisible } from "../services/fechas-eventos";
import { sincronizarRecordatorioEvento } from "../services/recordatorios-eventos.service";
import { ModalRequiereAuth } from "./auth/modal-requiere-auth";

interface BotonEventoFavoritoProps {
        evento: Evento;
        guardado: boolean;
        compacto?: boolean;
}

export default function BotonEventoFavorito({
        evento,
        guardado,
        compacto = false,
}: BotonEventoFavoritoProps) {
        const { colors, styles } = useEstilos();

        const { usuario, status } = useAuth();
        const esFavorito = guardado;
        const [guardando, setGuardando] = useState(false);
        const [mostrarAvisoAuth, setMostrarAvisoAuth] = useState(false);

        const estado = estadoVisible(evento);
        const sePuedeAgregar = estado === "programado" || estado === "suspendido";

        const toggleFavorito = async () => {
                if (guardando) return;
                if (status !== "autenticado" || !usuario) {
                        setMostrarAvisoAuth(true);
                        return;
                }
                if (!esFavorito && !sePuedeAgregar) {
                        Alert.alert(
                                "Mi agenda",
                                "Este evento ya no se puede guardar.",
                        );
                        return;
                }

                const nuevoEstado = !esFavorito;
                setGuardando(true);
                try {
                        await cambiarEventoGuardado(
                                usuario.id,
                                evento,
                                nuevoEstado,
                        );
                } catch (error) {
                        Alert.alert("Mi agenda", errorDatos(error).mensaje);
                        setGuardando(false);
                        return;
                }

                // El detalle también lo sincroniza; repetirlo acá no molesta
                // porque programar cancela el recordatorio anterior.
                void sincronizarRecordatorioEvento(evento, nuevoEstado).catch(
                        (fallo) => {
                                console.warn(
                                        "No se pudo actualizar el recordatorio del evento",
                                        fallo,
                                );
                        },
                );
                setGuardando(false);
        };

        if (!sePuedeAgregar && !esFavorito) return null;

        const textoBoton = esFavorito
                ? sePuedeAgregar
                        ? "Agregado a mi agenda"
                        : "Quitar de mi agenda"
                : "Agregar a mi agenda";

        return (
                <>
                        <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel={
                                        esFavorito
                                                ? "Quitar de mi agenda"
                                                : "Agregar a mi agenda"
                                }
                                accessibilityState={{
                                        selected: esFavorito,
                                        disabled: guardando,
                                        busy: guardando,
                                }}
                                onPress={toggleFavorito}
                                disabled={guardando}
                                activeOpacity={0.7}
                                style={[
                                        styles.button,
                                        compacto && {
                                                paddingVertical: 10,
                                                minHeight: 44,
                                        },
                                        esFavorito
                                                ? styles.buttonAdded
                                                : styles.buttonAdd,
                                        guardando && styles.deshabilitado,
                                ]}
                        >
                                <Ionicons
                                        name={
                                                esFavorito
                                                        ? "calendar-clear"
                                                        : "calendar-outline"
                                        }
                                        size={20}
                                        color={esFavorito ? "#fff" : colors.primary}
                                />
                                <Text
                                        style={[
                                                styles.text,
                                                compacto && { fontSize: 14 },
                                                esFavorito
                                                        ? styles.textAdded
                                                        : styles.textAdd,
                                        ]}
                                >
                                        {textoBoton}
                                </Text>
                        </TouchableOpacity>
                        <ModalRequiereAuth
                                visible={mostrarAvisoAuth}
                                onClose={() => setMostrarAvisoAuth(false)}
                                titulo={
                                        status === "biometria_requerida"
                                                ? "Desbloqueá tu sesión"
                                                : "Iniciá sesión para tu agenda"
                                }
                                mensaje={
                                        status === "biometria_requerida"
                                                ? "Autenticá tu sesión para guardar eventos y recibir avisos."
                                                : "Iniciá sesión para guardar este evento en tu agenda y recibir recordatorios antes de que empiece."
                                }
                                status={status}
                        />
                </>
        );
}

const crearEstilos = (colors: typeof paletaColors) =>
        StyleSheet.create({
                button: {
                        width: "100%",
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                },
                buttonAdd: {
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                },
                buttonAdded: {
                        backgroundColor: colors.primarySolid,
                        borderColor: colors.primary,
                },
                deshabilitado: { opacity: 0.6 },
                text: {
                        fontSize: 16,
                        fontWeight: "bold",
                        marginLeft: 8,
                },
                textAdd: {
                        color: colors.primary,
                },
                textAdded: {
                        color: colors.onPrimary,
                },
        });
function useEstilos() {
        const tema = useTema();
        const colors = tema.colors;
        return { colors, styles: crearEstilos(colors) };
}
