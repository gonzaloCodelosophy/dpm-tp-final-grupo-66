import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTema } from '../context/tema.context';
import { ImagenPersistente } from './imagen-persistente';
import type { Visita } from '../types/Visita';
import type { Lugar } from '../types/Lugar';

function fechaVisita(fecha: string) {
  const valor = new Date(fecha);
  const opciones = { timeZone: 'America/Argentina/Buenos_Aires' };
  const dia = (date: Date) => date.toLocaleDateString('es-AR', opciones);
  const hora = valor.toLocaleTimeString('es-AR', { ...opciones, hour: '2-digit', minute: '2-digit' });

  return dia(valor) === dia(new Date())
    ? `Visitado hoy · ${hora}`
    : `Visitado el ${valor.toLocaleDateString('es-AR', { ...opciones, day: 'numeric', month: 'short', year: 'numeric' })} · ${hora}`;
}

export function TarjetaVisita({ visita, lugar, onPress }: { visita: Visita; lugar?: Lugar; onPress: () => void }) {
  const { colorsInicio: colors } = useTema();
  const tipos = {
    gps: { nombre: 'Por cercanía', icono: 'location-outline', color: colors.green, fondo: colors.greenLight },
    qr: { nombre: 'Código QR', icono: 'qr-code-outline', color: colors.blueText, fondo: colors.blueLight },
    manual: { nombre: 'Registro manual', icono: 'create-outline', color: colors.primary, fondo: colors.primaryLight },
  } as const;
  const tipo = tipos[visita.origen];
  const imagen = visita.fotoUri || lugar?.imagenes[0];
  const nota = visita.nota?.replace(/\s+/g, ' ').trim();
  const resumenNota = nota && nota.length > 60 ? `${nota.slice(0, 60).trimEnd()}…` : nota;
  const nombre = lugar?.nombre ?? 'Lugar visitado';
  const hora = new Date(visita.fechaHora).toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nombre}. ${fechaVisita(visita.fechaHora)}. ${tipo.nombre}. Ver visita`}
      style={({ pressed }) => [styles.tarjeta, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
    >
      {imagen ? <ImagenPersistente url={imagen} style={styles.imagen} /> : (
        <View style={[styles.imagen, styles.sinImagen, { backgroundColor: tipo.fondo }]}>
          <Ionicons name={tipo.icono} size={22} color={tipo.color} />
        </View>
      )}
      <View style={styles.detalle}>
        <Text numberOfLines={2} style={[styles.nombre, { color: colors.secondary }]}>{nombre}</Text>
        {resumenNota ? (
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.nota, { color: colors.textSecondary }]}>{resumenNota}</Text>
        ) : null}
        {!visita.sincronizada && <Text style={[styles.nota, { color: colors.textSecondary }]}>Pendiente de sincronizar</Text>}
        <View style={styles.filaHora}>
          <Ionicons name={tipo.icono} size={14} color={tipo.color} />
          <Text style={[styles.fecha, { color: colors.textSecondary }]}>{hora}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.secondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 6, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  imagen: { width: 48, height: 48, borderRadius: 9, alignSelf: 'flex-start', flexShrink: 0 },
  filaHora: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sinImagen: { alignItems: 'center', justifyContent: 'center' },
  detalle: { flex: 1, minWidth: 0, gap: 6 },
  nombre: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  nota: { fontSize: 12, lineHeight: 17 },
  fecha: { fontSize: 12, lineHeight: 18 },
});
