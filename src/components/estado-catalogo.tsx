import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export function EstadoCatalogo({ sinConexion }: { sinConexion: boolean }) {

  if (!sinConexion) return null;
  return <View accessibilityRole="alert" style={styles.aviso}><Text style={styles.texto}>Sin conexion al servidor</Text></View>;
}

const styles = StyleSheet.create({
  aviso: { padding: spacing.sm, backgroundColor: colors.secondaryLight },
  texto: { color: colors.textSecondary, textAlign: 'center', fontSize: 14 },
});
