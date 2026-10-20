import { Platform } from "react-native";
import { colors } from "./theme";

export const colorsInicio = {
  ...colors,
  primary: "#F65F4F",
  secondary: "#073B53",
  primaryLight: "#FDE9E3",
  greenLight: "#EAF0E3",
  blueLight: "#E5F3F5",
  yellowLight: "#F5EBDD",
  background: "#FFFCF8",
  textSecondary: "#737781",
  border: "#F0EBE5",
};

export const fuenteTitulo = Platform.select({
  ios: "Georgia",
  android: "serif",
  web: "Georgia, serif",
});
