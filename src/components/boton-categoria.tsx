import type { ComponentProps } from "react";
import {
        Pressable,
        StyleSheet,
        Text,
        View,
        type StyleProp,
        type ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colorsInicio as colors } from "../styles/inicio";

export interface BotonCategoriaProps {
        nombre: string;
        icono: ComponentProps<typeof MaterialCommunityIcons>["name"];
        color: string;
        fondo: string;
        seleccionado?: boolean;
        deshabilitado?: boolean;
        multiple?: boolean;
        onPress: () => void;
        style?: StyleProp<ViewStyle>;
}

export function BotonCategoria({
        nombre,
        icono,
        color,
        fondo,
        seleccionado = false,
        deshabilitado = false,
        multiple = false,
        onPress,
        style,
}: BotonCategoriaProps) {
        return (
                <Pressable
                        accessibilityRole={multiple ? "checkbox" : "button"}
                        accessibilityLabel={nombre}
                        accessibilityState={
                                multiple
                                        ? {
                                                  checked: seleccionado,
                                                  disabled: deshabilitado,
                                          }
                                        : {
                                                  selected: seleccionado,
                                                  disabled: deshabilitado,
                                          }
                        }
                        disabled={deshabilitado}
                        onPress={onPress}
                        style={({ pressed }) => [
                                styles.boton,
                                style,
                                (pressed || deshabilitado) && styles.atenuado,
                        ]}
                >
                        <View
                                style={[
                                        styles.circulo,
                                        {
                                                backgroundColor: seleccionado
                                                        ? colors.primary
                                                        : fondo,
                                        },
                                ]}
                        >
                                <MaterialCommunityIcons
                                        name={icono}
                                        size={24}
                                        color={
                                                seleccionado
                                                        ? colors.surface
                                                        : color
                                        }
                                />
                                {multiple && seleccionado && (
                                        <View style={styles.marca}>
                                                <MaterialCommunityIcons
                                                        name="check"
                                                        size={12}
                                                        color={colors.primary}
                                                />
                                        </View>
                                )}
                        </View>
                        <Text
                                style={[
                                        styles.nombre,
                                        seleccionado && styles.seleccionado,
                                ]}
                        >
                                {nombre}
                        </Text>
                </Pressable>
        );
}

const styles = StyleSheet.create({
        boton: {
                width: 76,
                minHeight: 84,
                alignItems: "center",
                paddingVertical: 4,
                gap: 6,
        },
        circulo: {
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: "center",
                justifyContent: "center",
        },
        marca: {
                position: "absolute",
                right: 0,
                top: 0,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.primary,
        },
        nombre: {
                fontSize: 12,
                lineHeight: 16,
                textAlign: "center",
                color: colors.secondary,
        },
        seleccionado: { fontWeight: "600" },
        atenuado: { opacity: 0.6 },
});
