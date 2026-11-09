import { usePopup } from '../../../../context/popup.context';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../../../context/auth.context';
import { useTema } from '../../../../context/tema.context';
import { useDetallesLugares } from '../../../../hooks/use-detalles-lugares';
import { ImagenPersistente } from '../../../../components/imagen-persistente';
import { useFavoritos } from '../../../../hooks/use-favoritos';
import { EstadoPantalla } from '../../../../components/estado-pantalla';
import { obtenerVisitaRegistrada, observarVisitas } from '../../../../services/visitas.service';
import { abrirIndicaciones } from '../../../../services/navegacion.service';
import { fuenteTitulo, colorsInicio } from '../../../../styles/inicio';
import type { Visita } from '../../../../types/Visita';

const origenes = {
  gps: { texto: 'Registrada por GPS', icono: 'location-outline' },
  qr: { texto: 'Registrada con código QR', icono: 'qr-code-outline' },
  manual: { texto: 'Registrada manualmente', icono: 'create-outline' },
} as const;

export default function DetalleVisitaScreen() {
  const mostrarPopup = usePopup();
  const { id: parametro } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(parametro) ? parametro[0] : parametro;
  const router = useRouter();
  const enfocada = useIsFocused();
  const { width } = useWindowDimensions();
  const { colorsInicio: colors } = useTema();
  const styles = crearEstilos(colors);
  const { usuario, status } = useAuth();
  const usuarioId = status === 'autenticado' ? usuario?.id : undefined;
  const [dato, setDato] = useState<Visita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const visita = dato?.usuarioId === usuarioId && dato?.id === id ? dato : null;
  const detalles = useDetallesLugares(visita ? [visita.lugarId] : [], []);
  const lugar = detalles.lugares.find(item => item.id === visita?.lugarId);
  const imagen = visita?.fotoUri || lugar?.imagenes[0];
  const { favoritos } = useFavoritos(visita ? [visita.lugarId] : []);
  const esFavorito = Boolean(visita && favoritos.includes(visita.lugarId));

  useEffect(() => {
    if (!enfocada) return;
    let vigente = true;
    let turno = 0;
    const cargar = async () => {
      const solicitud = ++turno;
      if (!usuarioId || !id) { setCargando(false); return; }
      setCargando(true);
      setError(false);
      try {
        const nueva = await obtenerVisitaRegistrada(id, usuarioId);
        if (vigente && solicitud === turno) setDato(nueva);
      } catch {
        if (vigente && solicitud === turno) setError(true);
      } finally {
        if (vigente && solicitud === turno) setCargando(false);
      }
    };
    void cargar();
    const quitar = observarVisitas(cuenta => { if (cuenta === usuarioId) void cargar(); });

    return () => { vigente = false; quitar(); };
  }, [id, usuarioId, intento, enfocada]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.cabecera}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver a Mi recorrido" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/recorrido')} style={styles.volver}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </Pressable>
        <Image source={require('../../../../../assets/images/logo-colon.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
      </View>
      {!usuarioId ? (
        <EstadoPantalla tipo={status === 'cargando' ? 'cargando' : 'vacio'} titulo="Ingresá a tu cuenta" mensaje="Esta visita pertenece a tu recorrido personal." accion="Ir al perfil" onPress={() => router.navigate('/(tabs)/perfil')} />
      ) : cargando && !visita ? <EstadoPantalla tipo="cargando" /> : error && !visita ? (
        <EstadoPantalla tipo="error" mensaje="No pudimos cargar la visita." onPress={() => setIntento(valor => valor + 1)} />
      ) : !visita ? <EstadoPantalla tipo="vacio" titulo="Visita no encontrada" mensaje="No encontramos esta visita en tu recorrido." /> : (
        <ScrollView contentContainerStyle={styles.contenido}>
          {imagen ? <ImagenPersistente url={imagen} style={[styles.portada, { height: Math.min(width * 0.72, 320) }]} /> : (
            <View style={[styles.portada, styles.sinImagen]}><Ionicons name="image-outline" size={46} color={colors.secondary} /></View>
          )}
          <View style={styles.ficha}>
            <Text style={styles.titulo}>{lugar?.nombre ?? 'Mi visita'}</Text>
            <View style={styles.insignias}>
              <View style={styles.insignia}><Ionicons name="checkmark-circle-outline" size={16} color={colors.secondary} /><Text style={styles.insigniaTexto}>Visitado</Text></View>
              {esFavorito && <View style={[styles.insignia, { backgroundColor: colors.primaryLight }]}><Ionicons name="heart" size={16} color={colors.error} /><Text style={[styles.insigniaTexto, { color: colors.error }]}>Favorito</Text></View>}
            </View>
            <Text style={styles.seccion}>Mi recuerdo</Text>
            <View style={styles.recuerdo}><Text style={[styles.nota, !visita.nota && { color: colors.textSecondary }]}>{visita.nota || 'No agregaste una nota a esta visita.'}</Text></View>
            <Text style={styles.seccion}>Datos de la visita</Text>
            <View style={styles.fila}><Ionicons name="calendar-outline" size={19} color={colors.secondary} /><Text style={styles.dato}>{new Date(visita.fechaHora).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></View>
            <View style={styles.fila}><Ionicons name={origenes[visita.origen].icono} size={19} color={colors.secondary} /><Text style={styles.dato}>{origenes[visita.origen].texto}</Text></View>
            <View style={styles.fila}><Ionicons name={visita.sincronizada ? 'cloud-done-outline' : 'cloud-upload-outline'} size={19} color={colors.secondary} /><Text style={styles.dato}>{visita.sincronizada ? 'Visita sincronizada' : 'Guardada en el teléfono · pendiente de envío'}</Text></View>
            <Text style={styles.seccion}>El lugar</Text>
            {lugar ? <>
              <Text style={styles.dato}>{lugar.descripcionCorta}</Text>
              <View style={styles.fila}><Ionicons name="location-outline" size={19} color={colors.secondary} /><Text style={styles.dato}>{lugar.direccion}</Text></View>
              <Pressable accessibilityRole="button" onPress={() => void abrirIndicaciones(lugar.coordenadas).catch(() => mostrarPopup('No pudimos abrir el mapa', 'Intentá de nuevo.'))} style={styles.boton}><Ionicons name="navigate-outline" size={20} color={colors.primary} /><Text style={styles.botonTexto}>Cómo llegar</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/(tabs)/explore/lugar/[id]', params: { id: lugar.id } })} style={styles.boton}><Ionicons name="map-outline" size={20} color={colors.primary} /><Text style={styles.botonTexto}>Ver lugar</Text></Pressable>
            </> : <Text style={styles.dato}>{detalles.cargando ? 'Cargando información del lugar…' : 'La información del lugar no está disponible en este momento.'}</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const crearEstilos = (colors: typeof colorsInicio) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cabecera: { height: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 70 },
  volver: { position: 'absolute', left: 18, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 90, height: 48 },
  contenido: { paddingBottom: 28 }, portada: { width: '100%', height: 220, backgroundColor: colors.blueLight }, sinImagen: { alignItems: 'center', justifyContent: 'center' },
  ficha: { marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, backgroundColor: colors.background },
  titulo: { fontFamily: fuenteTitulo, fontSize: 28, fontWeight: '700', color: colors.secondary, marginBottom: 12 },
  insignias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  insignia: { flexDirection: 'row', gap: 5, alignItems: 'center', alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.greenLight }, insigniaTexto: { fontSize: 12, fontWeight: '600', color: colors.secondary },
  seccion: { fontSize: 19, fontWeight: '700', color: colors.secondary, marginTop: 24, marginBottom: 12 },
  recuerdo: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, nota: { fontSize: 15, lineHeight: 24, color: colors.textSecondary },
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginVertical: 7 }, dato: { flexShrink: 1, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  boton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: colors.primary, padding: 14, borderRadius: 16, marginTop: 16 }, botonTexto: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
