import {
        Pressable,
        StyleSheet,
        type StyleProp,
        type ViewStyle,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useTema } from "../context/tema.context";

export function BotonVolver({
        onPress,
        style,
}: {
        onPress: () => void;
        style?: StyleProp<ViewStyle>;
}) {
        const { colorsInicio: colors } = useTema();
        return (
                <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver atrás"
                        onPress={onPress}
                        style={[
                                styles.boton,
                                {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                },
                                style,
                        ]}
                >
                        <Ionicons
                                name="chevron-back"
                                size={24}
                                color={colors.secondary}
                        />
                </Pressable>
        );
}

const styles = StyleSheet.create({
        boton: {
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
        },
});
