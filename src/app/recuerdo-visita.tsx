import { RequiereSesionVisita } from '../components/auth/requiere-sesion-visita';
import { usePopup } from '../context/popup.context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTema } from '../context/tema.context';
import { useAuth } from '../context/auth.context';
import { useCatalogo } from '../hooks/use-catalogo';
import { useDetallesLugares } from '../hooks/use-detalles-lugares';
import { useUbicacion } from '../hooks/use-ubicacion';
import { distanciaMetros } from '../services/distancias';
import { ImagenPersistente } from '../components/imagen-persistente';
import { useFavoritos } from '../hooks/use-favoritos';
import { SelectorLugarVisita } from '../components/selector-lugar-visita';
import type { Lugar } from '../types/Lugar';
import { registrarVisitaCercana, registrarVisitaManual, registrarVisitaQr } from '../services/visitas.service';
import { subirFotoVisita } from '../services/foto-visita.service';
import { RADIO_REGISTRO_METROS } from '../../constants/mapa';
import { colorsInicio, fuenteTitulo } from '../styles/inicio';
import { ModalRequiereAuth } from '../components/auth/modal-requiere-auth';

function RecuerdoVisitaScreen() {
  const mostrarPopup = usePopup();
  const router = useRouter();
  const { lugarId: parametroLugar, modo, codigoQr } = useLocalSearchParams<{ lugarId?: string | string[]; modo?: string; codigoQr?: string }>();
  const [modoManual] = useState(() => modo === 'manual');
  // El lugar de entrada forma parte del borrador; no cambia al actualizar el GPS.
  const [lugarIdInicial] = useState(() => typeof parametroLugar === 'string' ? parametroLugar : null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colorsInicio: colors } = useTema();
  const styles = crearEstilos(colors);
  const { usuario, status } = useAuth();
  const radioMetros = RADIO_REGISTRO_METROS;
  const ubicacion = useUbicacion();
  const { datos, cargando, hayMasLugares, cargarMasLugares, actualizando } = useCatalogo();
  const [elegido, setElegido] = useState<Lugar | null>(null);
  const [lugarDetectado, setLugarDetectado] = useState<Lugar | null>(null);
  const [fechaFormulario] = useState(() => new Date());
  const edicionIniciada = useRef(false);
  const [mostrarLugares, setMostrarLugares] = useState(modoManual);
  const [mostrarAvisoAuth, setMostrarAvisoAuth] = useState(false);
  const [altoVisible, setAltoVisible] = useState(0);
  const [altoFicha, setAltoFicha] = useState(0);
  const [nota, setNota] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fotoSubida, setFotoSubida] = useState<string | undefined>();
  const [guardando, setGuardando] = useState(false);
  const [eligiendo, setEligiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const solicitada = useRef(false);
  const enCurso = useRef(false);
  const guardada = useRef(false);
  const cuentaActual = useRef<string | undefined>(undefined);
  cuentaActual.current = status === 'autenticado' ? usuario?.id : undefined;
  const { solicitar, permiso, cargando: buscando } = ubicacion;

  useEffect(() => {
    if (modoManual || lugarIdInicial || solicitada.current || permiso === null || buscando) return;
    solicitada.current = true;
    void solicitar();
  }, [permiso, buscando, solicitar, lugarIdInicial, modoManual]);

  const cercano = useMemo(() => {
    if (modoManual || lugarIdInicial || !ubicacion.coordenadas) return null;
    return (datos?.lugares ?? []).filter(lugar => lugar.activo)
      .map(lugar => ({ lugar, distancia: distanciaMetros(ubicacion.coordenadas!, lugar.coordenadas) }))
      .filter(item => item.distancia <= radioMetros)
      .sort((a, b) => a.distancia - b.distancia)[0]?.lugar ?? null;
  }, [datos, ubicacion.coordenadas, radioMetros, modoManual, lugarIdInicial]);

  // La primera sugerencia queda fija; el seguimiento GPS no cambia el borrador.
  // Si ya empezó a editar sin lugar, debe elegirlo explícitamente en el selector.
  useEffect(() => {
    if (!lugarIdInicial && cercano && !edicionIniciada.current) {
      setLugarDetectado(anterior => anterior ?? cercano);
    }
  }, [cercano, lugarIdInicial]);

  const lugarBase = elegido ?? (lugarIdInicial ? datos?.lugares.find(lugar => lugar.id === lugarIdInicial) ?? null : lugarDetectado);
  const idLugar = lugarBase?.id ?? lugarIdInicial;
  const detallesLugar = useDetallesLugares(idLugar ? [idLugar] : [], lugarBase ? [lugarBase] : []);
  const lugarRegistro = detallesLugar.lugares.find(lugar => lugar.id === idLugar) ?? lugarBase;
  const registroQr = !elegido && typeof codigoQr === 'string' && Boolean(lugarIdInicial);
  const registroManual = !registroQr && (modoManual || Boolean(elegido || lugarIdInicial));
  const { favoritos } = useFavoritos(lugarRegistro ? [lugarRegistro.id] : []);
  const esFavorito = Boolean(lugarRegistro && favoritos.includes(lugarRegistro.id));

  async function elegirFoto() {
    edicionIniciada.current = true;
    setEligiendo(true);
    setError(null);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible });
      if (!resultado.canceled) {
        const elegida = resultado.assets[0];
        if (elegida.fileSize && elegida.fileSize > 5 * 1024 * 1024) throw new Error('La foto puede pesar hasta 5 MB.');
        if (elegida.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(elegida.mimeType)) throw new Error('Elegí una foto JPG, PNG o WEBP.');
        setFoto(elegida);
        setFotoSubida(undefined);
      }
    } catch (fallo) { setError(fallo instanceof Error ? fallo.message : 'No pudimos abrir tus fotos.'); }
    finally { setEligiendo(false); }
  }

  async function guardar() {
    if (enCurso.current || guardada.current || !lugarRegistro) return;
    const usuarioId = cuentaActual.current;
    if (!usuarioId) {
      setMostrarAvisoAuth(true);
      return;
    }
    edicionIniciada.current = true;
    enCurso.current = true;
    setGuardando(true);
    setError(null);
    try {
      let fotoUri = fotoSubida;
      if (foto && !fotoUri) {
        fotoUri = await subirFotoVisita(foto, usuarioId);
        setFotoSubida(fotoUri);
      }
      if (cuentaActual.current !== usuarioId) throw new Error('La cuenta cambió. Volvé a ingresar.');
      if (registroQr) await registrarVisitaQr(lugarRegistro, usuarioId, codigoQr!, { nota, fotoUri });
      else if (registroManual) await registrarVisitaManual(lugarRegistro, usuarioId, { nota, fotoUri });
      else await registrarVisitaCercana(lugarRegistro, usuarioId, { nota, fotoUri });
      guardada.current = true;
      mostrarPopup('Visita guardada', 'Guardamos tu recuerdo. Si no hay conexión, la visita se enviará cuando vuelva.',
        [{ text: 'Ver mi recorrido', onPress: cerrarExito }], { onDismiss: cerrarExito });
    } catch (fallo) { setError(fallo instanceof Error ? fallo.message : 'No pudimos guardar la visita.'); }
    finally { enCurso.current = false; setGuardando(false); }
  }

  function cerrarExito() {
    router.dismissTo('/(tabs)/recorrido');
  }

  const selectorLugares = (
    <SelectorLugarVisita
                lugares={datos?.lugares ?? []} categorias={datos?.categorias ?? []} posicion={ubicacion.coordenadas}
                hayMas={hayMasLugares} cargando={cargando || actualizando}
                onSeleccionar={lugar => { edicionIniciada.current = true; setElegido(lugar); setMostrarLugares(false); setError(null); }}
                onCargarMas={() => { void cargarMasLugares().catch(() => setError('No pudimos cargar más lugares. Intentá de nuevo.')); }}
              />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: !guardando }} />
      <View style={[styles.cabecera, { height: insets.top + 64, paddingTop: insets.top }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver a Mi recorrido" disabled={guardando} onPress={() => router.dismissTo('/(tabs)/recorrido')} style={styles.volver}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </Pressable>
        <Image source={require('../../assets/images/logo-colon.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[1]}
          onLayout={evento => setAltoVisible(evento.nativeEvent.layout.height)}
        >
          <View style={[styles.portada, { height: Math.max(160, Math.min(width * 0.72, 320) - 64) }]}>
            {lugarRegistro?.imagenes[0] ? (
              <ImagenPersistente url={lugarRegistro.imagenes[0]} style={styles.imagenPortada} contentFit="cover" />
            ) : lugarRegistro ? (
              <View style={styles.portadaVacia}>
                <Ionicons name="image-outline" size={46} color={colors.secondary} />
              </View>
            ) : (
              <View style={styles.portadaVacia}>
                <Ionicons name="location-outline" size={46} color={colors.secondary} />
                <Text style={styles.textoPortada}>Un nuevo recuerdo en Colón</Text>
                <Pressable disabled={guardando} accessibilityRole="button" accessibilityLabel="Elegir ubicación" hitSlop={8} onPress={() => { Keyboard.dismiss(); setMostrarLugares(true); }} style={({ pressed }) => [styles.elegirPortada, (pressed || guardando) && { opacity: 0.7 }]}>
                  <Ionicons name="refresh" size={16} color={colors.onPrimary} />
                  <Text style={styles.elegirPortadaTexto}>Elegir ubicación</Text>
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.ficha} onLayout={evento => setAltoFicha(evento.nativeEvent.layout.height)}>
            <View style={styles.filaTitulo}>
              <Text style={styles.titulo} numberOfLines={2} ellipsizeMode="tail" accessibilityLabel={lugarRegistro?.nombre ?? 'Registrar visita'}>{lugarRegistro?.nombre ?? 'Registrar visita'}</Text>
            </View>
            {lugarRegistro && <View style={styles.insignias}>
              <View style={styles.insignia}>
                <Ionicons name={registroQr ? 'qr-code-outline' : registroManual ? 'create-outline' : 'location-outline'} size={15} color={colors.secondary} />
                <Text style={styles.insigniaTexto}>{registroQr ? 'Lugar del QR' : registroManual ? 'Lugar seleccionado' : 'Lugar cercano'}</Text>
              </View>
              {esFavorito && <View style={[styles.insignia, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="heart" size={15} color={colors.error} />
                <Text style={[styles.insigniaTexto, { color: colors.error }]}>Favorito</Text>
              </View>}
            </View>}
            <View style={styles.metadatos}>
              <View style={styles.dato}>
                <Ionicons name="calendar-outline" size={16} color={colors.secondary} />
                <Text style={styles.textoDato}>Hoy · {fechaFormulario.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} h</Text>
              </View>
              <View style={styles.dato}>
                <Ionicons name={registroQr ? 'qr-code-outline' : registroManual ? 'create-outline' : 'location-outline'} size={16} color={colors.secondary} />
                <Text style={styles.textoDato}>{registroQr ? 'Registro QR' : registroManual ? 'Registro manual' : 'Registro GPS'}</Text>
              </View>
              {lugarRegistro && <Pressable disabled={guardando} accessibilityRole="button" accessibilityLabel="Cambiar ubicación" hitSlop={8} onPress={() => { Keyboard.dismiss(); setMostrarLugares(true); }} style={styles.cambiarLugar}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.textoElegir}>Cambiar ubicación</Text>
              </Pressable>}
            </View>
            <Text style={styles.seccionTitulo}>Mi recuerdo</Text>
          </View>
          <View style={[styles.cuerpoRecuerdo, { minHeight: Math.max(0, altoVisible - altoFicha) }]}>
            <TextInput
              accessibilityLabel="Mi recuerdo de la visita" placeholder="Un momento para recordar…" placeholderTextColor={colors.textSecondary}
              value={nota} onFocus={() => { edicionIniciada.current = true; }} onChangeText={texto => { edicionIniciada.current = true; setNota(texto); }} editable={!guardando} multiline maxLength={280} textAlignVertical="top" style={styles.nota}
            />
            <Text style={styles.contador}>{nota.length}/280</Text>
            <View style={styles.fotos}>
              {foto && (
                <View>
                  <Image source={{ uri: foto.uri }} style={styles.foto} contentFit="cover" />
                  <Pressable accessibilityRole="button" accessibilityLabel="Quitar foto" disabled={guardando} onPress={() => { setFoto(null); setFotoSubida(undefined); }} style={styles.quitar}>
                    <Ionicons name="close" size={18} color={colors.secondary} />
                  </Pressable>
                </View>
              )}
              <Pressable disabled={guardando || eligiendo} accessibilityRole="button" onPress={() => void elegirFoto()} style={styles.agregarFoto}>
                <Ionicons name="add" size={26} color={colors.primary} />
                <Text style={styles.enlace}>{eligiendo ? 'Abriendo fotos…' : foto ? 'Cambiar foto' : 'Agregar foto'}</Text>
              </Pressable>
            </View>
            {foto && <Text style={styles.ayuda}>La foto necesita conexión para guardarse. Podés adjuntar una imagen.</Text>}
            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <Pressable disabled={!lugarRegistro || guardando || eligiendo} accessibilityRole="button" onPress={() => void guardar()} style={[styles.guardar, (!lugarRegistro || guardando || eligiendo) && { opacity: 0.5 }]}>
              {guardando ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.guardarTexto}>Guardar visita</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={mostrarLugares} transparent animationType="fade" onRequestClose={() => setMostrarLugares(false)}>
        <SafeAreaView style={styles.fondoPopup}>
          <Pressable style={StyleSheet.absoluteFillObject} accessibilityRole="button" accessibilityLabel="Cerrar selector de lugares" onPress={() => setMostrarLugares(false)} />
          <View style={styles.popup} accessibilityViewIsModal>
            <View style={styles.cabeceraPopup}>
              <Text accessibilityRole="header" style={styles.tituloPopup}>{lugarRegistro ? 'Cambiar ubicación' : 'Elegir ubicación'}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={8} onPress={() => setMostrarLugares(false)} style={styles.cerrarPopup}>
                <Ionicons name="close" size={23} color={colors.secondary} />
              </Pressable>
            </View>
            {selectorLugares}
            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          </View>
        </SafeAreaView>
      </Modal>
      <ModalRequiereAuth
        visible={mostrarAvisoAuth}
        onClose={() => setMostrarAvisoAuth(false)}
        status={status}
        titulo={status === 'biometria_requerida' ? 'Desbloqueá tu sesión' : 'Iniciá sesión para guardar'}
        mensaje={status === 'biometria_requerida'
          ? 'Confirmá tu identidad con huella o rostro para registrar esta visita.'
          : 'Podés explorar los lugares y la guía como visitante, pero para registrar visitas y conservar tus recuerdos necesitás una cuenta.'}
      />
    </SafeAreaView>
  );
}

const crearEstilos = (colors: typeof colorsInicio) => StyleSheet.create({
  fondoPopup: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', paddingHorizontal: 18 },
  popup: { width: '100%', maxWidth: 520, maxHeight: '90%', alignSelf: 'center', backgroundColor: colors.background, borderRadius: 24, padding: 16 },
  cabeceraPopup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tituloPopup: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.secondary },
  cerrarPopup: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  cabecera: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 70, backgroundColor: colors.background, zIndex: 2 },
  volver: { position: 'absolute', left: 18, bottom: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 90, height: 48 }, contenido: { paddingBottom: 24 },
  portada: { backgroundColor: colors.blueLight, marginBottom: -26 },
  imagenPortada: { width: '100%', height: '100%' },
  portadaVacia: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  elegirPortada: { minHeight: 44, borderRadius: 22, backgroundColor: colors.primarySolid, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  elegirPortadaTexto: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  textoPortada: { color: colors.secondary, fontSize: 14 },
  ficha: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, backgroundColor: colors.background },
  cuerpoRecuerdo: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.background },
  insignias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  insignia: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.greenLight, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 16 },
  insigniaTexto: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  metadatos: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoDato: { color: colors.textSecondary, fontSize: 12 },
  cambiarLugar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoElegir: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  seccionTitulo: { fontSize: 19, fontWeight: '700', color: colors.secondary, marginTop: 22, marginBottom: 12 },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  titulo: { flex: 1, fontFamily: fuenteTitulo, fontSize: 28, fontWeight: '700', color: colors.secondary },
  nota: { minHeight: 72, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: colors.surface, fontSize: 15, lineHeight: 24, color: colors.textSecondary },
  contador: { textAlign: 'right', color: colors.textSecondary, fontSize: 12, marginTop: 6, marginBottom: 20 },
  fotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, foto: { width: 120, height: 100, borderRadius: 16 },
  quitar: { position: 'absolute', right: 4, top: 4, padding: 4, borderRadius: 16, backgroundColor: colors.surface },
  agregarFoto: { minWidth: 140, minHeight: 100, flex: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  enlace: { color: colors.primary, fontSize: 15, fontWeight: '600' }, ayuda: { fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginTop: 8 },
  guardar: { marginTop: 20, backgroundColor: colors.primarySolid, minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 14 }, guardarTexto: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  error: { color: colors.primary, fontSize: 14, lineHeight: 20, marginVertical: 12 },
});

export default function RecuerdoVisitaScreenProtegida() {
  return <RequiereSesionVisita><RecuerdoVisitaScreen /></RequiereSesionVisita>;
}
