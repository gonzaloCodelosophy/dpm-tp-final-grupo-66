import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export function EstadoCatalogo({ sinConexion, error = false }: { sinConexion: boolean; error?: boolean }) {

  if (!sinConexion && !error) return null;
  return <View accessibilityRole="alert" style={styles.aviso}><Text style={styles.texto}>No pudimos actualizar los lugares. Mostramos la información guardada.</Text></View>;
}

const styles = StyleSheet.create({
  aviso: { padding: spacing.sm, backgroundColor: colors.secondaryLight },
  texto: { color: colors.textSecondary, textAlign: 'center', fontSize: 14 },
});
