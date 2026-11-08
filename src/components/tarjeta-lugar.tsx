import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTema } from '../context/tema.context';
import { useUbicacion } from '../hooks/use-ubicacion';
import { BotonLugarFavorito } from './boton-lugar-favorito';
import { ImagenPersistente } from './imagen-persistente';
import { distanciaMetros, textoDistancia } from '../services/distancias';
import { fuenteTitulo } from '../styles/inicio';
import type { Lugar } from '../types/Lugar';

function horarioHoy(lugar: Lugar) {
  if (!lugar.horarios.length) return 'Consultar horarios';
  const dia = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(new Date());
  const indice = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dia);
  const horarios = lugar.horarios.filter(horario => horario.dia === indice);

  return horarios.length ? horarios.map(horario => `${horario.abre} a ${horario.cierra}`).join(' · ') : 'Hoy cerrado';
}

export function TarjetaLugar({ lugar, nombreCategoria, onPress }: { lugar: Lugar; nombreCategoria: string; onPress: () => void }) {
  const { colorsInicio: colors } = useTema();
  const { coordenadas } = useUbicacion();
  const distancia = coordenadas ? `a ${textoDistancia(distanciaMetros(coordenadas, lugar.coordenadas))}` : lugar.direccion;

  return (
    <View style={[styles.tarjeta, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${lugar.nombre}. ${nombreCategoria}. Ver lugar`} onPress={onPress} style={({ pressed }) => [styles.fila, pressed && { opacity: 0.8 }]}>
        {lugar.imagenes[0] ? <ImagenPersistente url={lugar.imagenes[0]} style={styles.imagen} /> : <View style={[styles.imagen, styles.sinImagen, { backgroundColor: colors.secondaryLight }]}><Ionicons name="image-outline" size={30} color={colors.textSecondary} /></View>}
        <View style={styles.contenido}>
          <Text numberOfLines={2} style={[styles.nombre, { color: colors.secondary }]}>{lugar.nombre}</Text>
          <View style={styles.dato}><Ionicons name="location-outline" size={16} color={colors.secondary} /><Text numberOfLines={1} style={[styles.texto, { color: colors.secondary }]}>{distancia}</Text></View>
          <View style={styles.dato}><Ionicons name="time-outline" size={16} color={colors.secondary} /><Text numberOfLines={1} style={[styles.texto, { color: colors.secondary }]}>{horarioHoy(lugar)}</Text></View>
        </View>
        <Ionicons name="chevron-forward" size={21} color={colors.secondary} style={styles.flecha} />
      </Pressable>
      <View style={styles.favorito}><BotonLugarFavorito id={lugar.id} soloIcono /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 18, marginBottom: 6, overflow: 'hidden' },
  fila: { flexDirection: 'row', alignItems: 'center', minHeight: 94, padding: 5, gap: 10 },
  imagen: { width: 84, height: 84, borderRadius: 11, alignSelf: 'flex-start', flexShrink: 0 },
  sinImagen: { alignItems: 'center', justifyContent: 'center' },
  contenido: { flex: 1, minWidth: 0, paddingVertical: 5, paddingRight: 34, gap: 4 },
  nombre: { fontFamily: fuenteTitulo, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 5 }, texto: { flex: 1, fontSize: 11, lineHeight: 16 },
  favorito: { position: 'absolute', right: 4, top: 2 }, flecha: { position: 'absolute', right: 14, bottom: 18 },
});
