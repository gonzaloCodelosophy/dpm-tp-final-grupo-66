import { Stack } from 'expo-router';

// El flujo se navega dentro de Mi recorrido para conservar la barra inferior.
export default function RecorridoLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
