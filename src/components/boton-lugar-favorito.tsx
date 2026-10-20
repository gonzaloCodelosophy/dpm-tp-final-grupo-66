import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useFavoritos } from '../hooks/use-favoritos';
import { guardarFavorito } from '../services/favoritos.service';
import { colors } from '../styles/theme';

export function BotonLugarFavorito({ id }: { id: string }) {
  const { favoritos, cargando, error, reintentar } = useFavoritos([id]);
  const [guardando, setGuardando] = useState(false);
  const activo = favoritos.includes(id);

  const cambiar = async () => {
    if (guardando || cargando) return;
    if (error) {
      reintentar();
      Alert.alert('Mis favoritos', 'No pudimos leer tus favoritos. Intentá de nuevo en unos momentos.');
      return;
    }
    setGuardando(true);
    try {
      await guardarFavorito(id, !activo);
    } catch {
      Alert.alert('Mis favoritos', 'No pudimos guardar el cambio. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      accessibilityState={{ selected: activo, disabled: cargando || guardando, busy: guardando }}
      disabled={cargando || guardando}
      onPress={evento => { evento.stopPropagation(); void cambiar(); }}
      style={[styles.boton, activo && styles.activo, (cargando || guardando) && styles.deshabilitado]}
    >
      <Ionicons name={activo ? 'heart' : 'heart-outline'} size={24} color={activo ? colors.primary : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  activo: { backgroundColor: colors.primaryLight },
  deshabilitado: { opacity: 0.5 },
});
