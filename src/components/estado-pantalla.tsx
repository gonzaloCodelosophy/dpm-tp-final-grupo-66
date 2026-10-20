import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { borderRadius, colors, fontSize, spacing } from '../styles/theme';

interface EstadoPantallaProps {
  tipo: 'cargando' | 'error' | 'vacio' | 'sinConexion';
  titulo?: string;
  mensaje?: string;
  accion?: string;
  onPress?: () => void;
}

const textos = {
  cargando: ['Cargando...', 'Esperá un momento.'],
  error: ['No pudimos cargar la información', 'Intentá de nuevo en unos momentos.'],
  vacio: ['No encontramos resultados', 'Probá con otra búsqueda o categoría.'],
  sinConexion: ['Sin conexión', 'Revisá tu conexión a internet e intentá de nuevo.'],
};

export function EstadoPantalla({ tipo, titulo, mensaje, accion = 'Reintentar', onPress }: EstadoPantallaProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {tipo === 'cargando' ? <ActivityIndicator size="large" color={colors.primary} /> : (
        <Ionicons name={tipo === 'error' ? 'alert-circle-outline' : tipo === 'sinConexion' ? 'cloud-offline-outline' : 'search-outline'} size={42} color={colors.secondary} />
      )}
      <Text style={styles.titulo}>{titulo ?? textos[tipo][0]}</Text>
      <Text style={styles.mensaje}>{mensaje ?? textos[tipo][1]}</Text>
      {onPress && <Pressable accessibilityRole="button" onPress={onPress} style={styles.boton}><Text style={styles.accion}>{accion}</Text></Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.background },
  titulo: { fontSize: fontSize.subtitle, fontWeight: '700', color: colors.text, textAlign: 'center' },
  mensaje: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: 'center' },
  boton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, backgroundColor: colors.primary },
  accion: { fontSize: fontSize.body, color: colors.surface, fontWeight: '700', textAlign: 'center' },
});
