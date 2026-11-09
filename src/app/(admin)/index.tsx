import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTema } from '../../context/tema.context';
import { cambiarEstadoEvento, listarEventosAdmin, type EstadoEditable } from '../../services/admin-eventos.service';
import { errorDatos } from '../../services/errores';
import type { Evento } from '../../types/evento';
const acciones: { estado: EstadoEditable; titulo: string }[] = [
 { estado: 'programado', titulo: 'Programar' }, { estado: 'suspendido', titulo: 'Suspender' }, { estado: 'cancelado', titulo: 'Cancelar evento' },
];
const etiquetas = { programado: 'Programado', suspendido: 'Suspendido', cancelado: 'Cancelado', finalizado: 'Finalizado' };
export default function EventosAdmin() {
 const { colors } = useTema();
 const [eventos, setEventos] = useState<Evento[]>([]);
 const [pagina, setPagina] = useState(1);
 const [hayMas, setHayMas] = useState(false);
 const [cargando, setCargando] = useState(true);
 const [guardando, setGuardando] = useState(false);
 const [error, setError] = useState('');
 const [aviso, setAviso] = useState('');
 const [seleccion, setSeleccion] = useState<{ evento: Evento; estado: EstadoEditable } | null>(null);
 const enCurso = useRef(false);
 const cargar = useCallback(async (numero = 1) => {
  if (enCurso.current) return;
  enCurso.current = true; setCargando(true); setError('');
  try {
   const resultado = await listarEventosAdmin(numero);
   setEventos(prev => numero === 1 ? resultado.datos : [...prev.filter(e => !resultado.datos.some(n => n.id === e.id)), ...resultado.datos]);
   setPagina(numero); setHayMas(numero * resultado.meta.porPagina < resultado.meta.total);
  } catch (e) { setError(errorDatos(e).mensaje); }
  finally { setCargando(false); enCurso.current = false; }
 }, []);
 useEffect(() => { void cargar(); }, [cargar]);
 async function confirmar() {
  if (!seleccion || enCurso.current) return;
  enCurso.current = true; setGuardando(true); setError(''); setAviso('');
  try {
   const actualizado = await cambiarEstadoEvento(seleccion.evento.id, seleccion.estado);
   setEventos(prev => prev.map(e => e.id === actualizado.id ? actualizado : e));
   setAviso(`Estado actualizado: ${etiquetas[actualizado.estado].toLowerCase()}.`);
  } catch (e) { setError(errorDatos(e).mensaje); }
  finally { setGuardando(false); setSeleccion(null); enCurso.current = false; }
 }
 const boton = (texto: string, onPress: () => void, disabled = false, peligro = false) => <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.boton, { borderColor: colors.border, opacity: disabled ? 0.45 : 1 }]}><Text style={{ color: peligro ? colors.error : colors.secondary, fontWeight: '500' }}>{texto}</Text></Pressable>;
 return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
 <View style={styles.cabecera}><Text style={{ fontSize: 26, fontWeight: '600', color: colors.text }}>Eventos</Text>{boton('Actualizar', () => { setAviso(''); void cargar(); }, cargando || guardando)}</View>
 {error ? <View style={styles.mensaje}><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>{boton('Reintentar', () => { void cargar(); }, cargando || guardando)}</View> : null}
 {aviso ? <Text accessibilityLiveRegion="polite" style={[styles.mensaje, { color: colors.secondary }]}>{aviso}</Text> : null}
 <FlatList data={eventos} keyExtractor={item => item.id} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 }}
 ListEmptyComponent={cargando ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : <Text style={{ color: colors.textSecondary, marginTop: 24 }}>{error ? 'La lista no está disponible.' : 'No hay eventos desde hoy.'}</Text>}
 renderItem={({ item }) => <View style={[styles.evento, { borderBottomColor: colors.border }]}>
 <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{item.titulo}</Text>
 <Text style={{ color: colors.textSecondary }}>{new Date(item.inicio).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short' })}</Text>
 {item.direccionLibre ? <Text style={{ color: colors.textSecondary }}>{item.direccionLibre}</Text> : null}
 <Text style={{ color: item.estado === 'cancelado' ? colors.error : colors.secondary }}>{etiquetas[item.estado]}</Text>
 {item.estado !== 'finalizado' ? <View style={styles.acciones}>{acciones.filter(a => a.estado !== item.estado).map(a => <View key={a.estado}>{boton(a.titulo, () => setSeleccion({ evento: item, estado: a.estado }), cargando || guardando, a.estado === 'cancelado')}</View>)}</View> : null}
 </View>}
 ListFooterComponent={eventos.length ? <View style={{ paddingTop: 20 }}>{cargando ? <ActivityIndicator color={colors.primary} /> : hayMas ? boton('Cargar más', () => { void cargar(pagina + 1); }, guardando) : null}</View> : null} />
 <Modal visible={!!seleccion} transparent animationType="fade" onRequestClose={() => { if (!guardando) setSeleccion(null); }}>
 <View style={styles.overlay}><View accessibilityViewIsModal style={[styles.modal, { backgroundColor: colors.surface }]}>
 <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>Cambiar estado</Text>
 <Text style={{ color: colors.text }}>¿Pasar «{seleccion?.evento.titulo}» a {seleccion ? etiquetas[seleccion.estado].toLowerCase() : ''}?</Text>
 <Text style={{ color: colors.textSecondary }}>Se avisará a quienes guardaron el evento.</Text>
 {guardando ? <ActivityIndicator color={colors.primary} /> : <View style={styles.acciones}>{boton('Volver', () => setSeleccion(null))}{boton('Confirmar', () => { void confirmar(); }, false, seleccion?.estado === 'cancelado')}</View>}
 </View></View></Modal>
 </SafeAreaView>;
}
const styles = StyleSheet.create({
 cabecera: { padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
 mensaje: { marginHorizontal: 24, marginBottom: 12, gap: 8 },
 evento: { paddingVertical: 20, borderBottomWidth: 1, gap: 8 },
 acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
 boton: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
 overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
 modal: { padding: 24, borderRadius: 12, gap: 16, width: '100%', maxWidth: 420, alignSelf: 'center' },
});
